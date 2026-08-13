using System;
using UnityEngine;

namespace PTDT.Box3D
{
    /// <summary>
    /// Applies versioned PTDT physics state to the derived Box3D simulation.
    /// The server remains authoritative. Box3D receives commands/state and produces
    /// derived collision/VFX results.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class PTDTBox3DStateSynchronizer : MonoBehaviour
    {
        [Serializable]
        public sealed class PhysicsBodyState
        {
            public string entityId = string.Empty;
            public float x, y, z;
            public float qx, qy, qz, qw = 1.0f;
            public float vx, vy, vz;
            public float angularX, angularY, angularZ;
        }

        [Serializable]
        public sealed class PhysicsStateEnvelope
        {
            public int schemaVersion = 1;
            public long sequence;
            public string pipelineStateVersion = string.Empty;
            public string stateCryptographicSeal = string.Empty;
            public PhysicsBodyState[] bodies = Array.Empty<PhysicsBodyState>();
        }

        [SerializeField] private PTDTBox3DWorld physicsWorld;
        [SerializeField] private float authoritativeTransformBlendSeconds = 0.0f;
        [SerializeField] private bool rejectOutOfOrderFrames = true;

        private long lastSequence = -1;

        private void Awake()
        {
            if (physicsWorld == null) physicsWorld = GetComponent<PTDTBox3DWorld>();
            if (physicsWorld == null) throw new InvalidOperationException("PTDTBox3DStateSynchronizer requires PTDTBox3DWorld.");
            if (!float.IsFinite(authoritativeTransformBlendSeconds) || authoritativeTransformBlendSeconds < 0.0f)
                throw new InvalidOperationException("Authoritative transform blend time must be finite and non-negative.");
        }

        public bool ApplyJsonState(string json)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(json)) return false;
                PhysicsStateEnvelope envelope = JsonUtility.FromJson<PhysicsStateEnvelope>(json);
                return envelope != null && ApplyState(envelope);
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException("Failed to decode PTDT Box3D state envelope.", exception), this);
                return false;
            }
        }

        public bool ApplyState(PhysicsStateEnvelope envelope)
        {
            try
            {
                ValidateEnvelope(envelope);
                if (rejectOutOfOrderFrames && envelope.sequence <= lastSequence) return false;
                foreach (var state in envelope.bodies)
                {
                    if (TryValidateBodyState(state)) ApplyBodyState(state);
                }
                lastSequence = envelope.sequence;
                return true;
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException("Failed to apply PTDT Box3D state envelope.", exception), this);
                return false;
            }
        }

        public void ResetSequence() => lastSequence = -1;

        private void ApplyBodyState(PhysicsBodyState state)
        {
            if (physicsWorld == null) return;
            Quaternion rotation = new Quaternion(state.qx, state.qy, state.qz, state.qw);
            physicsWorld.ApplyAuthoritativeTransform(
                state.entityId, new Vector3(state.x, state.y, state.z), rotation, authoritativeTransformBlendSeconds);
            if (physicsWorld.TryGetBody(state.entityId, out Body body))
            {
                body.SetLinearVelocity(new Vector3(state.vx, state.vy, state.vz));
                body.SetAngularVelocity(new Vector3(state.angularX, state.angularY, state.angularZ));
            }
        }

        private static void ValidateEnvelope(PhysicsStateEnvelope envelope)
        {
            if (envelope.schemaVersion != 1)
                throw new InvalidOperationException($"Unsupported schema version: {envelope.schemaVersion}");
            if (envelope.sequence < 0)
                throw new InvalidOperationException("Sequence cannot be negative.");
            if (string.IsNullOrWhiteSpace(envelope.pipelineStateVersion))
                throw new InvalidOperationException("Pipeline state version required.");
            if (string.IsNullOrWhiteSpace(envelope.stateCryptographicSeal))
                throw new InvalidOperationException("Cryptographic state seal required.");
            if (envelope.bodies == null)
                throw new InvalidOperationException("Body collection cannot be null.");
        }

        private static bool TryValidateBodyState(PhysicsBodyState state)
        {
            return state != null && !string.IsNullOrWhiteSpace(state.entityId) &&
                   float.IsFinite(state.x) && float.IsFinite(state.y) && float.IsFinite(state.z) &&
                   float.IsFinite(state.qx) && float.IsFinite(state.qy) && float.IsFinite(state.qz) && float.IsFinite(state.qw) &&
                   float.IsFinite(state.vx) && float.IsFinite(state.vy) && float.IsFinite(state.vz) &&
                   float.IsFinite(state.angularX) && float.IsFinite(state.angularY) && float.IsFinite(state.angularZ);
        }
    }
}
