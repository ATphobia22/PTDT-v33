using System;
using System.Collections.Generic;
using Box3D;
using Unity.Mathematics;
using UnityEngine;

namespace PTDT.Box3D
{
    /// <summary>
    /// PTDT-owned Box3D simulation world.
    /// Box3D is a derived physics/VFX execution layer. Authoritative hydraulic,
    /// geospatial, regulatory, and provenance state remains outside this class.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class PTDTBox3DWorld : MonoBehaviour
    {
        [Serializable]
        public sealed class BodyRegistration
        {
            public string EntityId = string.Empty;
            public Transform TargetTransform;
            public float Radius = 0.5f;
            public float MassDensity = 1.0f;
            public bool IsBullet;
        }

        private sealed class RuntimeBody
        {
            public string EntityId = string.Empty;
            public Transform TargetTransform;
            public Body Body;
        }

        [Header("Simulation")]
        [SerializeField] private float fixedTimeStep = 1.0f / 60.0f;
        [SerializeField] private int subStepCount = 4;
        [SerializeField] private uint workerCount = 0;
        [SerializeField] private bool enableSleep = true;
        [SerializeField] private bool enableContinuousCollision = true;

        [Header("Render Origin")]
        [Tooltip("Unity render-space origin corresponding to the PTDT local CRS origin.")]
        [SerializeField] private Vector3 renderOrigin;

        [Header("Registered Bodies")]
        [SerializeField] private List<BodyRegistration> registrations = new();

        private World world;
        private bool initialized;
        private readonly Dictionary<string, RuntimeBody> runtimeBodies = new(StringComparer.Ordinal);
        private readonly Dictionary<ulong, RuntimeBody> bodyIdLookup = new();

        public bool IsInitialized => initialized;
        public float FixedTimeStep => fixedTimeStep;
        public int RuntimeBodyCount => runtimeBodies.Count;

        private void Awake()
        {
            try
            {
                ValidateConfiguration();
                CreateWorld();
                RegisterConfiguredBodies();
                initialized = true;
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException("PTDT Box3D initialization failed.", exception), this);
                DestroyWorld();
                enabled = false;
            }
        }

        private void FixedUpdate()
        {
            if (!initialized || !world.IsValid) return;
            try
            {
                world.Step(fixedTimeStep, subStepCount);
                SynchronizeMovedBodies();
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException("PTDT Box3D fixed-step execution failed.", exception), this);
            }
        }

        private void OnDestroy()
        {
            try { DestroyWorld(); }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException("PTDT Box3D shutdown failed.", exception), this);
            }
        }

        public bool TryGetBody(string entityId, out Body body)
        {
            body = default;
            if (string.IsNullOrWhiteSpace(entityId)) return false;
            if (!runtimeBodies.TryGetValue(entityId, out RuntimeBody runtimeBody)) return false;
            if (!runtimeBody.Body.IsValid) return false;
            body = runtimeBody.Body;
            return true;
        }

        public bool TryRegisterSphere(string entityId, Transform targetTransform, float radius, float density, bool isBullet, out Body body)
        {
            body = default;
            try
            {
                if (!initialized || !world.IsValid) return false;
                if (string.IsNullOrWhiteSpace(entityId)) throw new ArgumentException("Entity ID cannot be null or whitespace.", nameof(entityId));
                if (targetTransform == null) throw new ArgumentNullException(nameof(targetTransform));
                if (!float.IsFinite(radius) || radius <= 0.0f) throw new ArgumentOutOfRangeException(nameof(radius), radius, "Radius must be finite and > 0.");
                if (!float.IsFinite(density) || density <= 0.0f) throw new ArgumentOutOfRangeException(nameof(density), density, "Density must be finite and > 0.");
                if (runtimeBodies.ContainsKey(entityId)) return false;

                BodyDef bodyDefinition = BodyDef.Default;
                bodyDefinition.Type = BodyType.Dynamic;
                bodyDefinition.Position = ToPhysicsPosition(targetTransform.position);
                bodyDefinition.IsBullet = isBullet;

                Body createdBody = world.CreateBody(bodyDefinition);
                ShapeDef shapeDefinition = ShapeDef.Default;
                shapeDefinition.Density = density;
                shapeDefinition.EnableContactEvents = true;
                shapeDefinition.EnableHitEvents = true;

                Sphere sphere = new Sphere { Radius = radius };
                createdBody.CreateSphereShape(in shapeDefinition, in sphere);

                RuntimeBody runtimeBody = new RuntimeBody
                {
                    EntityId = entityId,
                    TargetTransform = targetTransform,
                    Body = createdBody
                };
                runtimeBodies.Add(entityId, runtimeBody);
                bodyIdLookup[GetStableBodyKey(createdBody)] = runtimeBody;
                body = createdBody;
                return true;
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException($"Failed to register Box3D sphere '{entityId}'.", exception), this);
                return false;
            }
        }

        public void ApplyAuthoritativeTransform(string entityId, Vector3 localPosition, Quaternion rotation, float blendTimeSeconds)
        {
            try
            {
                if (!runtimeBodies.TryGetValue(entityId, out RuntimeBody runtimeBody)) return;
                if (!runtimeBody.Body.IsValid) return;
                if (!IsFinite(localPosition) || !IsFinite(rotation) || blendTimeSeconds < 0.0f || !float.IsFinite(blendTimeSeconds))
                    throw new ArgumentException("Invalid authoritative transform.");

                B3WorldTransform target = new B3WorldTransform
                {
                    Position = ToPhysicsPosition(localPosition),
                    Rotation = new quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
                };

                if (blendTimeSeconds <= 0.0f)
                {
                    runtimeBody.Body.SetTransform(target.Position, target.Rotation);
                    return;
                }
                runtimeBody.Body.SetTargetTransform(target, blendTimeSeconds, true);
            }
            catch (Exception exception)
            {
                Debug.LogException(new InvalidOperationException($"Failed to apply authoritative transform for '{entityId}'.", exception), this);
            }
        }

        private void ValidateConfiguration()
        {
            if (!float.IsFinite(fixedTimeStep) || fixedTimeStep <= 0.0f || fixedTimeStep > 1.0f)
                throw new ArgumentOutOfRangeException(nameof(fixedTimeStep), fixedTimeStep, "Fixed timestep must be > 0 and <= 1.");
            if (subStepCount <= 0 || subStepCount > 32)
                throw new ArgumentOutOfRangeException(nameof(subStepCount), subStepCount, "Sub-step count must be 1-32.");
            if (workerCount > 256)
                throw new ArgumentOutOfRangeException(nameof(workerCount), workerCount, "Worker count exceeds PTDT safety limit.");
            if (!IsFinite(renderOrigin))
                throw new ArgumentException("Render origin contains a non-finite component.", nameof(renderOrigin));
        }

        private unsafe void CreateWorld()
        {
            WorldDef definition = WorldDef.Default;
            definition.EnableSleep = enableSleep;
            definition.EnableContinuous = enableContinuousCollision;
            if (workerCount > 0) definition.WorkerCount = workerCount;
            world = World.Create(in definition);
        }

        private void RegisterConfiguredBodies()
        {
            foreach (var registration in registrations)
            {
                if (registration == null || registration.TargetTransform == null) continue;
                TryRegisterSphere(registration.EntityId, registration.TargetTransform, registration.Radius, registration.MassDensity, registration.IsBullet, out _);
            }
        }

        private void SynchronizeMovedBodies()
        {
            ReadOnlySpan<BodyMoveEvent> moveEvents = world.GetBodyMoveEvents();
            for (int index = 0; index < moveEvents.Length; index++)
            {
                BodyMoveEvent moveEvent = moveEvents[index];
                ulong bodyKey = GetStableBodyKey(moveEvent.BodyId);
                if (!bodyIdLookup.TryGetValue(bodyKey, out RuntimeBody runtimeBody) || runtimeBody.TargetTransform == null)
                    continue;

                Vector3 renderPosition = ToRenderPosition(moveEvent.Transform.Position);
                Quaternion renderRotation = new Quaternion(
                    moveEvent.Transform.Rotation.value.x,
                    moveEvent.Transform.Rotation.value.y,
                    moveEvent.Transform.Rotation.value.z,
                    moveEvent.Transform.Rotation.value.w);
                runtimeBody.TargetTransform.SetPositionAndRotation(renderPosition, renderRotation);
            }
        }

        private void DestroyWorld()
        {
            initialized = false;
            runtimeBodies.Clear();
            bodyIdLookup.Clear();
            if (world.IsValid) world.Destroy();
            world = default;
        }

        private B3Pos ToPhysicsPosition(Vector3 renderPosition)
        {
            Vector3 relative = renderPosition - renderOrigin;
            return new B3Pos(relative.x, relative.y, relative.z);
        }

        private Vector3 ToRenderPosition(B3Pos physicsPosition)
        {
            return new Vector3(
                (float)physicsPosition.x + renderOrigin.x,
                (float)physicsPosition.y + renderOrigin.y,
                (float)physicsPosition.z + renderOrigin.z);
        }

        private static ulong GetStableBodyKey(Body body) => GetStableBodyKey(body.Id);
        private static ulong GetStableBodyKey(BodyId bodyId)
        {
            unchecked { return ((ulong)(uint)bodyId.Index << 32) | (uint)bodyId.Generation; }
        }

        private static bool IsFinite(Vector3 value) =>
            float.IsFinite(value.x) && float.IsFinite(value.y) && float.IsFinite(value.z);
        private static bool IsFinite(Quaternion value) =>
            float.IsFinite(value.x) && float.IsFinite(value.y) && float.IsFinite(value.z) && float.IsFinite(value.w);
    }
}
