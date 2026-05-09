import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerState } from "../types/game";
import { cameraState } from "./cameraState";
import { checkCollision } from "./collisionData";

const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 3;
const CAMERA_LAG = 0.1;
const MIN_PITCH = -0.4;
const MAX_PITCH = 0.6;
const COLLISION_STEPS = 14;
const MIN_CAM_DIST = 1.5;

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
  const smoothDist = useRef(CAMERA_DISTANCE);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
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

    // Posisi kamera ideal tanpa halangan
    const idealCamX = px - sinY * cosP * CAMERA_DISTANCE;
    const idealCamZ = pz - cosY * cosP * CAMERA_DISTANCE;

    // Cek tabrakan — langkah dari karakter ke kamera, temukan jarak aman
    let safeDist = CAMERA_DISTANCE;
    for (let i = 1; i <= COLLISION_STEPS; i++) {
      const frac = i / COLLISION_STEPS;
      const testX = px + (idealCamX - px) * frac;
      const testZ = pz + (idealCamZ - pz) * frac;
      if (checkCollision(testX, testZ)) {
        // Mundurkan sedikit dari titik tabrakan
        safeDist = Math.max(MIN_CAM_DIST, CAMERA_DISTANCE * ((i - 1) / COLLISION_STEPS));
        break;
      }
    }

    // Halus-kan perpindahan jarak kamera (tidak langsung loncat)
    smoothDist.current += (safeDist - smoothDist.current) * 0.18;
    const d = smoothDist.current;

    const finalCamX = px - sinY * cosP * d;
    const finalCamY = py + sinP * d + CAMERA_HEIGHT;
    const finalCamZ = pz - cosY * cosP * d;

    camera.position.lerp(new THREE.Vector3(finalCamX, finalCamY, finalCamZ), CAMERA_LAG + 0.05);
    targetPos.current.set(px, py + 0.5, pz);
    camera.lookAt(targetPos.current);

    cameraState.yaw = yawRef.current;
  });

  return null;
}
