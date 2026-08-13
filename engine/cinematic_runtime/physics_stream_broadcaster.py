"""Redis Streams → WebSocket broadcaster for sealed Box3D physics envelopes.

Uses a Redis **consumer group** so multiple broadcaster replicas can share work
without double-delivery races (XREADGROUP + XACK).

Only seal-verified envelopes are forwarded. Optional O(N) state diffs reduce
bandwidth when a client has already applied the previous sequence.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import socket
from typing import Any

import redis.asyncio as redis
import websockets
from websockets.server import WebSocketServerProtocol

from .box3d_contract import Box3DPhysicsState, verify_state_seal
from .state_diff import diff_states, should_send_keyframe

logger = logging.getLogger("PTDT.PhysicsBroadcaster")

DEFAULT_STREAM = "ptdt:scene:physics"
DEFAULT_GROUP = "ptdt-physics-broadcasters"
DEFAULT_CONSUMER = f"broadcaster-{socket.gethostname()}-{os.getpid()}"

connected_clients: set[WebSocketServerProtocol] = set()
_client_last_seq: dict[int, int] = {}
_last_full_state: Box3DPhysicsState | None = None


async def ensure_consumer_group(
    client: redis.Redis,
    stream_name: str,
    group_name: str,
) -> None:
    try:
        await client.xgroup_create(stream_name, group_name, id="$", mkstream=True)
        logger.info("Created consumer group %s on %s", group_name, stream_name)
    except redis.ResponseError as exc:
        if "BUSYGROUP" in str(exc):
            logger.debug("Consumer group %s already exists", group_name)
        else:
            raise


async def redis_stream_listener(
    redis_url: str = "redis://localhost:6379",
    stream_name: str = DEFAULT_STREAM,
    group_name: str = DEFAULT_GROUP,
    consumer_name: str = DEFAULT_CONSUMER,
    block_ms: int = 1000,
    count: int = 16,
) -> None:
    global _last_full_state
    client = redis.from_url(redis_url, decode_responses=True)
    await ensure_consumer_group(client, stream_name, group_name)

    try:
        pending = await client.xpending_range(
            stream_name, group_name, min="-", max="+", count=32
        )
        for entry in pending or []:
            idle_ms = int(
                entry.get("time_since_delivered", 0) or entry.get("idle", 0) or 0
            )
            if idle_ms < 30_000:
                continue
            msg_id = entry.get("message_id") or entry.get("id")
            if not msg_id:
                continue
            claimed = await client.xclaim(
                stream_name,
                group_name,
                consumer_name,
                min_idle_time=30_000,
                message_ids=[msg_id],
            )
            for cid, fields in claimed or []:
                await _handle_stream_fields(fields)
                await client.xack(stream_name, group_name, cid)
    except Exception as exc:
        logger.warning("PEL recovery skipped: %s", exc)

    logger.info(
        "Consumer %s listening group=%s stream=%s",
        consumer_name,
        group_name,
        stream_name,
    )

    while True:
        try:
            messages = await client.xreadgroup(
                groupname=group_name,
                consumername=consumer_name,
                streams={stream_name: ">"},
                count=count,
                block=block_ms,
            )
            if not messages:
                continue
            for _stream, msgs in messages:
                for msg_id, fields in msgs:
                    try:
                        await _handle_stream_fields(fields)
                        await client.xack(stream_name, group_name, msg_id)
                    except Exception as exc:
                        logger.error("Failed message %s: %s", msg_id, exp if False else exc)
        except Exception as exc:
            logger.error("Redis consumer error: %s", exc)
            await asyncio.sleep(1.0)


async def _handle_stream_fields(fields: dict[str, Any]) -> None:
    global _last_full_state
    raw_json = fields.get("envelope_json")
    if not raw_json:
        return
    try:
        state = Box3DPhysicsState.model_validate_json(raw_json)
    except Exception as exc:
        logger.error("Invalid physics payload: %s", exc)
        return
    if not verify_state_seal(state):
        logger.critical("STATE SEAL VERIFICATION FAILED sequence=%s", state.sequence)
        return
    await _broadcast_state(state)
    _last_full_state = state


async def _broadcast_state(state: Box3DPhysicsState) -> None:
    """Wire O(N) state_diff immediately before send (omit unmoved bodies)."""
    if not connected_clients:
        return
    full_json = state.model_dump_json()
    dead: list[WebSocketServerProtocol] = []

    for ws in list(connected_clients):
        try:
            key = id(ws)
            last = _client_last_seq.get(key, -1)
            payload = full_json
            if (
                _last_full_state is not None
                and last == _last_full_state.sequence
                and last >= 0
            ):
                delta = diff_states(_last_full_state, state)
                if not should_send_keyframe(delta, body_count=max(1, len(state.bodies))):
                    payload = json.dumps(
                        {
                            "type": "physics_diff",
                            "from_sequence": delta.from_sequence,
                            "to_sequence": delta.to_sequence,
                            "pipeline_state_version": delta.pipeline_state_version,
                            "to_seal": delta.to_seal,
                            "added": [_body_dict(d.body) for d in delta.added if d.body],
                            "updated": [_body_dict(d.body) for d in delta.updated if d.body],
                            "removed": [d.entity_id for d in delta.removed],
                            "unchanged_count": delta.unchanged_count,
                        },
                        separators=(",", ":"),
                    )
            await ws.send(payload)
            _client_last_seq[key] = state.sequence
        except Exception as exc:
            logger.warning("Client send failed: %s", exc)
            dead.append(ws)

    for ws in dead:
        connected_clients.discard(ws)
        _client_last_seq.pop(id(ws), None)


def _body_dict(body: Any) -> dict[str, Any]:
    return body.model_dump(mode="json")


async def websocket_handler(websocket: WebSocketServerProtocol) -> None:
    connected_clients.add(websocket)
    _client_last_seq[id(websocket)] = -1
    logger.info("Unity client connected (%s total)", len(connected_clients))
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if isinstance(data, dict) and "ack_sequence" in data:
                    _client_last_seq[id(websocket)] = int(data["ack_sequence"])
            except Exception:
                pass
    finally:
        connected_clients.discard(websocket)
        _client_last_seq.pop(id(websocket), None)
        logger.info("Unity client disconnected (%s total)", len(connected_clients))


async def main(
    host: str = "0.0.0.0",
    port: int = 8080,
    redis_url: str = "redis://localhost:6379",
    stream_name: str = DEFAULT_STREAM,
    group_name: str = DEFAULT_GROUP,
    consumer_name: str = DEFAULT_CONSUMER,
) -> None:
    async with websockets.serve(websocket_handler, host, port):
        logger.info("WebSocket broadcaster on ws://%s:%s", host, port)
        await redis_stream_listener(
            redis_url=redis_url,
            stream_name=stream_name,
            group_name=group_name,
            consumer_name=consumer_name,
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
