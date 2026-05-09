import { useState, useEffect } from "react";
import { useGameStore } from "../stores/gameStore";

export default function NicknameScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const setNickname = useGameStore((s) => s.setNickname);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ff_nickname");
    if (saved) setValue(saved);
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) { setError("Nama minimal 2 karakter"); return; }
    if (trimmed.length > 16) { setError("Nama maksimal 16 karakter"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError("Hanya huruf, angka, dan underscore"); return; }
    setNickname(trimmed);
    setPhase("menu");
  };

  return (
    <div className="nickname-root">
      <div className="nickname-bg" />
      <div
        className="nickname-card"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s ease" }}
      >
        <div className="nn-logo">◈</div>
        <h1 className="nn-title">FORGE FRENZY</h1>
        <p className="nn-sub">Masukkan Nickname-mu</p>

        <div className="nn-input-wrap">
          <input
            className="nn-input"
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="NicknameMu"
            maxLength={16}
            autoFocus
          />
          {error && <p className="nn-error">{error}</p>}
        </div>

        <button className="nn-btn" onClick={handleSubmit} disabled={!value.trim()}>
          MULAI
        </button>

        <p className="nn-hint">Nickname akan disimpan secara lokal</p>
      </div>

      <style>{`
        .nickname-root {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: #0a0a0f;
          font-family: 'Segoe UI', sans-serif;
        }
        .nickname-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 70%, #1a2a3a 0%, #0a0a0f 60%),
                      radial-gradient(ellipse at 70% 30%, #2a1a1a 0%, transparent 50%);
        }
        .nickname-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: clamp(14px,2vw,20px);
          padding: clamp(28px,5vh,48px) clamp(20px,4vw,40px);
          display: flex; flex-direction: column; align-items: center; gap: clamp(12px,2vh,20px);
          width: min(380px, 88vw);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .nn-logo {
          font-size: clamp(28px,5vw,40px); color: #4fc3f7;
          text-shadow: 0 0 20px #4fc3f7;
        }
        .nn-title {
          font-size: clamp(16px,3vw,22px); font-weight: 900;
          letter-spacing: 4px; color: #fff; margin: 0;
        }
        .nn-sub {
          font-size: clamp(10px,1.6vw,13px); color: #778899; margin: 0;
          text-transform: uppercase; letter-spacing: 2px;
        }
        .nn-input-wrap { width: 100%; }
        .nn-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: #fff; font-size: clamp(15px,2.5vw,18px); font-weight: 600;
          padding: clamp(10px,1.8vh,14px) clamp(12px,2vw,18px);
          outline: none;
          text-align: center;
          letter-spacing: 2px;
          transition: border-color 0.2s;
        }
        .nn-input:focus { border-color: #4fc3f7; }
        .nn-input::placeholder { color: #445566; font-weight: 400; letter-spacing: 1px; }
        .nn-error {
          color: #ff6b6b; font-size: clamp(10px,1.5vw,12px); margin: 6px 0 0;
          text-align: center;
        }
        .nn-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          border: none; border-radius: 10px;
          color: #fff; font-size: clamp(13px,2.2vw,16px); font-weight: 800;
          letter-spacing: 3px;
          padding: clamp(12px,2vh,16px);
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .nn-btn:active:not(:disabled) { transform: scale(0.97); opacity: 0.85; }
        .nn-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .nn-hint { font-size: clamp(9px,1.3vw,11px); color: #445566; margin: 0; }
      `}</style>
    </div>
  );
}
