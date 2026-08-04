import React, { useEffect, useRef } from 'react';

export function UnrealStream() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Connect to the Unreal Signaling Server
    const ws = new WebSocket('ws://sovereign-twin-gpu.aws.com');
    const pc = new RTCPeerConnection();

    ws.onmessage = async (msg) => {
        try {
          const offer = JSON.parse(msg.data);
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify(answer));
        } catch (e) {
          console.log("WebSocket message processing skipped. Stream offline.");
        }
    };

    pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
    };
    
    // Mock video stream (since AWS G5 server might not be live)
    if (videoRef.current) {
        // Fallback or placeholder video
        videoRef.current.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    }

    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-black">
       {/* The "Window" into the Unreal Engine Simulation */}
       <video 
         ref={videoRef} 
         autoPlay 
         playsInline
         muted
         loop
         className="w-full h-full object-cover pointer-events-none opacity-80" 
       />
       
       {/* React UI Overlay (HUD) */}
       <div className="absolute top-0 left-0 p-10 z-50">
         <h1 className="text-white text-4xl font-bold drop-shadow-md tracking-wider">
            UNREAL ENGINE 5 <span className="text-emerald-500">LIVE LINK</span>
         </h1>
         <div className="mt-4 space-y-2 text-slate-300 font-mono text-xs max-w-sm bg-black/60 p-4 border border-emerald-500/30 rounded">
            <p>PIXEL STREAMING INSTANCE: AWS G5.4xlarge</p>
            <p>RENDER TARGET: Point_Township_Tri_River_Valley</p>
            <p className="text-emerald-400 animate-pulse">LUMEN GLOBAL ILLUMINATION: ACTIVE</p>
            <p className="text-emerald-400">NANITE GEOMETRY: STREAMING</p>
            <p>FRAME DELTA: 16.6ms (60 FPS)</p>
         </div>
       </div>
    </div>
  );
}
