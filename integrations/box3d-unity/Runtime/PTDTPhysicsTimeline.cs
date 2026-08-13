using System;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;
using PTDT.Box3D;

namespace PTDT.Cinematic
{
    [Serializable]
    public class PTDTPhysicsBehaviour : PlayableBehaviour
    {
        public string sealedPhysicsJson = "";

        public override void ProcessFrame(Playable playable, FrameData info, object playerData)
        {
            var synchronizer = playerData as PTDTBox3DStateSynchronizer;
            if (synchronizer == null || string.IsNullOrEmpty(sealedPhysicsJson))
                return;
            synchronizer.ApplyJsonState(sealedPhysicsJson);
        }
    }

    public class PTDTPhysicsClip : PlayableAsset, ITimelineClipAsset
    {
        public PTDTPhysicsBehaviour template = new PTDTPhysicsBehaviour();
        public ClipCaps clipCaps => ClipCaps.None;

        public override Playable CreatePlayable(PlayableGraph graph, GameObject owner)
        {
            return ScriptPlayable<PTDTPhysicsBehaviour>.Create(graph, template);
        }
    }

    [TrackColor(0.85f, 0.25f, 0.15f)]
    [TrackBindingType(typeof(PTDTBox3DStateSynchronizer))]
    [TrackClipType(typeof(PTDTPhysicsClip))]
    public class PTDTPhysicsTrack : TrackAsset
    {
    }
}
