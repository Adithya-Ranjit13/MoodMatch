"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const MOODS = ["happy", "sad", "stressed", "calm", "energetic", "tired"] as const;
type Mood = typeof MOODS[number];

const expressionToMood: Record<string, Mood> = {
  happy: "happy",        // clear match
  sad: "sad",            // clear match
  angry: "stressed",     // anger = stressed
  fearful: "stressed",   // fear = stressed
  disgusted: "stressed", // disgust = stressed
  surprised: "happy",    // surprise is usually positive → happy
  neutral: "calm",       // neutral = calm
};

interface WebcamScannerProps {
  onMoodDetected: (mood: Mood,confidence: number) => void;
}

export default function WebcamScanner({ onMoodDetected }: WebcamScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [snapshotsTaken, setSnapshotsTaken] = useState(0);
  const [error, setError] = useState("");
  const [permission, setPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [faceCount, setFaceCount] = useState(0);
  const [canScan, setCanScan] = useState(false);
  const CONFIDENCE_THRESHOLD = 0.4; // minimum confidence to accept detection

  useEffect(() => {
    loadModels();
    return () => stopCamera();
  }, []);
  useEffect(() => {
    if (loading || permission !== "granted") return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      setFaceCount(detections.length);
      setCanScan(detections.length === 1);

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const displaySize = {
        width: video.clientWidth,
        height: video.clientHeight,
      };   

      faceapi.matchDimensions(canvas, displaySize);

      const resizedDetections = faceapi.resizeResults(
        detections,
        displaySize
      );

      const ctx = canvas?.getContext("2d");

      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resizedDetections.forEach((det) => {
        const { x, y, width, height } = det.box;

        ctx.strokeStyle =
          detections.length === 1 ? "#22c55e" : "#ef4444";

        ctx.lineWidth = 3;

        ctx.strokeRect(x, y, width, height);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [loading, permission]);

  async function loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setLoading(false);

      await startCamera();
    } catch (err) {
      setError("Failed to load face detection models.");
      setLoading(false);
    }
  }

  const streamRef = useRef<MediaStream | null>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream; // store it here
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission("granted");
    } catch (err) {
      setPermission("denied");
      setError("Camera permission denied. Please use manual mood picker.");
    }
  }

  function stopCamera() {
    // stop via streamRef (reliable even if videoRef is gone)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }
  async function scanMood() {
    if (!videoRef.current) return;
    setScanning(true);
    setError("");
    setSnapshotsTaken(0);


    const TOTAL_SNAPS = 16;
    const DURATION_MS = 2000;
    const INTERVAL_MS = DURATION_MS / TOTAL_SNAPS; // 125ms per snap

    try {
      const results: Record<string, number>[] = [];

      // Countdown 2...1
      setCountdown(2);
      await new Promise((r) => setTimeout(r, 1000));
      setCountdown(1);
      await new Promise((r) => setTimeout(r, 1000));
      setCountdown(0);

      // Take 16 snaps
      let multiFaceFrames = 0;

      for (let i = 0; i < TOTAL_SNAPS; i++) {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions();

        // Abort if multiple faces appear for more than 2 frames
        if (detections.length > 1) {
          multiFaceFrames++;

          if (multiFaceFrames > 2) {
            setError(
              "Multiple faces detected during scan. Please ensure only one face is visible."
            );
            setScanning(false);
            return;
          }
        } else {
          // reset counter if frame becomes valid again
          multiFaceFrames = 0;
        }

        // Only use scan data if exactly one face exists
        if (detections.length === 1) {
          results.push(
            detections[0].expressions as unknown as Record<string, number>
          );
        }

        setSnapshotsTaken(i + 1);

        await new Promise((r) => setTimeout(r, INTERVAL_MS));
      }

      if (results.length === 0) {
        setError("No face detected. Please look at the camera and try again.");
        setScanning(false);
        return;
      }

      // Average all expression scores
      // Average all expression scores
      const averaged: Record<string, number> = {};
      const keys = Object.keys(results[0]);
      const maxSad = Math.max(...results.map(r => r["sad"] ?? 0));
      console.log("MaxSad: ",maxSad);

      for (const key of keys) {
        averaged[key] =
          results.reduce((sum, r) => sum + (r[key] ?? 0), 0) / results.length;
      }
      console.log("Averaged expression scores:", averaged);
      const SAD_THRESHOLD = 0.01;
      // PRIORITIZE sadness detection
      if (maxSad >= SAD_THRESHOLD) {
        stopCamera();
        setTimeout(() => onMoodDetected("sad", maxSad), 50);
        setScanning(false);
        return;
      }

      // Otherwise continue normal detection
      const dominant = Object.entries(averaged).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );

      const dominantExpression = dominant[0];
      const confidence = dominant[1];

      const mood =
        confidence >= CONFIDENCE_THRESHOLD
          ? (expressionToMood[dominantExpression] ?? "calm")
          : "calm";

      stopCamera();
      setTimeout(() => onMoodDetected(mood, confidence), 50);
    } catch (err) {
      setError("Scan failed. Please try again.");
    }

    setScanning(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading face detection...</p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-2">Camera access denied</p>
        <p className="text-muted-foreground text-sm">
          Please use the manual mood picker below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm aspect-4/3 rounded-2xl overflow-hidden border border-border">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Countdown overlay */}
        {scanning && countdown > 0 && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <p className="text-white text-sm mb-2">Get ready...</p>
            <span className="text-6xl font-bold text-primary">{countdown}</span>
          </div>
        )}

        {/* Scanning overlay */}
        {scanning && countdown === 0 && (
          <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">
              {snapshotsTaken}/{16} snaps
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {scanning && countdown === 0 && (
        <div className="w-80 bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-100"
            style={{ width: `${(snapshotsTaken / 16) * 100}%` }}
          />
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
      {faceCount === 0 && !scanning && (
        <p className="text-yellow-500 text-sm">
          No face detected
        </p>
      )}

      {faceCount > 1 && !scanning && (
        <p className="text-red-500 text-sm text-center">
          Multiple faces detected. Please ensure only one face is visible.
        </p>
      )}
      <button
        onClick={scanMood}
        disabled={scanning ||!canScan}
        className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanning ? "Scanning..." : "Scan My Mood 🎭"}
      </button>

      <p className="text-muted-foreground text-xs">
        💡 Tired or Energetic? Use manual pick instead
      </p>
    </div>
  );
}