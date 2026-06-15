import React, { useEffect, useState } from "react";
import { Dumbbell, Lock } from "lucide-react";
import { authenticate } from "./auth-service.js";
import { onSaveStatus } from "./data-sync.js";
import { supabase } from "./supabase.js";

export function SaveIndicator() {
  const [state, setState] = useState({ status: "idle", error: null });

  useEffect(() => onSaveStatus(setState), []);

  const states = {
    idle: { text: "Sin cambios", color: "var(--muted)", dot: "var(--muted)" },
    saving: { text: "Guardando…", color: "var(--muted)", dot: "var(--blue)" },
    saved: { text: "Guardado", color: "var(--ok)", dot: "var(--ok)" },
    error: { text: "Error al guardar", color: "var(--danger)", dot: "var(--danger)" },
  };
  const current = states[state.status] || states.idle;

  return (
    <div
      title={state.error || (state.status === "saved" ? "Tus datos se guardaron en Supabase" : "Estado de sincronización con Supabase")}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'IBM Plex Mono'", fontSize: 11, color: current.color, padding: "0 8px", whiteSpace: "nowrap" }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: current.dot, flexShrink: 0 }} />
      {current.text}
    </div>
  );
}

export function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", ok: false });
  const [busy, setBusy] = useState(false);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage({ text: "", ok: false });
  };

  const submit = async () => {
    if (!email || !password) return;
    if (mode === "register" && password.length < 8) {
      setMessage({ text: "La contraseña debe tener al menos 8 caracteres.", ok: false });
      return;
    }

    setBusy(true);
    setMessage({ text: "", ok: false });
    try {
      await authenticate(supabase, mode, email, password);
      if (mode === "register") {
        setMessage({ text: "Revisa tu correo para confirmar el registro.", ok: true });
      }
    } catch (error) {
      const text = error?.code === "invalid_credentials"
        ? "Correo o contraseña incorrectos."
        : (error?.message || "No se pudo completar la solicitud.");
      setMessage({ text, ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ft-lock">
      <div className="ft-lock-box">
        <div className="ft-logo" style={{ justifyContent: "center", marginBottom: 20 }}>
          <div className="mark"><Dumbbell size={20} /></div>
          <div><h1>FitTrack</h1><span>tu progreso, medido</span></div>
        </div>
        <div className="ft-toggle" style={{ marginBottom: 18 }}>
          <button className={mode === "login" ? "on" : ""} onClick={() => changeMode("login")}>Entrar</button>
          <button className={mode === "register" ? "on" : ""} onClick={() => changeMode("register")}>Registrarse</button>
        </div>
        <div className="ft-field" style={{ marginBottom: 12 }}>
          <label>Correo electrónico</label>
          <input
            className="ft-input"
            type="email"
            autoComplete="email"
            autoFocus
            disabled={busy}
            value={email}
            placeholder="tu@email.com"
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
        </div>
        <div className="ft-field" style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <input
            className="ft-input"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={busy}
            value={password}
            placeholder="••••••••"
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
        </div>
        {message.text && <div style={{ color: message.ok ? "var(--ok)" : "var(--danger)", fontSize: 13, marginBottom: 12 }}>{message.text}</div>}
        <button className="ft-btn" onClick={submit} disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          <Lock size={15} /> {busy ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}
