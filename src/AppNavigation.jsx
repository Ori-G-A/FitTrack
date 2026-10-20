import React from "react";
import { Dumbbell, Plus, Newspaper, LayoutDashboard, CalendarDays, Apple } from "lucide-react";
import { ACCOUNT_TABS } from "./app-navigation.js";

// Presentación del shell; App conserva navegación, persistencia y servicios.
export function SideNavigation({ tab, NAV, menuOpen, setMenuOpen, setSheet, goTo, userEmail, profileLine, children }) {
  return (
          <aside className={menuOpen ? "ft-side open" : "ft-side"} onMouseLeave={() => setMenuOpen(false)}>
            <button className="ft-side-logo" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Menú">
              <span className="mark"><Dumbbell size={20} /></span>
              <span className="label"><b>FitTrack</b><small>tu progreso, medido</small></span>
            </button>
            <nav className="ft-nav">
              <button className="ft-nav-add" onClick={() => { setSheet("add"); setMenuOpen(false); }} title="Registrar">
                <span className="mark"><Plus size={19} /></span><span className="label">Añadir</span>
              </button>
              {NAV.map(({ id, label, icon: Ic, sep }) => (
                sep
                  ? <span key="sep" className="ft-nav-sep" />
                  : (
                    <button key={id} className={tab === id ? "active" : ""} onClick={() => { goTo(id); setMenuOpen(false); }} title={label}>
                      <Ic size={17} /><span className="label">{label}</span>
                    </button>
                  )
              ))}
            </nav>
            <div className="ft-side-foot">
              {children}
              {/* Tema, exportar e importar se fueron a la pestana de Datos: el
                  pie del rail es la cuenta, no un cajon de acciones sueltas. */}
              <button
                className={ACCOUNT_TABS.includes(tab) ? "ft-user active" : "ft-user"}
                onClick={() => { goTo("cuenta"); setMenuOpen(false); }}
                title={`Tu cuenta · ${profileLine}`}
              >
                <span className="avatar">{(userEmail || "?")[0].toUpperCase()}</span>
                <span className="label">
                  <b>{(userEmail || "").split("@")[0]}</b>
                  <small>{profileLine}</small>
                </span>
              </button>
            </div>
          </aside>
  );
}

export function BottomNavigation({ tab, goTo, setSheet }) {
  return (
          <nav className="ft-tabbar">
            <button className={tab === "diario" ? "active" : ""} onClick={() => goTo("diario")}><Newspaper size={18} />Diario</button>
            <button className={tab === "dashboard" ? "active" : ""} onClick={() => goTo("dashboard")}><LayoutDashboard size={18} />Métricas</button>
            <button className="add" onClick={() => setSheet("add")} aria-label="Registrar"><span className="circle"><Plus size={26} /></span>Añadir</button>
            <button className={tab === "plan" ? "active" : ""} onClick={() => goTo("plan")}><CalendarDays size={18} />Plan</button>
            <button className={tab === "biblioteca" || tab === "rutinas" ? "active" : ""} onClick={() => goTo("biblioteca")}><Apple size={18} />Biblioteca</button>
          </nav>
  );
}
