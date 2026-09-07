import React, { useEffect, useState } from "react";

// Confirmación de que algo se guardó. Hasta ahora no había ninguna: registrabas
// un peso y la pantalla se quedaba igual, así que la única forma de saber que
// había entrado era buscarlo en la lista.
//
// ponytail: un emisor y un suscriptor, sin contexto ni prop drilling. Cualquier
// pantalla llama a toast("…") y el único <Toast /> que monta App lo pinta.

let listener = null;
let seq = 0;

export function toast(message) {
  if (!message) return;
  seq += 1;
  listener?.({ id: seq, message });
}

export function Toast({ ms = 2600 }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    listener = setCurrent;
    return () => { listener = null; };
  }, []);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setCurrent(null), ms);
    return () => clearTimeout(timer);
  }, [current, ms]);

  if (!current) return null;
  // aria-live y no role="alert": es una confirmación, no una interrupción.
  return (
    <div className="ft-toast" role="status" aria-live="polite" key={current.id}>
      {current.message}
    </div>
  );
}
