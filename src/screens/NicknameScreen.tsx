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
      <div className="nickname-card" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.5s ease" }}>
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
          border-radius: 20px;
          padding: 48px 40px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          width: min(380px, 90vw);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .nn-logo {
          font-size: 40px; color: #4fc3f7;
          text-shadow: 0 0 20px #4fc3f7;
        }
        .nn-title {
          font-size: 22px; font-weight: 900;
          letter-spacing: 4px; color: #fff; margin: 0;
        }
        .nn-sub {
          font-size: 13px; color: #778899; margin: 0;
          text-transform: uppercase; letter-spacing: 2px;
        }
        .nn-input-wrap { width: 100%; }
        .nn-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: #fff; font-size: 18px; font-weight: 600;
          padding: 14px 18px;
          outline: none;
          text-align: center;
          letter-spacing: 2px;
          transition: border-color 0.2s;
        }
        .nn-input:focus { border-color: #4fc3f7; }
        .nn-input::placeholder { color: #445566; font-weight: 400; letter-spacing: 1px; }
        .nn-error {
          color: #ff6b6b; font-size: 12px; margin: 6px 0 0;
          text-align: center;
        }
        .nn-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          border: none; border-radius: 10px;
          color: #fff; font-size: 16px; font-weight: 800;
          letter-spacing: 3px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }
        .nn-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .nn-btn:active:not(:disabled) { transform: translateY(0); }
        .nn-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .nn-hint { font-size: 11px; color: #445566; margin: 0; }
      `}</style>
    </div>
  );
}
