import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerState } from "../types/game";
import { cameraState } from "./cameraState";

const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 3;
const CAMERA_LAG = 0.1;
const MIN_PITCH = -0.4;
const MAX_PITCH = 0.6;

interface TPSCameraProps {
  player: PlayerState;
}

export default function TPSCamera({ player }: TPSCameraProps) {
  const { camera } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(0.2);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const rightTouchIdRef = useRef<number | null>(null);
  const targetPos = useRef(new THREE.Vector3());

  const handleTouchStart = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      // Sisi kanan layar (60% ke kanan) untuk kontrol kamera
      if (t.clientX > window.innerWidth * 0.4 && rightTouchIdRef.current === null) {
        rightTouchIdRef.current = t.identifier;
        lastTouchRef.current = { x: t.clientX, y: t.clientY };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== rightTouchIdRef.current) continue;
      if (!lastTouchRef.current) continue;
      const dx = t.clientX - lastTouchRef.current.x;
      const dy = t.clientY - lastTouchRef.current.y;
      yawRef.current -= dx * 0.004;
      pitchRef.current = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitchRef.current - dy * 0.003));
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightTouchIdRef.current) {
        rightTouchIdRef.current = null;
        lastTouchRef.current = null;
      }
    }
  }, []);

  // Mouse fallback for desktop testing
  const mouseDown = useRef(false);
  const lastMouse = useRef<{ x: number; y: number } | null>(null);
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 2 || e.button === 0) {
      mouseDown.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseDown.current || !lastMouse.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    yawRef.current -= dx * 0.003;
    pitchRef.current = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitchRef.current - dy * 0.002));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);
  const handleMouseUp = useCallback(() => { mouseDown.current = false; }, []);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp]);

  useFrame(() => {
    const px = player.position.x;
    const py = player.position.y + 1.0;
    const pz = player.position.z;

    const cosP = Math.cos(pitchRef.current);
    const sinP = Math.sin(pitchRef.current);
    const cosY = Math.cos(yawRef.current);
    const sinY = Math.sin(yawRef.current);

    const camX = px - sinY * cosP * CAMERA_DISTANCE;
    const camY = py + sinP * CAMERA_DISTANCE + CAMERA_HEIGHT;
    const camZ = pz - cosY * cosP * CAMERA_DISTANCE;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), CAMERA_LAG + 0.05);
    targetPos.current.set(px, py + 0.5, pz);
    camera.lookAt(targetPos.current);

    // Tulis yaw ke shared state supaya gameStore bisa pakai untuk
    // camera-relative movement
    cameraState.yaw = yawRef.current;
  });

  return null;
}
