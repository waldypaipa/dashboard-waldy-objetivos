// ============================================================
// EDITA ESTE ARCHIVO con los objetivos y KR reales del grupo.
// inicio = valor de partida | meta = valor a alcanzar | actual = valor hoy
// Sirve también para metas que BAJAN (ej. defectos: inicio 8, meta 3).
// Las fechas usan formato AAAA-MM-DD.
// ============================================================

const PERIODO = { nombre: "Q4 2026", inicio: "2026-10-01", fin: "2026-12-31" };

const OBJETIVOS = [
  {
    id: "O1",
    titulo: "Mejorar la calidad del producto",
    krs: [
      { id: "KR1.1", titulo: "Reducir el porcentaje de piezas defectuosas", unidad: "%", inicio: 8, meta: 3, actual: 7.2 },
      { id: "KR1.2", titulo: "Aumentar las inspecciones de calidad completadas", unidad: "%", inicio: 60, meta: 95, actual: 74 },
      { id: "KR1.3", titulo: "Bajar los reclamos de clientes por mes", unidad: "reclamos", inicio: 20, meta: 8, actual: 19 }
    ]
  },
  {
    id: "O2",
    titulo: "Aumentar la eficiencia en planta",
    krs: [
      { id: "KR2.1", titulo: "Subir la eficiencia global de los equipos (OEE)", unidad: "%", inicio: 62, meta: 80, actual: 66 },
      { id: "KR2.2", titulo: "Reducir las horas de parada no planificada", unidad: "h/mes", inicio: 40, meta: 15, actual: 28 },
      { id: "KR2.3", titulo: "Entregar pedidos a tiempo", unidad: "%", inicio: 82, meta: 96, actual: 84 }
    ]
  },
  {
    id: "O3",
    titulo: "Fortalecer la seguridad del equipo",
    krs: [
      { id: "KR3.1", titulo: "Capacitar al personal en seguridad", unidad: "personas", inicio: 0, meta: 40, actual: 14 },
      { id: "KR3.2", titulo: "Reducir los incidentes reportados", unidad: "incidentes", inicio: 9, meta: 2, actual: 8 }
    ]
  }
];
