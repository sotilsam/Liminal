import { useState, useCallback } from 'react';

export function useCamera(videoRef) {
  const [isActive, setIsActive] = useState(false);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });
  const [error, setError] = useState(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      const v = videoRef.current;
      if (!v) throw new Error('video element missing');
      v.srcObject = stream;
      await v.play();
      setVideoSize({ w: v.videoWidth, h: v.videoHeight });
      setIsActive(true);
    } catch (e) {
      setError(e.name === 'NotAllowedError'
        ? 'Camera blocked — check browser and system permissions'
        : `Camera error: ${e.message}`);
    }
  }, [videoRef]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v?.srcObject) { v.srcObject.getTracks().forEach(t => t.stop()); v.srcObject = null; }
    setIsActive(false);
    setVideoSize({ w: 0, h: 0 });
  }, [videoRef]);

  return { start, stop, isActive, videoSize, error };
}
