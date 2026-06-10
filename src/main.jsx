import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { IOSDevice } from "./design/ios-frame.jsx";
import { FitTrackApp } from "./design/Shell.jsx";

const DEV_W = 402, DEV_H = 874;

function Stage() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const pad = window.innerWidth < 520 ? 0 : 40;
      const s = Math.min((window.innerWidth - pad) / DEV_W, (window.innerHeight - pad) / DEV_H, 1.15);
      setScale(s);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#ddd8cf", overflow: "hidden",
    }}>
      <div style={{
        width: DEV_W, height: DEV_H,
        transform: `scale(${scale})`, transformOrigin: "center center",
        flexShrink: 0,
      }}>
        <IOSDevice width={DEV_W} height={DEV_H}>
          <FitTrackApp />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Stage />
  </React.StrictMode>
);
