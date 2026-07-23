# Pixel Graphic SAS — Design System
**Ecosistema de Apps Internas**  
Versión 1.0 · Junio 2026

> Este documento especifica todos los tokens, componentes y patrones visuales usados en las apps del ecosistema Pixel (TC Monitor, CRM Pixel, WFM, Mensajería). Úsalo como punto de partida para cualquier nueva app interna.

---

## 1. Fundamentos

### 1.1 Tipografía

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
```

| Variable | Familia | Uso |
|---|---|---|
| `--font` | `'Space Grotesk', sans-serif` | Todo el texto de interfaz — labels, párrafos, botones, headings |
| `--mono` | `'JetBrains Mono', monospace` | Números, códigos, IDs, fechas, labels de sección, badges |

**Escala tipográfica:**

| Uso | Tamaño | Peso | Notas |
|---|---|---|---|
| Body / default | `14px` | 400 | Base del `body` |
| Texto de UI | `13px` | 400–500 | Celdas de tabla, formularios |
| Texto secundario | `12px` | 400 | Subtítulos, metadatos |
| Labels de sección (mono) | `9–10px` | 500 | `letter-spacing: .08–.12em`, `text-transform: uppercase` |
| Page title (topbar) | `16px` | 600 | |
| Modal title | `15px` | 600 | |
| Stat card value | `24px` | 700 | |
| Botones | `13px` | 500 | |
| Badges | `11px` | 500 | font-family: mono |

---

### 1.2 Paleta de Colores

```css
:root {
  /* ── Fondos ── */
  --bg:        #0D1117;   /* Fondo principal de la app */
  --surface:   #161B22;   /* Sidebar, cards, modales, topbar */
  --surface2:  #1C2128;   /* Hover de filas, inputs, search box */
  --surface3:  #21262D;   /* Header de tabla, pill tabs, totals box */

  /* ── Bordes ── */
  --border:    #30363D;   /* Borde estándar */
  --border2:   #3D444D;   /* Borde de modales, énfasis */

  /* ── Texto ── */
  --text:      #E6EDF3;   /* Texto principal */
  --text2:     #8B949E;   /* Texto secundario, labels, placeholders */
  --text3:     #484F58;   /* Texto deshabilitado, labels de sección */

  /* ── Acento principal ── */
  --accent:    #4f8ef7;   /* Azul — botón primario, item activo sidebar, focus, links */
  --accent2:   #1f6feb;   /* Azul oscuro — hover de botón primario, avatar */

  /* ── Semánticos ── */
  --green:     #3FB950;   /* Éxito, aceptado, activo */
  --yellow:    #D29922;   /* Advertencia, pipeline, en estudio */
  --red:       #F85149;   /* Error, eliminado, rechazado */
  --orange:    #E3811C;   /* Alerta media */
  --purple:    #BC8CFF;   /* Misceláneo, año -4 en gráficas */
  --gold:      #C87941;   /* Historial importado, acento cálido */

  /* ── Geometría ── */
  --radius:    8px;        /* Radio estándar */
  --radius-lg: 12px;       /* Cards, modales, table-wrap */
}
```

**Paleta de transparencias (uso frecuente):**

```css
/* Badges — fondo semitransparente sobre --surface */
rgba(79,142,247, .15)   /* azul badge */
rgba(63,185,80,  .15)   /* verde badge */
rgba(210,153,34, .15)   /* amarillo badge */
rgba(248,81,73,  .15)   /* rojo badge */

/* Estados hover/focus */
rgba(79,142,247, .08)   /* área rellena gráfica año actual */
rgba(63,185,80,  .06)   /* área rellena gráfica aceptadas */

/* Overlay de modales */
rgba(0,0,0, .65)         /* backdrop */
```

---

### 1.3 Espaciado y Geometría

| Token | Valor | Uso |
|---|---|---|
| `--radius` | `8px` | Botones, inputs, badges, search box |
| `--radius-lg` | `12px` | Cards, modales, table-wrap, catalog-card |
| Content padding | `28px` | Padding interior de `.content` |
| Topbar height | `56px` | Barra superior sticky |
| Sidebar width | `230px` | Sidebar fija |
| Modal max-width std | `680px` | Modales estándar |
| Modal lg | `900px` | Modales grandes |
| Modal xl | `1100px` | Modales extra grandes (cotización) |

---

## 2. Layout Principal

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (230px, sticky, height:100vh)              │
│  ┌──────────────────────────────────────────────┐   │
│  │ logo-area (logo + nombre + subtítulo)        │   │
│  ├──────────────────────────────────────────────┤   │
│  │ nav (secciones + items)                      │   │
│  ├──────────────────────────────────────────────┤   │
│  │ sidebar-footer (avatar + nombre + logout)    │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  MAIN (flex:1)                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ TOPBAR (56px sticky) — title + actions       │   │
│  ├──────────────────────────────────────────────┤   │
│  │ CONTENT (padding: 28px) — página activa      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

```css
/* Estructura base */
.app    { display:flex; min-height:100vh; }
.sidebar {
  width:230px; min-width:230px;
  background:var(--surface);
  border-right:1px solid var(--border);
  display:flex; flex-direction:column;
  position:sticky; top:0; height:100vh; overflow-y:auto;
}
.main { flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar {
  background:var(--surface); border-bottom:1px solid var(--border);
  padding:0 28px; height:56px;
  display:flex; align-items:center; justify-content:space-between;
  position:sticky; top:0; z-index:10;
}
.content { flex:1; padding:28px; }
```

---

## 3. Sidebar

### Logo Area
```css
.logo-area {
  padding:16px 18px;
  border-bottom:1px solid var(--border);
  display:flex; align-items:center; gap:12px;
}
.logo-img  { width:65px; height:65px; object-fit:contain; }
.logo-name { font-size:13px; font-weight:700; letter-spacing:.03em; color:var(--text); }
.logo-sub  { font-family:var(--mono); font-size:9px; color:var(--text3);
             letter-spacing:.1em; text-transform:uppercase; margin-top:1px; }
```

> **Nota logo:** usar `mix-blend-mode:screen` en la imagen para que el fondo oscuro no tape el logo.

### Navegación
```css
.nav          { padding:10px 0; flex:1; }
.nav-section  { padding:10px 18px 4px; font-family:var(--mono); font-size:9px;
                letter-spacing:.12em; text-transform:uppercase; color:var(--text3); }
.nav-item     {
  display:flex; align-items:center; gap:9px;
  padding:8px 18px; cursor:pointer; font-size:13px; font-weight:500;
  color:var(--text2); border-left:2px solid transparent;
  transition:all .15s;
}
.nav-item:hover  { background:var(--surface2); color:var(--text); }
.nav-item.active { background:var(--surface2); color:var(--accent);
                   border-left-color:var(--accent); }
.nav-item svg    { width:15px; height:15px; flex-shrink:0; }
```

### Footer (usuario)
```css
.sidebar-footer { padding:14px 18px; border-top:1px solid var(--border); }
.user-avatar {
  width:28px; height:28px; border-radius:50%;
  background:var(--accent2);
  display:flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:700; color:#fff;
}
.user-name { font-size:12px; font-weight:500; }
.user-role { font-family:var(--mono); font-size:9px; color:var(--text3); }
```

---

## 4. Componentes

### 4.1 Botones

```css
.btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:7px 14px; border-radius:var(--radius);
  font-family:var(--font); font-size:13px; font-weight:500;
  cursor:pointer; border:none; transition:all .15s;
}
.btn svg { width:14px; height:14px; }
.btn-sm  { padding:5px 10px; font-size:12px; }

/* Variantes */
.btn-primary   { background:var(--accent);   color:#fff; }
.btn-primary:hover { background:var(--accent2); }

.btn-secondary { background:var(--surface3); color:var(--text);
                 border:1px solid var(--border); }
.btn-secondary:hover { background:var(--border); }

.btn-ghost     { background:none; color:var(--text2);
                 border:1px solid var(--border); }
.btn-ghost:hover { background:var(--surface2); color:var(--text); }

.btn-danger    { background:var(--red); color:#fff; }
.btn-danger:hover { opacity:.85; }
```

---

### 4.2 Stat Cards (KPIs)

```css
.stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
              gap:14px; margin-bottom:24px; }
.stat-card  {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-lg); padding:18px 20px;
}
.stat-label { font-family:var(--mono); font-size:10px; letter-spacing:.08em;
              text-transform:uppercase; color:var(--text3); margin-bottom:8px; }
.stat-value { font-size:24px; font-weight:700; line-height:1; }
.stat-sub   { font-size:11px; color:var(--text3); margin-top:4px; }

/* Colores semánticos en value */
.stat-accent { color:var(--accent); }
.stat-green  { color:var(--green); }
.stat-yellow { color:var(--yellow); }
.stat-red    { color:var(--red); }
```

```js
// Función generadora
function statCard(label, val, sub, color) {
  var cls = color ? 'stat-' + color : '';
  return '<div class="stat-card">' +
    '<div class="stat-label">' + label + '</div>' +
    '<div class="stat-value ' + cls + '">' + val + '</div>' +
    (sub ? '<div class="stat-sub">' + sub + '</div>' : '') +
  '</div>';
}
```

---

### 4.3 Tabla

```css
.table-wrap { background:var(--surface); border:1px solid var(--border);
              border-radius:var(--radius-lg); overflow:hidden; }
.table-header {
  padding:14px 20px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; flex-wrap:wrap;
}
table      { width:100%; border-collapse:collapse; }
thead tr   { border-bottom:1px solid var(--border); }
thead th   { padding:10px 16px; text-align:left;
             font-family:var(--mono); font-size:10px; letter-spacing:.08em;
             text-transform:uppercase; color:var(--text3); font-weight:500; }
tbody tr   { border-bottom:1px solid var(--border); transition:background .12s; }
tbody tr:last-child { border-bottom:none; }
tbody tr:hover      { background:var(--surface2); }
tbody td   { padding:11px 16px; font-size:13px; vertical-align:middle; }
.td-mono   { font-family:var(--mono); font-size:12px; }
```

---

### 4.4 Search Box

```css
.search-box {
  display:flex; align-items:center; gap:8px;
  background:var(--surface2); border:1px solid var(--border);
  border-radius:var(--radius); padding:6px 12px; min-width:220px;
}
.search-box input {
  background:none; border:none; outline:none;
  font-family:var(--font); font-size:13px; color:var(--text); width:100%;
}
.search-box input::placeholder { color:var(--text3); }
```

---

### 4.5 Badges

```css
.badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 8px; border-radius:20px;
  font-size:11px; font-weight:500; font-family:var(--mono);
}
.badge-blue   { background:rgba(79,142,247,.15); color:var(--accent); }
.badge-green  { background:rgba(63,185,80,.15);  color:var(--green); }
.badge-yellow { background:rgba(210,153,34,.15); color:var(--yellow); }
.badge-red    { background:rgba(248,81,73,.15);  color:var(--red); }
.badge-gray   { background:var(--surface3);      color:var(--text2); }
.badge-gold   { background:rgba(200,121,65,.15); color:var(--gold); }
```

---

### 4.6 Modales

```css
.modal-overlay {
  display:none; position:fixed; inset:0; z-index:100;
  background:rgba(0,0,0,.65);
  align-items:center; justify-content:center;
  backdrop-filter:blur(3px);
}
.modal-overlay.open { display:flex; }

.modal {
  background:var(--surface); border:1px solid var(--border2);
  border-radius:var(--radius-lg); width:min(680px,95vw);
  max-height:90vh; overflow-y:auto;
  box-shadow:0 24px 64px rgba(0,0,0,.5);
}
.modal-lg { width:min(900px,95vw); }
.modal-xl { width:min(1100px,95vw); }

.modal-header {
  padding:18px 22px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
}
.modal-title  { font-size:15px; font-weight:600; }
.modal-body   { padding:22px; }
.modal-footer { padding:14px 22px; border-top:1px solid var(--border);
                display:flex; justify-content:flex-end; gap:10px; }
```

```js
// Abrir/cerrar
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Cerrar al click fuera
document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
```

---

### 4.7 Formularios

```css
.form-grid   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-grid-3 { grid-template-columns:1fr 1fr 1fr; }
.form-full   { grid-column:1/-1; }
.form-group  { display:flex; flex-direction:column; gap:5px; }

.form-label  { font-family:var(--mono); font-size:10px; letter-spacing:.08em;
               text-transform:uppercase; color:var(--text3); }

.form-input,
.form-select,
.form-textarea {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:var(--radius); color:var(--text);
  font-family:var(--font); font-size:13px; padding:8px 11px;
  outline:none; transition:border-color .15s; width:100%;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus { border-color:var(--accent); }

.form-textarea { resize:vertical; min-height:70px; }
.form-select   { appearance:none; cursor:pointer; }
option         { background:var(--surface2); }
```

---

### 4.8 Pill Tabs (filtros)

```css
.pill-tabs { display:flex; gap:4px; background:var(--surface2);
             border:1px solid var(--border); border-radius:var(--radius); padding:3px; }
.pill-tab  { padding:5px 14px; border-radius:6px; font-size:12px; font-weight:500;
             cursor:pointer; color:var(--text2); transition:all .15s;
             border:none; background:none; font-family:var(--font); }
.pill-tab.active { background:var(--surface3); color:var(--text); }
```

---

### 4.9 Toast (notificaciones)

```css
.toast {
  position:fixed; bottom:24px; right:24px; z-index:300;
  background:var(--surface2); border:1px solid var(--border2);
  border-radius:var(--radius); padding:12px 16px; font-size:13px;
  display:none; align-items:center; gap:10px;
  box-shadow:0 8px 24px rgba(0,0,0,.4); min-width:240px;
}
.toast.show     { display:flex; }
.toast.toast-ok { border-left:3px solid var(--green); }
.toast.toast-err{ border-left:3px solid var(--red); }
```

```js
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show toast-' + (type || 'ok');
  setTimeout(function() { t.classList.remove('show'); }, 3200);
}
```

---

### 4.10 Loading Overlay

```css
.loading-overlay { display:none; position:fixed; inset:0;
                   background:rgba(0,0,0,.4); z-index:200;
                   align-items:center; justify-content:center; }
.loading-overlay.show { display:flex; }

.spinner { width:20px; height:20px; border:2px solid var(--border);
           border-top-color:var(--accent); border-radius:50%;
           animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
```

```js
function showLoading() { document.getElementById('loadingOverlay').classList.add('show'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }
```

---

### 4.11 Empty State

```css
.empty-state { padding:60px 20px; text-align:center; }
.empty-state svg  { color:var(--text3); margin-bottom:14px; }
.empty-state h3   { font-size:15px; font-weight:600; margin-bottom:6px; }
.empty-state p    { font-size:13px; color:var(--text2); margin-bottom:20px; }
```

---

### 4.12 Tags (etiquetas inline)

```css
.tag { display:inline-block; padding:2px 7px; border-radius:4px;
       font-size:10px; font-family:var(--mono);
       background:var(--surface3); color:var(--text2); }
```

---

## 5. Patrones de Gráficas (Chart.js)

### Configuración estándar de colores para Chart.js

```js
// Paleta interanual (por posición desde el más reciente)
var paletaAnual = [
  { r:79,  g:142, b:247 },  // azul    — año actual
  { r:210, g:153, b:34  },  // amarillo — año -1
  { r:63,  g:185, b:80  },  // verde    — año -2
  { r:248, g:81,  b:73  },  // rojo     — año -3
  { r:188, g:140, b:255 },  // morado   — año -4+
];

function rgba(p, a) { return 'rgba('+p.r+','+p.g+','+p.b+','+a+')'; }
// Protagonista: alpha 1.0 | Secundarios: alpha 0.25 (ajustable)
```

### Opciones globales de Chart.js

```js
options: {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      labels: {
        color: '#8B949E',
        font: { family: 'Space Grotesk', size: 12 },
        boxWidth: 12, boxHeight: 12,
        usePointStyle: true, pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: '#1C2128',
      borderColor: '#30363D',
      borderWidth: 1,
      titleColor: '#E6EDF3',
      bodyColor: '#8B949E',
      padding: 10
    }
  },
  scales: {
    x: {
      grid:  { color: 'rgba(48,54,61,0.6)' },
      ticks: { color: '#484F58', font: { family: 'JetBrains Mono', size: 11 } }
    },
    y: {
      grid:  { color: 'rgba(48,54,61,0.6)' },
      ticks: { color: '#484F58', font: { family: 'JetBrains Mono', size: 11 } }
    }
  }
}
```

---

## 6. Pantalla de Login

```css
.login-wrap {
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:var(--bg);
}
.login-box {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-lg); padding:40px; width:min(400px,92vw);
  box-shadow:0 24px 64px rgba(0,0,0,.4);
}
.login-err {
  background:rgba(248,81,73,.12); border:1px solid rgba(248,81,73,.3);
  border-radius:var(--radius); padding:10px 12px;
  font-size:12px; color:var(--red); margin-bottom:16px; display:none;
}
```

---

## 7. Utilidades y Helpers JS

```js
// Formatear COP
function fmtCOP(n) {
  if (!n || isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString('es-CO');
}

// Formatear fecha YYYY-MM-DD
function fmtDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var day = String(d.getDate()).padStart(2,'0');
  return y + '-' + m + '-' + day;
}

// Escapar HTML
function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
```

---

## 8. CDNs Estándar del Ecosistema

```html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

<!-- EmailJS (notificaciones) -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>

<!-- Chart.js (gráficas) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>

<!-- jsPDF + html2canvas (descarga PDF) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- SheetJS (importar/exportar Excel) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

---

## 9. Reglas de Código (patrones obligatorios)

| Regla | Detalle |
|---|---|
| `var` sobre `const/let` | Evita errores de botones no funcionales bajo GitHub Pages en producción |
| Sin `defer` en CDN scripts | El JS inline depende de que las librerías estén cargadas síncronamente |
| Sin emoji en strings JS | Los variation selectors Unicode rompen la sintaxis — usar entidades HTML (`&#128465;`) |
| Sin `orderBy` sin índice | Ordenar en cliente con `.sort()` — evita errores de índices compuestos en Firestore |
| Documentos Firestore < 1MB | Chunk de arrays grandes (ej. transacciones) a ~50 items por documento |
| Case-sensitive en GitHub Pages | `Logo.png ≠ logo.png` — respetar mayúsculas exactas en rutas de archivos |
| Firebase bajo cuenta personal | `alejomorales3d@gmail.com`, nunca bajo `pixel-g.com` Workspace — evita bloqueo de Firestore desde browser |
| Región Firestore | Siempre `southamerica-east1` (São Paulo) en proyectos Pixel |

---

## 10. Favicon Estándar (SVG inline)

```html
<!-- Reemplazar los colores y formas según la app -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230D1117'/%3E%3C!-- icono aquí --%3E%3C/svg%3E">
```

**Paleta favicon:** fondo `#0D1117`, ícono en `#4f8ef7` (accent) o `#E6EDF3` (texto).

---

## 11. Estructura HTML Base (template)

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NOMBRE APP — Pixel Graphic SAS</title>
<link rel="icon" type="image/svg+xml" href="...favicon SVG...">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
<!-- Firebase -->
<!-- Otras librerías según la app -->
<style>
  /* 1. :root con todos los tokens */
  /* 2. Reset + body */
  /* 3. Layout (.app, .sidebar, .main, .topbar, .content) */
  /* 4. Sidebar componentes */
  /* 5. Componentes UI (botones, cards, tabla, modal, forms...) */
  /* 6. Estilos específicos de la app */
</style>
</head>
<body>

<!-- LOGIN -->
<div id="loginWrap" class="login-wrap">...</div>

<!-- APP -->
<div id="appWrap" class="app" style="display:none">
  <aside class="sidebar">
    <div class="logo-area">...</div>
    <nav class="nav">...</nav>
    <div class="sidebar-footer">...</div>
  </aside>
  <div class="main">
    <div class="topbar">...</div>
    <div class="content" id="pageContent"></div>
  </div>
</div>

<!-- MODALES -->
<!-- LOADING + TOAST -->
<div class="loading-overlay" id="loadingOverlay"><div class="spinner" style="width:36px;height:36px;border-width:3px"></div></div>
<div class="toast" id="toast"></div>

<script>
// 1. Firebase config + init
// 2. EmailJS init (si aplica)
// 3. Estado global (var currentUser, var data...)
// 4. Auth (onAuthStateChanged, doLogin, doLogout)
// 5. loadAll() — carga inicial de datos
// 6. navTo() — navegación entre módulos
// 7. Módulos (render + CRUD por cada sección)
// 8. Helpers (fmtCOP, fmtDate, esc, openModal, closeModal, showToast...)
</script>
</body>
</html>
```

---

*Pixel Graphic SAS · Design System v1.0 · Junio 2026*
