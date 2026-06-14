import { useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

export function useMediaPipe() {
  const plRef = useRef(null);
  const ltRef = useRef(-1);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (plRef.current) return;
    setStatus('loading'); setError(null);
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM);
      const opts = (d) => ({ baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numPoses: 1 });
      try { plRef.current = await PoseLandmarker.createFromOptions(vision, opts('GPU')); }
      catch { plRef.current = await PoseLandmarker.createFromOptions(vision, opts('CPU')); }
      setStatus('ready');
    } catch (e) { setError(e.message); setStatus('error'); }
  }, []);

  const detect = useCallback((video) => {
    const pl = plRef.current;
    if (!pl || !video || video.readyState < 2) return null;
    if (video.currentTime === ltRef.current) return null;
    ltRef.current = video.currentTime;
    try { return pl.detectForVideo(video, performance.now()).landmarks?.[0] ?? null; }
    catch { return null; }
  }, []);

  return { load, detect, status, error };
}
