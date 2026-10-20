export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
/* El tema tambien en el documento: el fondo del navegador asoma al hacer
   overscroll y en las pantallas mas cortas que el viewport. */
html{background:#17150f;color-scheme:dark;}
html[data-theme="light"]{background:#f3efe6;color-scheme:light;}
.ft-root *{box-sizing:border-box;}
.ft-root{--bg:#f3efe6;--panel:#faf7f0;--panel2:#ece6da;--line:#dcd4c2;--hair:rgba(22,20,13,.10);--text:#16140d;--muted:#6f6a5d;--accent:#e7531c;--accentdim:rgba(231,83,28,.12);--danger:#c0341a;--blue:#2f6f8f;--ok:#3d8b68;--attn:#c4451a;color-scheme:light;font-family:'Hanken Grotesk',sans-serif;color:var(--text);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.4;background-image:none;}
.ft-root[data-theme="dark"]{--bg:#17150f;--panel:#201d16;--panel2:#1e1b14;--line:rgba(243,239,230,.12);--hair:rgba(243,239,230,.08);--text:#f3efe6;--muted:#8b8578;--accent:#e7531c;--accentdim:rgba(231,83,28,.18);--danger:#ff6b4a;--blue:#6fb2f0;--ok:#4fa87f;--attn:#ff8a5c;color-scheme:dark;}
.ft-mono{font-family:'IBM Plex Mono',monospace;}
.ft-wrap{max-width:1120px;margin:0 auto;padding:20px 18px 90px;}
.ft-wrap.with-side{padding-left:74px;}
.ft-side{position:fixed;top:0;left:0;bottom:0;z-index:40;width:56px;display:flex;flex-direction:column;gap:16px;padding:14px 8px;background:var(--panel);border-right:1px solid var(--line);overflow:hidden;transition:width .18s ease;}
.ft-side.open,.ft-side:focus-within{width:232px;}
@media (hover:hover){.ft-side:hover{width:232px;}}
.ft-side .label{opacity:0;white-space:nowrap;transition:opacity .12s ease;}
.ft-side.open .label,.ft-side:focus-within .label{opacity:1;}
@media (hover:hover){.ft-side:hover .label{opacity:1;}}
.ft-side-logo{display:flex;align-items:center;gap:10px;background:transparent;border:none;padding:0;cursor:pointer;color:var(--text);text-align:left;}
.ft-side-logo .mark{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#f3efe6;}
.ft-side-logo b{display:block;font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:19px;line-height:1;}
.ft-side-logo small{color:var(--muted);font-size:10px;letter-spacing:.16em;text-transform:uppercase;}
.ft-side-foot{margin-top:auto;display:flex;flex-direction:column;gap:6px;}
.ft-user{display:flex;align-items:center;gap:10px;padding:10px 4px 4px;border:none;border-top:1px solid var(--line);background:transparent;color:var(--text);text-align:left;width:100%;cursor:pointer;border-radius:0 0 9px 9px;}
.ft-user:hover{background:var(--panel2);}
.ft-user.active{background:var(--accentdim);}
.ft-user .avatar{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:800;font-size:13px;}
.ft-user b{display:block;font-size:12.5px;line-height:1.25;text-transform:capitalize;}
.ft-user small{font-size:11px;color:var(--muted);font-family:'IBM Plex Mono';}
.ft-logo{display:flex;align-items:center;gap:10px;}
.ft-logo .mark{width:34px;height:34px;border-radius:9px;background:var(--accent);display:grid;place-items:center;color:#f3efe6;}
.ft-logo h1{font-family:'Archivo';font-weight:900;letter-spacing:-.04em;text-transform:uppercase;font-size:22px;line-height:1;margin:0;}
.ft-logo span{color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;}
.ft-iconbtn{background:var(--panel);border:1px solid var(--line);color:var(--muted);border-radius:9px;padding:8px 10px;display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-size:12px;font-weight:600;}
.ft-iconbtn:hover{border-color:var(--accent);color:var(--text);}
.ft-nav{display:flex;flex-direction:column;gap:4px;}
.ft-nav button{border:none;background:transparent;color:var(--muted);padding:11px 9px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12.5px;display:flex;align-items:center;gap:12px;white-space:nowrap;transition:.15s;}
.ft-nav button.active{background:var(--accent);color:#f3efe6;}
.ft-nav-add{border:none;background:transparent;padding:0 0 6px;margin-bottom:2px;cursor:pointer;color:var(--text);display:flex;align-items:center;gap:12px;font-weight:700;font-size:12.5px;white-space:nowrap;}
.ft-nav-add .mark{flex:0 0 auto;width:34px;height:34px;border-radius:10px;background:var(--ok);color:var(--bg);display:grid;place-items:center;}
.ft-nav-add:hover .mark{filter:brightness(1.08);}
.ft-nav-sep{height:1px;background:var(--line);margin:8px 2px;}
.ft-side .ft-iconbtn{justify-content:flex-start;gap:12px;padding:9px;border:none;background:transparent;}
.ft-side svg{flex:0 0 auto;}
.ft-nav button:not(.active):hover{color:var(--text);background:var(--panel2);}
.ft-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px;}
.ft-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
@media (max-width:900px){.ft-cols{grid-template-columns:1fr;}}
.ft-profile{display:flex;align-items:center;gap:14px;margin:18px 0;}
.ft-profile .avatar{width:56px;height:56px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:900;font-size:22px;}
.ft-profile b{display:block;font-family:'Archivo';font-weight:900;font-size:26px;letter-spacing:-.03em;text-transform:uppercase;line-height:1;}
.ft-profile small{font-family:'IBM Plex Mono';font-size:11px;color:var(--muted);letter-spacing:.08em;}
.ft-card h2{font-family:'Archivo';font-weight:800;text-transform:uppercase;letter-spacing:-.01em;font-size:15px;margin:0 0 14px;display:flex;align-items:center;gap:9px;}
.ft-card h2 .tag{margin-left:auto;font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.1em;font-family:'IBM Plex Mono';text-transform:none;}
.ft-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;}
.ft-field{display:flex;flex-direction:column;gap:5px;flex:1;min-width:90px;}
.ft-field label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:600;}
.ft-measures{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;}
.ft-measures button{background:var(--panel2);border:1px solid var(--line);color:var(--muted);border-radius:7px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;}
.ft-measures button:hover{border-color:var(--accent);color:var(--text);}
.ft-input,.ft-select{background:var(--panel2);border:1px solid var(--line);border-radius:9px;color:var(--text);padding:10px 11px;font-size:14px;font-family:inherit;width:100%;}
.ft-input:focus,.ft-select:focus{outline:none;border-color:var(--accent);}
.ft-mono.ft-input{font-family:'IBM Plex Mono';}
textarea.ft-input{resize:vertical;min-height:60px;}
.ft-btn{background:var(--accent);color:#f3efe6;border:none;border-radius:9px;padding:10px 16px;font-weight:800;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:7px;}
.ft-btn:hover{filter:brightness(1.08);}
.ft-btn.ghost{background:var(--panel2);color:var(--text);border:1px solid var(--line);}
.ft-btn.ghost:hover{border-color:var(--accent);}
.ft-btn:disabled{opacity:.4;cursor:not-allowed;}
.ft-trash{background:transparent;border:none;color:var(--muted);cursor:pointer;padding:5px;border-radius:6px;display:grid;place-items:center;}
.ft-trash:hover{color:var(--danger);background:color-mix(in srgb,var(--danger) 12%,transparent);}
.ft-datebar{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px;}
.ft-datebar .nav{background:var(--panel);border:1px solid var(--line);color:var(--text);width:36px;height:36px;border-radius:9px;cursor:pointer;display:grid;place-items:center;}
.ft-datebar .nav:hover{border-color:var(--accent);}
.ft-datebar .lbl{text-align:center;}
.ft-datebar .lbl .d{font-family:'Archivo';font-weight:800;text-transform:capitalize;font-size:16px;}
.ft-datebar .lbl .y{color:var(--muted);font-size:12px;font-family:'IBM Plex Mono';}
.ft-ex{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:13px;margin-bottom:11px;}
.ft-ex-head{display:flex;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap;}
.ft-ex-head .dot{width:10px;height:10px;border-radius:50%;flex:none;}
.ft-ex-head .nm{font-weight:700;font-size:15px;}
.ft-mu{font-size:11px;color:var(--muted);background:var(--bg);padding:3px 8px;border-radius:20px;border:1px solid var(--line);}
.ft-mu.sec{opacity:.75;}
.ft-1rm{margin-left:auto;font-family:'IBM Plex Mono';font-size:12px;color:var(--accent);}
.ft-set{display:grid;grid-template-columns:24px 1fr 1fr 30px;gap:8px;align-items:center;margin-bottom:6px;}
.ft-set .ix{color:var(--muted);font-family:'IBM Plex Mono';font-size:12px;text-align:center;}
.ft-set .si{background:var(--bg);border:1px solid var(--line);border-radius:7px;color:var(--text);padding:7px 8px;font-family:'IBM Plex Mono';font-size:13px;text-align:center;width:100%;}
.ft-set .si:focus{outline:none;border-color:var(--accent);}
.ft-addset{background:transparent;border:1px dashed var(--line);color:var(--muted);border-radius:7px;padding:7px;width:100%;cursor:pointer;font-size:12px;font-weight:600;}
.ft-addset:hover{border-color:var(--accent);color:var(--accent);}
.ft-empty{text-align:center;color:var(--muted);padding:34px 16px;font-size:14px;}
.ft-empty .ic{opacity:.4;margin-bottom:10px;display:flex;justify-content:center;}
.ft-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;}
.ft-stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;}
.ft-stat .k{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.ft-stat .v{font-family:'Archivo';font-weight:900;font-size:28px;line-height:1;letter-spacing:-.03em;}
.ft-stat .v small{font-size:13px;color:var(--muted);font-weight:700;margin-left:3px;}
.ft-stat .sub{font-size:12px;margin-top:7px;color:var(--muted);font-family:'IBM Plex Mono';display:flex;align-items:center;gap:5px;}
.ft-alert{border-radius:13px;padding:14px 15px;margin-bottom:12px;display:flex;gap:12px;align-items:flex-start;font-size:14px;}
.ft-alert.warn{background:color-mix(in srgb,var(--attn) 12%,transparent);border:1px solid color-mix(in srgb,var(--attn) 42%,transparent);}
.ft-alert.ok{background:color-mix(in srgb,var(--ok) 12%,transparent);border:1px solid color-mix(in srgb,var(--ok) 38%,transparent);}
.ft-alert.info{background:color-mix(in srgb,var(--blue) 11%,transparent);border:1px solid color-mix(in srgb,var(--blue) 34%,transparent);}
.ft-alert.pr{background:var(--accentdim);border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);}
.ft-alert .t{font-weight:700;margin-bottom:3px;}
.ft-alert .b{color:var(--muted);line-height:1.5;}
.ft-list{display:flex;flex-direction:column;gap:8px;}
.ft-acc{margin-top:12px;}
.ft-acc>summary{cursor:pointer;list-style:none;font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;}
.ft-acc>summary::-webkit-details-marker{display:none;}
.ft-acc>summary::before{content:'+';font-weight:700;}
.ft-acc[open]>summary::before{content:'–';}
.ft-li{display:flex;align-items:center;gap:12px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px 13px;flex-wrap:wrap;}
.ft-li .li-d{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);min-width:54px;}
.ft-li .li-main{flex:1;font-weight:600;min-width:120px;}
.ft-li .li-sub{font-size:12px;color:var(--muted);font-family:'IBM Plex Mono';}
.ft-li .li-v{font-family:'IBM Plex Mono';font-weight:600;}
.ft-li-group{background:var(--panel2);border:1px solid var(--line);}
.ft-li-group>.ft-li{background:transparent;border:0;}
.ft-li-detail{border-top:1px solid var(--line);padding:4px 13px 12px;}
.ft-li-detail .ft-li{padding:9px 0;border:0;border-bottom:1px solid var(--line);background:transparent;}
.ft-li-detail .ft-li:last-child{border-bottom:0;}
.ft-detail-toggle{color:var(--text);}
.ft-detail-toggle svg{transition:transform .18s ease;}
.ft-detail-toggle[aria-expanded="true"] svg{transform:rotate(180deg);}
.ft-chips{display:flex;gap:6px;flex-wrap:wrap;}
.ft-chip{font-size:11px;font-family:'IBM Plex Mono';color:var(--muted);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:2px 7px;}
.ft-timer{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.ft-timer .clock{font-family:'IBM Plex Mono';font-weight:600;font-size:38px;letter-spacing:.01em;min-width:130px;}
.ft-timer .clock.run{color:var(--accent);}
.ft-secchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
.ft-secchip{font-size:12px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:20px;padding:5px 11px;cursor:pointer;user-select:none;}
.ft-secchip.on{border-color:var(--accent);color:var(--accent);background:var(--accentdim);}
.ft-toggle{display:inline-flex;gap:3px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:3px;margin-bottom:14px;flex-wrap:wrap;}
.ft-toggle button{border:none;background:transparent;color:var(--muted);padding:7px 14px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;}
.ft-toggle button.on{background:var(--accent);color:#f3efe6;}
.ft-combo{position:relative;}
.ft-combo-list{position:absolute;top:100%;left:0;right:0;z-index:30;background:var(--panel2);border:1px solid var(--line);border-radius:9px;margin-top:4px;max-height:240px;overflow:auto;box-shadow:0 10px 28px rgba(0,0,0,.45);}
.ft-combo-list button{display:flex;justify-content:space-between;align-items:center;width:100%;background:transparent;border:none;border-bottom:1px solid var(--line);color:var(--text);padding:10px 12px;cursor:pointer;text-align:left;font-size:13px;font-weight:600;}
.ft-combo-list button:last-child{border-bottom:none;}
.ft-combo-list button:hover{background:var(--bg);}
.ft-combo-list .sub{color:var(--muted);font-family:'IBM Plex Mono';font-size:11px;font-weight:400;}
.ft-prev{background:var(--bg);border:1px dashed var(--line);border-radius:9px;padding:10px 13px;font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);margin-top:10px;display:flex;gap:14px;flex-wrap:wrap;}
.ft-prev b{color:var(--accent);}
.ft-h3{font-family:'Archivo';font-weight:800;text-transform:uppercase;font-size:13px;color:var(--muted);letter-spacing:.04em;margin:0;}
.ft-energy{display:flex;gap:6px;}
.ft-energy button{flex:1;background:var(--panel2);border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-weight:700;font-family:'IBM Plex Mono';}
.ft-energy button.on{background:var(--accent);color:#f3efe6;border-color:var(--accent);}
.ft-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:14px;}
.ft-photo{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);aspect-ratio:3/4;background:var(--panel2);}
.ft-photo img{width:100%;height:100%;object-fit:cover;display:block;}
.ft-photo .cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-family:'IBM Plex Mono';font-size:11px;padding:14px 8px 5px;}
.ft-photo-del{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.55);border:none;color:#fff;border-radius:7px;padding:5px;cursor:pointer;display:grid;place-items:center;}
.ft-photo-del:hover{background:var(--danger);}
.ft-lock{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.ft-side .label{text-align:left;}
.ft-lock-box{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px 24px;width:100%;max-width:340px;}
.recharts-cartesian-axis-tick-value{font-family:'IBM Plex Mono';font-size:11px;}
/* ---- sistema visual del prototipo 3a ---------------------------------------
   Tarjetas suaves (12px), tipo pequena, mono para todo lo que es metadato, y
   el color como semantica: teal = va bien / accion principal, naranja = pide
   atencion, azul = ajuste sugerido. --------------------------------------- */
.ft-dc{max-width:1120px;margin:0 auto;}
.ft-dc-head{position:sticky;top:0;z-index:20;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:10px 2px 13px;border-bottom:1px solid var(--line);background:var(--bg);}
.ft-dc-head h1{margin:0;font-family:'Archivo';font-weight:700;font-size:24px;line-height:1;letter-spacing:-.03em;}
.ft-dc-head .sub{display:block;font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.1em;}
/* Escritorio: las mismas secciones del prototipo repartidas en dos columnas,
   no una columna de movil estirada. */
/* Rejilla fluida en vez de un salto seco a dos columnas en 860 px. El minimo es
   380 y no los 240 del handoff: aqui las tarjetas llevan graficos, no los tiles
   numericos del prototipo, y a 315 px las etiquetas de eje se salen del area. */
.ft-dc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px;align-items:start;margin-top:12px;}
.ft-dc-grid>.ft-dc-card,.ft-dc-grid>*>.ft-dc-card{margin-top:0;}
.ft-dc-grid .span2{grid-column:1 / -1;}
@media (max-width:420px){.ft-dc-grid{grid-template-columns:1fr;}}
.ft-dc-chips{display:flex;gap:6px;flex-wrap:wrap;padding:14px 0 0;}
.ft-dc-chips button{font-family:'IBM Plex Mono';font-weight:600;font-size:10.5px;padding:7px 11px;border-radius:6px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;}
.ft-dc-chips button:hover{color:var(--text);}
.ft-dc-chips button.on{background:var(--accentdim);border-color:var(--accent);color:var(--accent);}
/* Filtros del diario: todo incluido es el estado normal, asi que se pinta
   callado; lo que llama la atencion es lo que has dejado fuera. */
.ft-dc-chips button.off{opacity:.4;text-decoration:line-through;}
/* ---- plan: la semana de un vistazo ---------------------------------------
   Siete celdas iguales; el punto lleva el estado y el color hace el trabajo:
   verde hecho, naranja sin registrar, apagado libre o por venir. */
.ft-plan-week{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:12px;}
.ft-plan-week button{background:var(--panel);border:0;cursor:pointer;padding:11px 4px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--text);min-width:0;}
.ft-plan-week button:hover{background:color-mix(in srgb,var(--text) 6%,transparent);}
.ft-plan-week button.sel{background:color-mix(in srgb,var(--accent) 12%,var(--panel));box-shadow:inset 0 -2px 0 var(--accent);}
.ft-plan-week .k{font-family:'IBM Plex Mono';font-weight:600;font-size:11px;letter-spacing:.1em;}
.ft-plan-week .dot{width:7px;height:7px;border-radius:50%;background:var(--line);}
.ft-root .ft-plan-week .n{font-family:'IBM Plex Mono';font-size:8.5px;letter-spacing:.06em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.ft-plan-week button.hecho .dot{background:var(--ok);}
.ft-plan-week button.hoy .dot{background:var(--accent);box-shadow:0 0 0 3px var(--accentdim);}
.ft-plan-week button.perdido .dot{background:var(--attn);}
.ft-plan-week button.previsto .dot{background:var(--muted);}
.ft-dc-search{flex:1;min-width:0;background:transparent;border:0;outline:0;font-family:'Hanken Grotesk';font-size:13px;color:var(--text);}
.ft-dc-search::placeholder{color:var(--muted);}
.ft-dc-strip{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line);}
.ft-dc-strip>div,.ft-dc-strip>button{background:var(--bg);padding:12px 14px;display:flex;flex-direction:column;gap:5px;min-width:0;}
.ft-dc-strip .k{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ft-dc-strip .v{font-family:'Archivo';font-weight:700;font-size:24px;line-height:1;letter-spacing:-.035em;font-variant-numeric:tabular-nums;}
.ft-dc-strip .v small{font-family:'IBM Plex Mono';font-weight:500;font-size:10px;color:var(--muted);margin-left:4px;letter-spacing:0;}
.ft-dc-strip .d{font-family:'IBM Plex Mono';font-weight:500;font-size:10px;color:var(--muted);}
/* Cifra que se puede abrir: la interrogacion solo aparece al pasar por encima,
   para no llenar la tira de simbolos. */
.ft-dc-strip button.ft-kpi{text-align:left;border:0;font:inherit;color:inherit;cursor:pointer;}
.ft-dc-strip button.ft-kpi:hover{background:color-mix(in srgb,var(--text) 5%,var(--bg));}
.ft-kpi .why{display:inline-grid;place-items:center;width:12px;height:12px;margin-left:5px;border-radius:50%;border:1px solid var(--line);font-size:8px;color:var(--muted);opacity:0;transition:opacity .12s;vertical-align:1px;}
.ft-kpi:hover .why,.ft-kpi:focus-visible .why{opacity:1;}
.ft-dc-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 16px;margin-top:12px;display:flex;flex-direction:column;gap:7px;}
.ft-dc-card.attn{border-left:3px solid var(--accent);}
.ft-dc-card.ft-dc-focus{outline:2px solid var(--accent);outline-offset:3px;transition:outline-color .4s;}
@media (prefers-reduced-motion:reduce){.ft-dc-card.ft-dc-focus{transition:none;}}
.ft-dc-alert{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;background:transparent;border:none;border-top:1px solid var(--hair);padding:9px 0 0;margin-top:2px;color:inherit;font-family:inherit;}
.ft-dc-alert .tx{flex:1;min-width:0;background:transparent;border:none;padding:0;text-align:left;color:var(--muted);font-family:inherit;font-size:12.5px;line-height:1.45;cursor:pointer;}
.ft-dc-x{flex:none;width:28px;height:28px;margin-top:-4px;border:none;background:transparent;color:var(--muted);font-size:19px;line-height:1;cursor:pointer;border-radius:7px;}
.ft-dc-x:hover{background:color-mix(in srgb,var(--text) 10%,transparent);color:var(--text);}
@media (max-width:720px){.ft-root .ft-dc-x{width:40px;height:40px;}}
.ft-dc-alert:first-of-type{border-top:none;padding-top:0;margin-top:0;}
.ft-dc-alert .dot{width:6px;height:6px;border-radius:50%;margin-top:6px;flex:none;}
.ft-dc-alert .tx b{color:var(--text);font-weight:700;}
.ft-dc-alert:hover .tx{color:var(--text);}
.ft-dc-alert .go{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted);}
.ft-dc-card .t{font-weight:700;font-size:15px;line-height:1.35;}
.ft-dc-card .b{font-size:12.5px;line-height:1.45;color:var(--muted);}
/* Nota al pie: misma voz en cualquier contenedor, no solo dentro de tarjeta. */
.ft-root .n{font-family:'IBM Plex Mono';font-size:10.5px;line-height:1.5;color:var(--muted);}
.ft-dc-card .h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.ft-dc-big{font-family:'Archivo';font-weight:700;font-size:30px;line-height:.9;letter-spacing:-.04em;font-variant-numeric:tabular-nums;}
.ft-dc-big small{font-family:'IBM Plex Mono';font-weight:500;font-size:11px;color:var(--muted);margin-left:5px;letter-spacing:0;}
.ft-dc-foot{display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid var(--hair);font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-dc-tag{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;padding:4px 8px;border-radius:5px;background:color-mix(in srgb,var(--ok) 18%,transparent);color:var(--ok);white-space:nowrap;}
.ft-dc-tag.late{background:color-mix(in srgb,var(--attn) 18%,transparent);color:var(--attn);}
.ft-dc-kicker{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--attn);}
.ft-dc-kicker span{color:var(--muted);letter-spacing:.06em;}
.ft-dc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:3px;}
.ft-dc-btn{font-family:'Hanken Grotesk';font-weight:700;font-size:12px;padding:10px 14px;border:none;border-radius:9px;background:var(--ok);color:var(--bg);cursor:pointer;}
.ft-dc-btn:hover{filter:brightness(1.08);}
.ft-dc-btn.warn{background:var(--accent);color:#faf7f0;}
.ft-dc-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text);font-weight:600;}
.ft-dc-btn.ghost:hover{border-color:var(--muted);filter:none;}
.ft-dc-chip{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.06em;padding:6px 9px;border-radius:7px;border:1px solid color-mix(in srgb,var(--ok) 42%,transparent);background:transparent;color:var(--ok);cursor:pointer;}
.ft-dc-ok{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--ok) 12%,transparent);border:1px solid color-mix(in srgb,var(--ok) 34%,transparent);border-radius:12px;padding:12px 15px;margin-top:12px;font-weight:600;font-size:12.5px;}
.ft-dc-quiet{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:color-mix(in srgb,var(--text) 5%,transparent);border:none;border-radius:10px;padding:10px 13px;margin-top:8px;color:var(--muted);font-family:'Hanken Grotesk';font-size:11.5px;cursor:pointer;}
.ft-dc-quiet:hover{background:color-mix(in srgb,var(--text) 9%,transparent);}
.ft-dc-quiet .dot{width:7px;height:7px;border-radius:50%;background:var(--attn);flex:none;}
.ft-dc-day{display:flex;align-items:baseline;justify-content:space-between;gap:9px;padding:18px 2px 7px;}
.ft-dc-day .t{font-family:'IBM Plex Mono';font-weight:700;font-size:13px;letter-spacing:.04em;}
.ft-dc-day .m{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-dc-list{border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.ft-dc-row{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:transparent;border:none;border-bottom:1px solid var(--hair);padding:10px 14px;cursor:pointer;color:inherit;}
.ft-dc-row:last-child{border-bottom:none;}
.ft-dc-row:hover{background:color-mix(in srgb,var(--text) 6%,transparent);}
.ft-dc-row .kind{font-family:'IBM Plex Mono';font-weight:500;font-size:9.5px;letter-spacing:.1em;color:var(--muted);width:58px;flex:none;}
.ft-dc-row .nm{font-weight:700;font-size:13.5px;}
.ft-dc-row .mt{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);margin-top:2px;}
.ft-dc-row .go{font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);}
.ft-lib{display:grid;grid-template-columns:1fr;gap:16px;align-items:start;margin-top:4px;}
@media (min-width:960px){.ft-lib.open{grid-template-columns:minmax(0,1fr) minmax(0,420px);}}
/* En movil la ficha no se apila debajo de la lista: la reemplaza, como el paso
   de cantidad del prototipo. Todos los paneles traen su propio Cerrar/Cancelar,
   asi que siempre hay vuelta atras. */
@media (max-width:959px){.ft-lib.open .ft-lib-list{display:none;}}
.ft-lib-list{min-width:0;display:flex;flex-direction:column;}
.ft-lib-detail{min-width:0;}
@media (min-width:960px){.ft-lib-detail{position:sticky;top:14px;}}
.ft-lib-field{display:flex;flex-direction:column;gap:5px;}
.ft-lib-field>span{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.ft-lib-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:9px;}
.ft-lib-add{display:grid;grid-template-columns:1fr 92px auto;gap:8px;align-items:center;}
@media (max-width:520px){.ft-lib-add{grid-template-columns:1fr;}}
.ft-root .ft-dc-row.sel{background:var(--accentdim);box-shadow:inset 2px 0 0 var(--accent);}
.ft-root .ft-dc-chip:disabled{cursor:default;}
.ft-more-user{display:flex;align-items:center;gap:13px;padding:16px 2px 4px;}
.ft-more-user .avatar{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:var(--text);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:900;font-size:19px;}
.ft-more-user b{display:block;font-family:'Archivo';font-weight:700;font-size:20px;letter-spacing:-.03em;text-transform:capitalize;line-height:1.1;}
.ft-more-user small{font-family:'IBM Plex Mono';font-size:10.5px;color:var(--muted);}
.ft-more-grid{display:grid;grid-template-columns:1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:14px;}
@media (min-width:760px){.ft-more-grid{grid-template-columns:1fr 1fr;}}
.ft-more-row{border-bottom:none;background:var(--bg);padding:14px 16px;}
.ft-more-row .nm{font-size:14px;}
.ft-dc-empty{font-family:'IBM Plex Mono';font-size:11.5px;line-height:1.5;color:var(--muted);padding:14px;}
.ft-dc-step{width:32px;height:32px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);font-family:'IBM Plex Mono';font-weight:600;font-size:15px;cursor:pointer;}
.ft-dc-step:hover{border-color:var(--muted);}
/* Solo en movil: en escritorio la cuenta esta al pie del rail y esto sobraria. */
.ft-dc-avatar{display:none;width:36px;height:36px;flex:none;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--text);font-family:'Archivo';font-weight:800;font-size:14px;cursor:pointer;}
@media (max-width:720px){.ft-dc-avatar{display:grid;place-items:center;}}
.ft-dc-step.sm{width:26px;height:26px;font-size:13px;}
/* Dedo, no raton: la app se usa entrenando. 40 px es el minimo comodo y por
   debajo de 32 se falla el toque con la mano ocupada. */
@media (max-width:720px){
  .ft-root .ft-dc-step,.ft-root .ft-dc-step.sm{width:40px;height:40px;font-size:17px;}
  .ft-root .ft-dc-chip,.ft-root .ft-dc-chips button,.ft-root .ft-secchip,.ft-root .ft-measures button{min-height:36px;}
  .ft-root .ft-trash,.ft-root .ft-addset,.ft-root .ft-iconbtn{min-height:40px;min-width:40px;}
  .ft-root .ft-input,.ft-root .ft-select,.ft-root .ft-dc-search,.ft-root .ft-dc-btn{min-height:40px;}
}
.ft-dc-date{width:auto;min-width:132px;padding:7px 9px;font-size:12px;}
/* Cifra grande y editable, como el paso de cantidad del prototipo. */
.ft-qty{display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 0 2px;}
.ft-qty-input{width:min(150px,42vw);border:none;background:transparent;text-align:right;font-family:'Archivo';font-weight:700;font-size:40px;letter-spacing:-.04em;color:var(--text);padding:0;outline:none;font-variant-numeric:tabular-nums;}
.ft-qty-input:focus{color:var(--accent);}
.ft-qty .u{font-family:'IBM Plex Mono';font-size:13px;color:var(--muted);flex:none;}
/* Accion primaria de la pantalla: ancha, al final, y dice lo que va a pasar. */
.ft-dc-cta{width:100%;margin-top:16px;padding:15px 18px;border:none;border-radius:12px;background:var(--ok);color:var(--bg);font-family:'Hanken Grotesk';font-weight:700;font-size:14.5px;cursor:pointer;}
.ft-dc-cta:hover:enabled{filter:brightness(1.08);}
.ft-dc-cta:disabled{background:var(--panel2);color:var(--muted);cursor:default;}
.ft-dc-mio{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.12em;color:var(--muted);flex:none;}
.ft-dc-plus{font-family:'IBM Plex Mono';font-size:21px;line-height:1;color:var(--ok);flex:none;width:22px;text-align:center;}
.ft-dc-rpe{flex:1;min-width:0;text-align:center;font-family:'IBM Plex Mono';font-weight:600;font-size:11px;padding:9px 0;border-radius:6px;background:transparent;border:1px solid var(--line);color:var(--muted);cursor:pointer;}
.ft-dc-rpe:hover{color:var(--text);}
/* ---- movil: barra inferior de 5 destinos (Diario · Metricas · + · Plan · Mas) ---- */
/* Modo sesion: fondo propio y nada de navegacion alrededor. El handoff lo marca
   como intocable y era lo unico de la lista que se habia perdido al montar la
   sesion dentro del marco de la app. */
.ft-root.ft-focus{--bg:#141209;}
.ft-root.ft-focus .ft-side,.ft-root.ft-focus .ft-tabbar{display:none;}
.ft-root.ft-focus .ft-wrap,.ft-root.ft-focus .ft-wrap.with-side{max-width:760px;padding:18px 18px calc(28px + env(safe-area-inset-bottom));}
.ft-session{min-height:100vh;}
.ft-toast{position:fixed;right:18px;bottom:18px;z-index:60;max-width:min(360px,calc(100vw - 36px));background:var(--text);color:var(--bg);border-radius:10px;padding:12px 15px;font-weight:600;font-size:12.5px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.28);animation:ft-toast-in .18s ease;}
@keyframes ft-toast-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){.ft-toast{animation:none;}}
@media (max-width:720px){.ft-toast{left:12px;right:12px;max-width:none;bottom:calc(84px + env(safe-area-inset-bottom));}}
.ft-tabbar{display:none;position:fixed;left:0;right:0;bottom:0;z-index:45;align-items:flex-end;gap:4px;padding:8px 12px calc(10px + env(safe-area-inset-bottom));background:var(--panel);border-top:1px solid var(--line);}
.ft-tabbar button{flex:1;background:none;border:none;color:var(--muted);cursor:pointer;padding:6px 0;display:flex;flex-direction:column;align-items:center;gap:5px;font-family:'IBM Plex Mono';font-weight:600;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;}
.ft-tabbar button.active{color:var(--accent);}
.ft-tabbar button.add{color:var(--muted);}
.ft-tab-avatar{width:20px;height:20px;border-radius:50%;background:var(--muted);color:var(--bg);display:grid;place-items:center;font-family:'Archivo';font-weight:800;font-size:10px;}
.ft-tabbar button.active .ft-tab-avatar{background:var(--accent);color:#f3efe6;}
.ft-tabbar button.add .circle{width:52px;height:52px;border-radius:50%;background:var(--ok);color:var(--bg);display:grid;place-items:center;box-shadow:0 6px 18px var(--accentdim);}
.ft-sheet{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;}
.ft-sheet-panel{width:100%;max-width:560px;margin:0 auto;border-radius:16px 16px 0 0;max-height:80vh;overflow:auto;background:var(--panel);border-top:1px solid var(--line);padding:16px 16px calc(20px + env(safe-area-inset-bottom));animation:ft-up .18s ease;}
@keyframes ft-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
.ft-sheet-panel h3{margin:0 0 12px;font-family:'Archivo';font-weight:800;text-transform:uppercase;font-size:15px;letter-spacing:-.01em;display:flex;align-items:center;}
.ft-sheet-panel h3 button{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;}
.ft-sheet-row{display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;border-bottom:1px solid var(--line);color:var(--text);padding:14px 2px;cursor:pointer;font:600 14px 'Hanken Grotesk',sans-serif;text-align:left;}
.ft-sheet-row:last-child{border-bottom:none;}
.ft-sheet-row .sub{margin-left:auto;font-family:'IBM Plex Mono';font-size:11px;color:var(--muted);font-weight:400;}
@media (max-width:720px){
  .ft-side{display:none;}
  .ft-wrap.with-side{padding-left:18px;padding-bottom:104px;}
  .ft-tabbar{display:flex;}
}
/* ---- re-skin 3a ------------------------------------------------------------
   Las pantallas que todavia no se reescribieron (Entrenar, Nutricion,
   Biblioteca, Rutinas, Ajustes) se pintan con estas clases base, asi que
   traducirlas aqui las migra a la vez sin tocar su JSX: tarjeta suave sobre
   panel, cabecera en mono en vez del titular de 23px, cifras de 24px en vez de
   44 y teal para la accion principal. ---------------------------------------- */
.ft-root .ft-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:15px 17px 17px;margin-bottom:12px;}
.ft-root .ft-card h2{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 14px;padding-bottom:0;border-bottom:none;gap:8px;}
.ft-root .ft-card h2 .tag{font-size:10px;letter-spacing:.06em;color:var(--muted);}
.ft-root .ft-h3{font-family:'IBM Plex Mono';font-weight:600;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.ft-root .ft-stat{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 15px 15px;}
.ft-root .ft-stat .k{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;margin-bottom:6px;}
.ft-root .ft-stat .v{font-family:'Archivo';font-weight:700;font-size:24px;letter-spacing:-.035em;font-variant-numeric:tabular-nums;}
.ft-root .ft-stat .v small{font-family:'IBM Plex Mono';font-size:10px;font-weight:500;}
.ft-root .ft-stat .sub{font-size:10.5px;margin-top:6px;}
.ft-root .ft-btn{border-radius:9px;background:var(--ok);color:var(--bg);font-weight:700;font-size:12px;padding:10px 14px;}
.ft-root .ft-btn:hover{filter:brightness(1.08);}
.ft-root .ft-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text);font-weight:600;}
.ft-root .ft-btn.ghost:hover{border-color:var(--muted);filter:none;}
.ft-root .ft-iconbtn{border-radius:9px;font-size:11.5px;}
.ft-root .ft-input,.ft-root .ft-select{border-radius:9px;background:var(--panel2);font-size:13px;padding:9px 11px;}
.ft-root .ft-field label{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:.14em;}
.ft-root .ft-li{border-radius:10px;background:var(--panel2);padding:10px 13px;}
.ft-root .ft-li .li-main{font-size:13.5px;font-weight:700;}
.ft-root .ft-li .li-d,.ft-root .ft-li .li-sub{font-size:10.5px;}
.ft-root .ft-ex{border-radius:12px;background:var(--panel2);}
.ft-root .ft-ex-head .nm{font-size:14px;}
.ft-root .ft-toggle{border-radius:9px;}
.ft-root .ft-toggle button{border-radius:7px;font-size:11.5px;}
.ft-root .ft-toggle button.on{background:var(--accentdim);color:var(--accent);}
.ft-root .ft-energy button{border-radius:8px;}
.ft-root .ft-energy button.on{background:var(--accentdim);color:var(--accent);border-color:var(--accent);}
.ft-root .ft-chip,.ft-root .ft-mu,.ft-root .ft-measures button{border-radius:6px;}
.ft-root .ft-secchip{border-radius:20px;}
.ft-root .ft-secchip.on{border-color:var(--ok);color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,transparent);}
.ft-root .ft-set .si,.ft-root .ft-addset{border-radius:8px;}
.ft-root .ft-alert{border-radius:12px;font-size:13px;}
.ft-root .ft-alert .t{font-size:14px;}
.ft-root .ft-alert .b{font-size:12.5px;}
.ft-root .ft-combo-list,.ft-root .ft-lock-box{border-radius:12px;}
.ft-root .ft-combo-list button{font-size:13px;}
.ft-root .ft-prev{border-radius:10px;font-size:12px;}
.ft-root .ft-photo{border-radius:10px;}
.ft-root .ft-photo-del,.ft-root .ft-trash{border-radius:8px;}
.ft-root .ft-datebar .nav{border-radius:9px;}
.ft-root .ft-logo .mark,.ft-root .ft-side-logo .mark{border-radius:9px;}
.ft-root .ft-nav button{border-radius:9px;}
.ft-root .ft-nav button.active,.ft-root .ft-logo .mark,.ft-root .ft-side-logo .mark{color:#f3efe6;}
.ft-root .ft-empty{font-family:'IBM Plex Mono';font-size:12px;}
`;
