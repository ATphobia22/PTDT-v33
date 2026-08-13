using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace PTDT.Box3D
{
    /// <summary>
    /// Resilient WebSocket client for seal-verified PTDT physics envelopes.
    /// Network receive runs off the main thread; ApplyJsonState is main-thread only.
    /// </summary>
    [RequireComponent(typeof(PTDTBox3DStateSynchronizer))]
    [DisallowMultipleComponent]
    public sealed class PTDTBox3DWebSocketClient : MonoBehaviour
    {
        public enum ConnectionState
        {
            Disconnected = 0,
            Connecting = 1,
            Connected = 2,
            Reconnecting = 3,
        }

        [SerializeField] private string webSocketUrl = "ws://127.0.0.1:8080";
        [SerializeField] private bool autoConnect = true;
        [SerializeField] private int receiveBufferBytes = 64 * 1024;
        [SerializeField] private float initialReconnectSeconds = 1.0f;
        [SerializeField] private float maxReconnectSeconds = 30.0f;
        [SerializeField] private bool sendSequenceAcks = true;

        private PTDTBox3DStateSynchronizer synchronizer;
        private ClientWebSocket webSocket;
        private CancellationTokenSource cancellationTokenSource;

        private string latestJsonPayload = string.Empty;
        private bool hasNewPayload;
        private readonly object payloadLock = new object();

        private ConnectionState state = ConnectionState.Disconnected;
        private float reconnectSeconds;

        public ConnectionState State => state;

        private void Awake()
        {
            synchronizer = GetComponent<PTDTBox3DStateSynchronizer>();
            if (synchronizer == null)
                throw new InvalidOperationException("PTDTBox3DWebSocketClient requires PTDTBox3DStateSynchronizer.");
            if (receiveBufferBytes < 4096)
                throw new InvalidOperationException("Receive buffer must be at least 4KB.");
            if (!float.IsFinite(initialReconnectSeconds) || initialReconnectSeconds <= 0.0f)
                throw new InvalidOperationException("initialReconnectSeconds must be finite and > 0.");
            if (!float.IsFinite(maxReconnectSeconds) || maxReconnectSeconds < initialReconnectSeconds)
                throw new InvalidOperationException("maxReconnectSeconds must be >= initialReconnectSeconds.");
            reconnectSeconds = initialReconnectSeconds;
        }

        private void Start()
        {
            if (autoConnect)
                _ = ConnectLoopAsync();
        }

        private void Update()
        {
            if (!hasNewPayload) return;
            string jsonToApply;
            lock (payloadLock)
            {
                jsonToApply = latestJsonPayload;
                hasNewPayload = false;
            }
            if (string.IsNullOrEmpty(jsonToApply)) return;
            synchronizer.ApplyJsonState(jsonToApply);
        }

        private void OnDestroy()
        {
            cancellationTokenSource?.Cancel();
            DisposeSocket();
        }

        public void Connect()
        {
            if (cancellationTokenSource == null || cancellationTokenSource.IsCancellationRequested)
            {
                cancellationTokenSource = new CancellationTokenSource();
                _ = ConnectLoopAsync();
            }
        }

        public void Disconnect()
        {
            cancellationTokenSource?.Cancel();
            DisposeSocket();
            state = ConnectionState.Disconnected;
        }

        private async Task ConnectLoopAsync()
        {
            if (cancellationTokenSource == null)
                cancellationTokenSource = new CancellationTokenSource();
            var token = cancellationTokenSource.Token;
            while (!token.IsCancellationRequested)
            {
                state = state == ConnectionState.Disconnected
                    ? ConnectionState.Connecting
                    : ConnectionState.Reconnecting;
                webSocket = new ClientWebSocket();
                try
                {
                    Debug.Log($"[PTDT] Connecting physics stream {webSocketUrl} ({state})");
                    await webSocket.ConnectAsync(new Uri(webSocketUrl), token);
                    state = ConnectionState.Connected;
                    reconnectSeconds = initialReconnectSeconds;
                    Debug.Log("[PTDT] Physics stream connected.");
                    synchronizer.ResetSequence();
                    await ReceiveLoopAsync(webSocket, token);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception e)
                {
                    Debug.LogWarning($"[PTDT] WebSocket failed: {e.Message}. Retry in {reconnectSeconds:0.0}s.");
                }
                finally
                {
                    DisposeSocket();
                    if (state != ConnectionState.Disconnected)
                        state = ConnectionState.Reconnecting;
                }
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(reconnectSeconds), token);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                reconnectSeconds = Math.Min(reconnectSeconds * 2.0f, maxReconnectSeconds);
            }
            state = ConnectionState.Disconnected;
        }

        private async Task ReceiveLoopAsync(ClientWebSocket ws, CancellationToken token)
        {
            var buffer = new byte[receiveBufferBytes];
            var messageBuffer = new StringBuilder(receiveBufferBytes);
            while (ws.State == WebSocketState.Open && !token.IsCancellationRequested)
            {
                messageBuffer.Clear();
                WebSocketReceiveResult result;
                do
                {
                    result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), token);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, token);
                        return;
                    }
                    if (result.MessageType != WebSocketMessageType.Text)
                        continue;
                    messageBuffer.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));
                }
                while (!result.EndOfMessage);

                string json = messageBuffer.ToString();
                if (string.IsNullOrEmpty(json)) continue;
                lock (payloadLock)
                {
                    latestJsonPayload = json;
                    hasNewPayload = true;
                }
            }
        }

        private void DisposeSocket()
        {
            try { webSocket?.Dispose(); } catch (Exception) { }
            webSocket = null;
        }
    }
}
