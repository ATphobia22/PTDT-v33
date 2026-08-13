"""Redis Streams → WebSocket broadcaster for sealed Box3D physics envelopes.

Only seal-verified envelopes are forwarded to Unity clients.
Optional state diffing reduces bandwidth when clients advertise last_sequence.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import redis.asyncio as redis
import websockets
from websockets.server import WebSocketServerProtocol

from .box3d_contract import Box3DPhysicsState, verify_state_seal
from .state_diff import diff_states, should_send_keyframe

logger = logging.getLogger("PTDT.PhysicsBroadcaster")

connected_clients: set[WebSocketServerProtocol] = set()
_client_last_seq: dict[int, int] = {}
_last_full_state: Box3DPhysicsState | None = None


async def redis_stream_listener(
    redis_url: str = "redis://localhost:6379",
    stream_name: str = "ptdt:scene:physics",
) -> None:
    global _last_full_state
    client = redis.from_url(redis_url, decode_responses=True)
    last_id = "$"
    logger.info("Listening on Redis stream %s", stream_name)

    while True:
        try:
            messages = await client.xread({stream_name: last_id}, count=8, block=1000)
            for _stream, msgs in messages:
                for msg_id, payload in msgs:
                    last_id = msg_id
                    raw_json = payload.get("envelope_json")
                    if not raw_json:
                        continue
                    try:
                        state = Box3DPhysicsState.model_validate_json(raw_json)
                    except Exception as exc:
                        logger.error("Invalid physics payload: %s", exc)
                        continue
                    if not verify_state_seal(state):
                        logger.critical(
                            "STATE SEAL VERIFICATION FAILED sequence=%s", state.sequence
                        )
                        continue
                    await _broadcast_state(state)
                    _last_full_state = state
        except Exception as exc:
            logger.error("Redis stream error: %s", exc)
            await asyncio.sleep(1.0)


async def _broadcast_state(state: Box3DPhysicsState) -> None:
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
                if not should_send_keyframe(delta, body_count=len(state.bodies)):
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
) -> None:
    async with websockets.serve(websocket_handler, host, port):
        logger.info("WebSocket broadcaster on ws://%s:%s", host, port)
        await redis_stream_listener(redis_url=redis_url)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
