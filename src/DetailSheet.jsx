import ModalSheet from "./ModalSheet.jsx";
import React from "react";
import { X } from "lucide-react";

// Hoja de detalle: de dónde sale una cifra y qué significa.
//
// La app pide decisiones a partir de números (sube 300 kcal, vas 1,4 kg por
// delante) y hasta ahora los daba sin enseñar el cálculo. Esto no es una
// pantalla nueva: es la misma cifra, abierta.
//
// `rows` es el desglose, `note` la lectura en una frase. La nota se escribe
// desde los datos, no es prosa fija: si no hay nada que decir, no se pasa.
// ponytail: reutiliza el .ft-sheet que ya montaban Añadir y Más. Cero CSS nuevo
// más allá del ancho máximo.
export default function DetailSheet({ kicker, title, sub, rows = [], note, source, onClose }) {
  return (
    <ModalSheet title={title} onClose={onClose}>
        {kicker && <div className="ft-dc-kicker" style={{ marginBottom: 8 }}>{kicker}</div>}
        <h3>
          {title}
          <button onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </h3>
        {sub && <div className="n" style={{ marginTop: -6, marginBottom: 12 }}>{sub}</div>}

        {rows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: note ? 14 : 0 }}>
            {rows.map((row, index) => (
              <div
                key={row.k}
                style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
                  padding: "9px 0", borderBottom: index < rows.length - 1 ? "1px solid var(--hair)" : "none",
                }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "var(--muted)" }}>{row.k}</span>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12.5, fontWeight: 600, textAlign: "right", color: row.strong ? "var(--text)" : "var(--muted)" }}>
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        )}

        {note && <div style={{ fontSize: 13, lineHeight: 1.5 }}>{note}</div>}
        {source && <div className="n" style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--hair)" }}>{source}</div>}
    </ModalSheet>
  );
}
