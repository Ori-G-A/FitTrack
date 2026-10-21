import React, { useLayoutEffect, useRef } from "react";

function visible(node) {
  return node?.isConnected && node.getClientRects().length > 0
    && getComputedStyle(node).visibility !== "hidden" && !node.closest("[inert]");
}

function controls(root) {
  return [...root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")]
    .filter((node) => node.tabIndex >= 0 && !node.matches(":disabled") && visible(node));
}

// Conserva el DOM/CSS de las hojas y concentra su ciclo de foco y teclado.
export default function ModalSheet({ title, onClose, children }) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  const restore = useRef(true);
  close.current = onClose;

  useLayoutEffect(() => {
    const root = dialog.current;
    const opener = document.activeElement;
    restore.current = true;
    (controls(root)[0] || root).focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      } else if (event.key === "Tab") {
        const usable = controls(root);
        const first = usable[0], last = usable[usable.length - 1];
        if (!first) {
          event.preventDefault();
          root.focus();
        } else if (event.shiftKey && (document.activeElement === first || !usable.includes(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !usable.includes(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (restore.current && visible(opener)) opener.focus();
    };
  }, []);

  const closeForNavigation = () => {
    restore.current = false;
    close.current();
  };
  return (
    <div ref={dialog} className="ft-sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={() => close.current()}>
      <div className="ft-sheet-panel" onClick={(event) => event.stopPropagation()}>
        {typeof children === "function" ? children({ closeForNavigation }) : children}
      </div>
    </div>
  );
}
