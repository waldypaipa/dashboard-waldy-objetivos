const LS = "okr-actuales-v1";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(n);
const clamp = (n) => Math.max(0, Math.min(100, n));
const ESTADOS = { cumplido: "Cumplido", ok: "En ruta", riesgo: "En riesgo", desviado: "Desviado" };
const filtro = { obj: "todos", estado: "todos" };

// --- Valores guardados en este navegador (solo se guarda el valor "actual") ---
let guardados = {};
try { guardados = JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) {}
OBJETIVOS.forEach((o) => o.krs.forEach((k) => { if (k.id in guardados) k.actual = guardados[k.id]; }));

function guardar() {
  const mapa = {};
  OBJETIVOS.forEach((o) => o.krs.forEach((k) => (mapa[k.id] = k.actual)));
  try { localStorage.setItem(LS, JSON.stringify(mapa)); } catch (e) {}
}

// --- Cálculos ---
// Avance esperado hoy = porcentaje del periodo que ya transcurrió.
function esperado() {
  const i = new Date(PERIODO.inicio), f = new Date(PERIODO.fin);
  return clamp(((new Date() - i) / (f - i)) * 100);
}
// Avance real = recorrido entre el valor inicial y la meta (funciona si la meta sube o baja).
const avance = (k) => ((k.actual - k.inicio) / (k.meta - k.inicio)) * 100;

// Estado según la desviación frente a lo esperado: hasta -10 pts en ruta, hasta -25 en riesgo.
function estadoDe(p, esp) {
  if (p >= 100) return "cumplido";
  const d = p - esp;
  return d >= -10 ? "ok" : d >= -25 ? "riesgo" : "desviado";
}

function calcular() {
  const esp = esperado();
  const krs = OBJETIVOS.flatMap((o) =>
    o.krs.map((k) => {
      const p = avance(k);
      return { ...k, obj: o, p, dev: p - esp, est: estadoDe(p, esp) };
    })
  );
  return { esp, krs };
}

// --- Piezas de interfaz ---
const barra = (p, esp, est) =>
  `<div class="barra ${est}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(clamp(p))}">
     <i style="width:${clamp(p)}%"></i><u style="left:${esp}%" title="Avance esperado hoy"></u>
   </div>`;

const filaKR = (k, esp) => `
  <li class="kr">
    <div class="kr-t">
      <span class="id">${esc(k.id)}</span>
      <h3>${esc(k.titulo)}</h3>
      <span class="chip ${k.est}">${ESTADOS[k.est]}</span>
    </div>
    ${barra(k.p, esp, k.est)}
    <div class="kr-d">
      <label>Actual <input type="number" step="any" value="${k.actual}" data-id="${esc(k.id)}"> ${esc(k.unidad)}</label>
      <span>Meta: ${fmt(k.meta)} ${esc(k.unidad)}</span>
      <b>${fmt(k.p)} %</b>
    </div>
  </li>`;

function render() {
  const { esp, krs } = calcular();
  const gen = krs.reduce((a, k) => a + clamp(k.p), 0) / krs.length;
  const cuenta = (e) => krs.filter((k) => k.est === e).length;

  $("#periodo").textContent = `${PERIODO.nombre}. Ya pasó el ${fmt(esp)} % del tiempo.`;

  $("#resumen").innerHTML = `
    <div class="general">
      <h2>Avance general</h2>
      <p class="gran">${fmt(gen)} %</p>
      ${barra(gen, esp, estadoDe(gen, esp))}
      <p class="nota">La línea marca lo esperado hoy: ${fmt(esp)} %.</p>
    </div>
    <ul class="conteo">
      ${Object.keys(ESTADOS).map((e) => `<li class="${e}"><b>${cuenta(e)}</b> ${ESTADOS[e]}</li>`).join("")}
    </ul>`;

  const visibles = krs.filter(
    (k) => (filtro.obj === "todos" || k.obj.id === filtro.obj) && (filtro.estado === "todos" || k.est === filtro.estado)
  );

  const bloques = OBJETIVOS.filter((o) => visibles.some((k) => k.obj === o)).map((o) => {
    const propios = krs.filter((k) => k.obj === o);
    const po = propios.reduce((a, k) => a + clamp(k.p), 0) / propios.length;
    return `
      <article class="obj">
        <header>
          <h2><span class="id">${esc(o.id)}</span> ${esc(o.titulo)}</h2>
          <strong>${fmt(po)} %</strong>
        </header>
        ${barra(po, esp, estadoDe(po, esp))}
        <ul>${visibles.filter((k) => k.obj === o).map((k) => filaKR(k, esp)).join("")}</ul>
      </article>`;
  });
  $("#objetivos").innerHTML = bloques.length
    ? bloques.join("")
    : `<p class="vacio">Ningún resultado clave coincide con los filtros. Cambia el objetivo o el estado.</p>`;

  const peores = krs.filter((k) => k.dev < 0 && k.est !== "cumplido").sort((a, b) => a.dev - b.dev).slice(0, 5);
  $("#mejora").innerHTML = `
    <h2>Áreas de mejora</h2>
    <p class="nota">Puntos por debajo (o por encima) del avance esperado hoy.</p>
    ${peores.length
      ? `<ul>${peores.map((k) => `
          <li>
            <div><span class="id">${esc(k.id)}</span> ${esc(k.titulo)}</div>
            <div class="dev ${k.est}"><i style="width:${Math.min(100, Math.abs(k.dev))}%"></i><b>${fmt(k.dev)} pts</b></div>
          </li>`).join("")}</ul>`
      : `<p class="vacio">Todos los resultados clave van al ritmo esperado.</p>`}`;
}

// --- Filtros ---
$("#f-obj").innerHTML =
  `<option value="todos">Todos</option>` + OBJETIVOS.map((o) => `<option value="${esc(o.id)}">${esc(o.id)} ${esc(o.titulo)}</option>`).join("");
$("#f-obj").addEventListener("change", (e) => { filtro.obj = e.target.value; render(); });

$("#f-estado").innerHTML = [["todos", "Todos"], ...Object.entries(ESTADOS)]
  .map(([v, t]) => `<button type="button" data-e="${v}" aria-pressed="${v === "todos"}">${t}</button>`).join("");
$("#f-estado").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  filtro.estado = b.dataset.e;
  document.querySelectorAll("#f-estado button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  render();
});

// --- Edición del valor actual por los operarios ---
$("#objetivos").addEventListener("change", (e) => {
  const input = e.target.closest("input[data-id]");
  const v = input ? parseFloat(input.value) : NaN;
  if (isNaN(v)) return;
  OBJETIVOS.forEach((o) => o.krs.forEach((k) => { if (k.id === input.dataset.id) k.actual = v; }));
  guardar();
  render();
});

$("#reset").addEventListener("click", () => {
  if (!confirm("Se borrarán los valores que se actualizaron en este navegador. ¿Continuar?")) return;
  try { localStorage.removeItem(LS); } catch (e) {}
  location.reload();
});

render();
