using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace PTDT.Box3D
{
    /// <summary>
    /// Connects to the PTDT Python WebSocket broadcaster and feeds seal-verified
    /// JSON envelopes into PTDTBox3DStateSynchronizer (main-thread apply).
    /// </summary>
    [RequireComponent(typeof(PTDTBox3DStateSynchronizer))]
    [DisallowMultipleComponent]
    public sealed class PTDTBox3DWebSocketClient : MonoBehaviour
    {
        [SerializeField] private string webSocketUrl = "ws://127.0.0.1:8080";
        [SerializeField] private bool autoConnect = true;
        [SerializeField] private int receiveBufferBytes = 64 * 1024;

        private PTDTBox3DStateSynchronizer synchronizer;
        private ClientWebSocket webSocket;
        private CancellationTokenSource cancellationTokenSource;

        private string latestJsonPayload = string.Empty;
        private bool hasNewPayload;
        private readonly object payloadLock = new object();

        private void Awake()
        {
            synchronizer = GetComponent<PTDTBox3DStateSynchronizer>();
            if (synchronizer == null)
                throw new InvalidOperationException("PTDTBox3DWebSocketClient requires PTDTBox3DStateSynchronizer.");
            if (receiveBufferBytes < 4096)
                throw new InvalidOperationException("Receive buffer must be at least 4KB.");
        }

        private void Start()
        {
            if (autoConnect)
                _ = ConnectAndListenAsync();
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
            if (!string.IsNullOrEmpty(jsonToApply))
                synchronizer.ApplyJsonState(jsonToApply);
        }

        private void OnDestroy()
        {
            cancellationTokenSource?.Cancel();
            webSocket?.Dispose();
        }

        private async Task ConnectAndListenAsync()
        {
            cancellationTokenSource = new CancellationTokenSource();
            while (!cancellationTokenSource.IsCancellationRequested)
            {
                webSocket = new ClientWebSocket();
                try
                {
                    Debug.Log($"[PTDT] Connecting Box3D physics stream {webSocketUrl}");
                    await webSocket.ConnectAsync(new Uri(webSocketUrl), cancellationTokenSource.Token);
                    Debug.Log("[PTDT] Physics stream connected.");
                    synchronizer.ResetSequence();
                    await ReceiveLoopAsync(webSocket, cancellationTokenSource.Token);
                }
                catch (Exception e)
                {
                    Debug.LogWarning($"[PTDT] WebSocket failed: {e.Message}. Retry in 3s.");
                }
                finally
                {
                    webSocket?.Dispose();
                }

                try
                {
                    await Task.Delay(3000, cancellationTokenSource.Token);
                }
                catch (TaskCanceledException)
                {
                    return;
                }
            }
        }

        private async Task ReceiveLoopAsync(ClientWebSocket ws, CancellationToken token)
        {
            var buffer = new byte[receiveBufferBytes];
            while (ws.State == WebSocketState.Open && !token.IsCancellationRequested)
            {
                var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), token);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, token);
                    return;
                }

                string json = Encoding.UTF8.GetString(buffer, 0, result.Count);
                lock (payloadLock)
                {
                    latestJsonPayload = json;
                    hasNewPayload = true;
                }
            }
        }
    }
}
