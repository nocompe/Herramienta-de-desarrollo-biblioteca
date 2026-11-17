import { useEffect, useState } from "react";
import client from "../api/client.js";

const FORMULARIO_VACIO = {
  nombres: "",
  apellidos: "",
  dni: "",
  correo: "",
  telefono: "",
  tipo: "estudiante",
};

/**
 * MODULO 2 - Gestion de Socios (BiblioTech UTP)
 * Administracion integral de socios, limites de prestamos y estados.
 */
function Socios() {
  const [socios, setSocios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos, activo, suspendido
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos, estudiante, docente, externo
  const [modoVista, setModoVista] = useState("tabla"); // "tabla" | "tarjetas"
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [modalCarnetSocio, setModalCarnetSocio] = useState(null);
  const [modalHistorialSocio, setModalHistorialSocio] = useState(null);
  const [historialPrestamos, setHistorialPrestamos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const abrirHistorial = async (socio) => {
    setModalHistorialSocio(socio);
    setCargandoHistorial(true);
    try {
      const { data } = await client.get("/socios/" + socio.id + "/prestamos");
      setHistorialPrestamos(data.datos || []);
    } catch (e) {
      setError("No se pudo cargar el historial: " + e.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const exportarCSV = () => {
    if (sociosFiltrados.length === 0) {
      alert("No hay socios para exportar con los filtros seleccionados.");
      return;
    }
    const encabezados = ["ID", "Nombres", "Apellidos", "DNI", "Correo", "Teléfono", "Tipo", "Estado", "Fecha Registro"];
    const filas = sociosFiltrados.map((s) => [
      s.id,
      `"${(s.nombres || "").replace(/"/g, '""')}"`,
      `"${(s.apellidos || "").replace(/"/g, '""')}"`,
      `"${s.dni || ""}"`,
      `"${s.correo || ""}"`,
      `"${s.telefono || ""}"`,
      s.tipo,
      s.estado,
      s.fecha_registro || "",
    ]);

    const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `socios_bibliotech_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const cargarSocios = async (texto = "") => {
    try {
      const { data } = await client.get("/socios", {
        params: texto ? { buscar: texto } : {},
      });
      setSocios(data.datos || []);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    cargarSocios();
  }, []);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const abrirModalNuevo = () => {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setError("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (socio) => {
    setEditandoId(socio.id);
    setFormulario({
      nombres: socio.nombres,
      apellidos: socio.apellidos,
      dni: socio.dni,
      correo: socio.correo,
      telefono: socio.telefono || "",
      tipo: socio.tipo,
    });
    setError("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setError("");
    setExito("");
    try {
      if (editandoId) {
        await client.put("/socios/" + editandoId, formulario);
        setExito("Socio actualizado con exito.");
      } else {
        await client.post("/socios", formulario);
        setExito("Socio registrado con exito.");
      }
      cerrarModal();
      cargarSocios(buscar);
      setTimeout(() => setExito(""), 4000);
    } catch (e) {
      setError(e.message);
    }
  };

  const cambiarEstado = async (socio) => {
    const accion = socio.estado === "activo" ? "suspender" : "reactivar";
    if (!window.confirm(`¿Estas seguro de ${accion} a ${socio.nombre_completo}?`)) return;

    try {
      const { data } = await client.patch("/socios/" + socio.id + "/estado");
      setExito(data.mensaje);
      cargarSocios(buscar);
      setTimeout(() => setExito(""), 4000);
    } catch (e) {
      setError(e.message);
    }
  };

  // Filtrado reactivo en cliente
  const sociosFiltrados = socios.filter((s) => {
    const cumpleEstado = filtroEstado === "todos" || s.estado === filtroEstado;
    const cumpleTipo = filtroTipo === "todos" || s.tipo === filtroTipo;
    return cumpleEstado && cumpleTipo;
  });

  // Metricas
  const totalActivos = socios.filter((s) => s.estado === "activo").length;
  const totalSuspendidos = socios.filter((s) => s.estado !== "activo").length;
  const totalEstudiantes = socios.filter((s) => s.tipo === "estudiante").length;
  const totalDocentes = socios.filter((s) => s.tipo === "docente").length;

  const obtenerIniciales = (nombreCompleto) => {
    if (!nombreCompleto) return "S";
    return nombreCompleto
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const getBadgeTipoInfo = (tipo) => {
    switch (tipo) {
      case "docente":
        return { bg: "#f3e8ff", color: "#6b21a8", icon: "💼", label: "Docente (Máx. 5)" };
      case "estudiante":
        return { bg: "#e0f2fe", color: "#0369a1", icon: "🎓", label: "Estudiante (Máx. 3)" };
      default:
        return { bg: "#f1f5f9", color: "#475569", icon: "🌐", label: "Externo (Máx. 1)" };
    }
  };

  return (
    <section style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Encabezado con accion principal */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div>
          <div style={{ fontSize: "0.82rem", color: "var(--rojo-utp)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            BiblioTech UTP • Módulo Oficial
          </div>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.75rem", fontWeight: "800" }}>Gestión de Socios</h1>
          <p style={{ margin: "3px 0 0", color: "var(--gris-medio)", fontSize: "0.92rem" }}>
            Registro de lectores, control de membresías y límites máximos de préstamos
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={exportarCSV}
            style={{
              background: "#059669",
              padding: "0.65rem 1.15rem",
              fontSize: "0.92rem",
              fontWeight: "600",
              borderRadius: "8px",
              boxShadow: "0 3px 8px rgba(5, 150, 105, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "#fff",
              border: "none",
            }}
            title="Exportar socios filtrados a formato CSV"
          >
            <span>📥</span> Exportar CSV
          </button>
          <button
            onClick={abrirModalNuevo}
            style={{
              background: "var(--rojo-utp)",
              padding: "0.65rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(200, 16, 46, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <span>＋</span> Registrar Nuevo Socio
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && <div className="alerta error" style={{ borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>⚠️ {error}</div>}
      {exito && <div className="alerta exito" style={{ borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>✅ {exito}</div>}

      {/* Tarjetas KPI de Metricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="tarjeta"
          style={{
            margin: 0,
            padding: "1.1rem 1.25rem",
            borderRadius: "10px",
            borderLeft: "5px solid var(--rojo-utp)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--gris-medio)", textTransform: "uppercase" }}>
                Total Socios
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", marginTop: "2px" }}>{socios.length}</div>
            </div>
            <div style={{ fontSize: "1.8rem", opacity: 0.85 }}>👥</div>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--gris-medio)", marginTop: "6px" }}>
            {totalEstudiantes} estudiantes • {totalDocentes} docentes
          </div>
        </div>

        <div
          className="tarjeta"
          style={{
            margin: 0,
            padding: "1.1rem 1.25rem",
            borderRadius: "10px",
            borderLeft: "5px solid var(--verde)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--verde)", textTransform: "uppercase" }}>
                Socios Activos
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--verde)", marginTop: "2px" }}>
                {totalActivos}
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", opacity: 0.85 }}>🟢</div>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--verde)", marginTop: "6px" }}>
            Habilitados para préstamos
          </div>
        </div>

        <div
          className="tarjeta"
          style={{
            margin: 0,
            padding: "1.1rem 1.25rem",
            borderRadius: "10px",
            borderLeft: "5px solid var(--ambar)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--ambar)", textTransform: "uppercase" }}>
                Suspendidos
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--ambar)", marginTop: "2px" }}>
                {totalSuspendidos}
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", opacity: 0.85 }}>⏸️</div>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--gris-medio)", marginTop: "6px" }}>
            {totalSuspendidos === 0 ? "Sin penalizaciones activas" : "Con préstamos bloqueados"}
          </div>
        </div>
      </div>

      {/* Barra de Filtros Doble y Busqueda */}
      <div
        className="tarjeta"
        style={{
          borderRadius: "10px",
          padding: "1.2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          {/* Filtro por estado */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--gris-medio)", marginRight: "4px" }}>
              ESTADO:
            </span>
            <button
              type="button"
              onClick={() => setFiltroEstado("todos")}
              style={{
                fontSize: "0.8rem",
                padding: "4px 12px",
                borderRadius: "20px",
                background: filtroEstado === "todos" ? "var(--gris-oscuro)" : "#f1f5f9",
                color: filtroEstado === "todos" ? "#fff" : "var(--gris-oscuro)",
                border: "1px solid #cbd5e1",
              }}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("activo")}
              style={{
                fontSize: "0.8rem",
                padding: "4px 12px",
                borderRadius: "20px",
                background: filtroEstado === "activo" ? "var(--verde)" : "#f1f5f9",
                color: filtroEstado === "activo" ? "#fff" : "var(--gris-oscuro)",
                border: "1px solid #cbd5e1",
              }}
            >
              ● Solo Activos
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("suspendido")}
              style={{
                fontSize: "0.8rem",
                padding: "4px 12px",
                borderRadius: "20px",
                background: filtroEstado === "suspendido" ? "var(--ambar)" : "#f1f5f9",
                color: filtroEstado === "suspendido" ? "#fff" : "var(--gris-oscuro)",
                border: "1px solid #cbd5e1",
              }}
            >
              ● Suspendidos
            </button>
          </div>

          {/* Filtro por tipo */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--gris-medio)" }}>TIPO:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ padding: "4px 8px", fontSize: "0.82rem", width: "auto", borderRadius: "6px" }}
            >
              <option value="todos">Todos los tipos</option>
              <option value="estudiante">🎓 Estudiantes</option>
              <option value="docente">💼 Docentes</option>
              <option value="externo">🌐 Externos</option>
            </select>
          </div>
        </div>

        {/* Input de Busqueda */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gris-medio)", fontSize: "1rem" }}>
            🔍
          </span>
          <input
            id="buscarSocio"
            value={buscar}
            onChange={(e) => {
              setBuscar(e.target.value);
              cargarSocios(e.target.value);
            }}
            placeholder="Buscar por DNI, nombres, apellidos o correo electrónico..."
            style={{
              paddingLeft: "2.4rem",
              borderRadius: "8px",
              fontSize: "0.92rem",
              borderColor: "#cbd5e1",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          {/* Selector de Modo de Vista */}
          <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", border: "1px solid #cbd5e1", gap: "3px" }}>
            <button
              type="button"
              onClick={() => setModoVista("tabla")}
              style={{
                padding: "5px 12px",
                fontSize: "0.82rem",
                fontWeight: "700",
                borderRadius: "6px",
                border: "none",
                background: modoVista === "tabla" ? "var(--rojo-utp)" : "transparent",
                color: modoVista === "tabla" ? "#fff" : "var(--gris-oscuro)",
                boxShadow: modoVista === "tabla" ? "0 2px 4px rgba(200, 16, 46, 0.25)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>📋</span> Vista Tabla
            </button>
            <button
              type="button"
              onClick={() => setModoVista("tarjetas")}
              style={{
                padding: "5px 12px",
                fontSize: "0.82rem",
                fontWeight: "700",
                borderRadius: "6px",
                border: "none",
                background: modoVista === "tarjetas" ? "var(--rojo-utp)" : "transparent",
                color: modoVista === "tarjetas" ? "#fff" : "var(--gris-oscuro)",
                boxShadow: modoVista === "tarjetas" ? "0 2px 4px rgba(200, 16, 46, 0.25)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>🗂️</span> Vista Tarjetas
            </button>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--gris-medio)" }}>
            Mostrando <strong>{sociosFiltrados.length}</strong> de <strong>{socios.length}</strong> socios registrados
          </div>
        </div>
      </div>

      {/* VISTA 1: TABLA PREMIUM */}
      {modoVista === "tabla" && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid var(--borde)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <table style={{ margin: 0, border: "none" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>SOCIO / LECTOR</th>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>DNI</th>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>CONTACTO</th>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>TIPO & LÍMITE</th>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>ESTADO</th>
              <th style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", textAlign: "center" }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {sociosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--gris-medio)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔎</div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>No se encontraron socios</div>
                  <div style={{ fontSize: "0.85rem" }}>Intenta ajustar los filtros de búsqueda o registra un nuevo socio.</div>
                </td>
              </tr>
            )}
            {sociosFiltrados.map((socio) => {
              const badgeTipo = getBadgeTipoInfo(socio.tipo);
              return (
                <tr key={socio.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: socio.estado === "activo" ? "#fee2e2" : "#f1f5f9",
                          color: socio.estado === "activo" ? "var(--rojo-utp)" : "var(--gris-medio)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          border: "1px solid #fecaca",
                          flexShrink: 0,
                        }}
                      >
                        {obtenerIniciales(socio.nombre_completo)}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--gris-oscuro)", fontSize: "0.95rem" }}>
                          {socio.nombre_completo}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--gris-medio)", marginTop: "1px" }}>
                          ID Socio: #{socio.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "Consolas, monospace", fontWeight: "700", fontSize: "0.95rem" }}>
                    {socio.dni}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontSize: "0.88rem" }}>{socio.correo}</div>
                    {socio.telefono ? (
                      <div style={{ fontSize: "0.78rem", color: "var(--gris-medio)", marginTop: "2px" }}>
                        📞 {socio.telefono}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontStyle: "italic" }}>Sin teléfono</div>
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 9px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        backgroundColor: badgeTipo.bg,
                        color: badgeTipo.color,
                      }}
                    >
                      {badgeTipo.icon} {badgeTipo.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        backgroundColor: socio.estado === "activo" ? "#dcfce7" : "#fee2e2",
                        color: socio.estado === "activo" ? "#15803d" : "#b91c1c",
                      }}
                    >
                      <span style={{ fontSize: "0.6rem" }}>●</span> {socio.estado.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setModalCarnetSocio(socio)}
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          borderRadius: "6px",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                        }}
                        title="Ver credencial/carnet digital del socio"
                      >
                        🪪 Carnet
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirHistorial(socio)}
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          borderRadius: "6px",
                          background: "#fef3c7",
                          color: "#b45309",
                          border: "1px solid #fde68a",
                        }}
                        title="Ver historial de préstamos del socio"
                      >
                        📚 Préstamos
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(socio)}
                        style={{
                          padding: "5px 11px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          borderRadius: "6px",
                          background: "#f1f5f9",
                          color: "var(--gris-oscuro)",
                          border: "1px solid #cbd5e1",
                        }}
                        title="Editar información"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => cambiarEstado(socio)}
                        style={{
                          padding: "5px 11px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          borderRadius: "6px",
                          background: socio.estado === "activo" ? "#ef4444" : "var(--verde)",
                          color: "#fff",
                        }}
                        title={socio.estado === "activo" ? "Suspender acceso" : "Reactivar acceso"}
                      >
                        {socio.estado === "activo" ? "⏸️ Suspender" : "▶️ Reactivar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* VISTA 2: TARJETAS (CARDS GRID) */}
      {modoVista === "tarjetas" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {sociosFiltrados.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "3rem 1rem",
                background: "#fff",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "var(--gris-medio)",
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>🔎</div>
              <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#334155" }}>No se encontraron socios</div>
              <div style={{ fontSize: "0.88rem", marginTop: "4px" }}>Intenta ajustar los filtros de búsqueda o registra un nuevo socio.</div>
            </div>
          )}

          {sociosFiltrados.map((socio) => {
            const badgeTipo = getBadgeTipoInfo(socio.tipo);
            return (
              <div
                key={socio.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  borderTop: `4px solid ${socio.estado === "activo" ? "var(--verde)" : "#ef4444"}`,
                }}
              >
                <div>
                  {/* Top Bar: Código & Estado */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontFamily: "monospace",
                        fontWeight: "700",
                        color: "#64748b",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      SOC-{String(socio.id).padStart(5, "0")}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        fontSize: "0.74rem",
                        fontWeight: "700",
                        backgroundColor: socio.estado === "activo" ? "#dcfce7" : "#fee2e2",
                        color: socio.estado === "activo" ? "#15803d" : "#b91c1c",
                      }}
                    >
                      <span>●</span> {socio.estado.toUpperCase()}
                    </span>
                  </div>

                  {/* Header info con avatar */}
                  <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", marginBottom: "1rem" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #c8102e 0%, #8a0c20 100%)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.15rem",
                        fontWeight: "800",
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(200, 16, 46, 0.25)",
                      }}
                    >
                      {obtenerIniciales(socio.nombre_completo)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.02rem",
                          fontWeight: "800",
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={socio.nombre_completo}
                      >
                        {socio.nombres} {socio.apellidos}
                      </h3>
                      <div style={{ marginTop: "4px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            fontSize: "0.74rem",
                            fontWeight: "700",
                            backgroundColor: badgeTipo.bg,
                            color: badgeTipo.color,
                          }}
                        >
                          {badgeTipo.icon} {badgeTipo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle Datos */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      fontSize: "0.82rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      marginBottom: "1rem",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>🪪 DNI:</span>
                      <strong style={{ color: "#1e293b" }}>{socio.dni}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", overflow: "hidden" }}>
                      <span style={{ color: "#64748b" }}>✉️ Correo:</span>
                      <span
                        style={{
                          color: "#1e293b",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}
                        title={socio.correo}
                      >
                        {socio.correo}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>📞 Teléfono:</span>
                      <span style={{ color: socio.telefono ? "#1e293b" : "#94a3b8", fontStyle: socio.telefono ? "normal" : "italic" }}>
                        {socio.telefono || "Sin registrar"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    type="button"
                    onClick={() => setModalCarnetSocio(socio)}
                    style={{
                      padding: "6px 8px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    🪪 Carnet
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirHistorial(socio)}
                    style={{
                      padding: "6px 8px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      background: "#fef3c7",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    📚 Préstamos
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(socio)}
                    style={{
                      padding: "6px 8px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarEstado(socio)}
                    style={{
                      padding: "6px 8px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      background: socio.estado === "activo" ? "#ef4444" : "var(--verde)",
                      color: "#fff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    {socio.estado === "activo" ? "⏸️ Suspender" : "▶️ Reactivar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POP-UP PARA REGISTRO Y EDICION */}
      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "1.1rem 1.4rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>
                {editandoId ? "✏️ Editar Socio" : "👤 Registrar Nuevo Socio"}
              </h2>
              <button
                type="button"
                onClick={cerrarModal}
                style={{
                  background: "transparent",
                  color: "var(--gris-medio)",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardar} style={{ padding: "1.4rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label htmlFor="modal_nombres">Nombres *</label>
                  <input
                    id="modal_nombres"
                    name="nombres"
                    value={formulario.nombres}
                    onChange={cambiar}
                    placeholder="Ej. Juan Carlos"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="modal_apellidos">Apellidos *</label>
                  <input
                    id="modal_apellidos"
                    name="apellidos"
                    value={formulario.apellidos}
                    onChange={cambiar}
                    placeholder="Ej. Perez Gomez"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label htmlFor="modal_dni">DNI (8 dígitos) *</label>
                  <input
                    id="modal_dni"
                    name="dni"
                    maxLength="8"
                    value={formulario.dni}
                    onChange={cambiar}
                    placeholder="Ej. 70123456"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="modal_telefono">Teléfono (opcional)</label>
                  <input
                    id="modal_telefono"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={cambiar}
                    placeholder="Ej. 987654321"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="modal_correo">Correo Institucional / Personal *</label>
                <input
                  id="modal_correo"
                  name="correo"
                  type="email"
                  value={formulario.correo}
                  onChange={cambiar}
                  placeholder="ejemplo@utp.edu.pe"
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="modal_tipo">Tipo de Socio & Privilegio *</label>
                <select id="modal_tipo" name="tipo" value={formulario.tipo} onChange={cambiar}>
                  <option value="estudiante">🎓 Estudiante (Préstamo de hasta 3 libros)</option>
                  <option value="docente">💼 Docente (Préstamo de hasta 5 libros)</option>
                  <option value="externo">🌐 Externo (Préstamo de hasta 1 libro)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="secundario"
                  onClick={cerrarModal}
                  style={{ background: "#e2e8f0", color: "var(--gris-oscuro)" }}
                >
                  Cancelar
                </button>
                <button type="submit" style={{ background: "var(--rojo-utp)" }}>
                  {editandoId ? "Guardar Cambios" : "Confirmar y Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARNET DIGITAL DE SOCIO (CREDENCIAL UTP) */}
      {modalCarnetSocio && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.4rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                🪪 Carnet Digital de Lector
              </h2>
              <button
                type="button"
                onClick={() => setModalCarnetSocio(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              {/* Tarjeta Carnet Institucional */}
              <div
                id="carnet-imprimible"
                style={{
                  background: "linear-gradient(135deg, #c8102e 0%, #8a0c20 100%)",
                  borderRadius: "14px",
                  padding: "1.4rem",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(200, 16, 46, 0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Marca de agua */}
                <div
                  style={{
                    position: "absolute",
                    right: "-20px",
                    bottom: "-20px",
                    fontSize: "7rem",
                    opacity: 0.12,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  📖
                </div>

                {/* Encabezado Carnet */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
                    paddingBottom: "0.85rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.9 }}>
                      UNIVERSIDAD TECNOLÓGICA DEL PERÚ
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                      BiblioTech UTP
                    </div>
                  </div>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                    }}
                  >
                    CREDENCIAL OFICIAL
                  </span>
                </div>

                {/* Cuerpo del Carnet */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: "74px",
                      height: "74px",
                      borderRadius: "12px",
                      background: "#fff",
                      color: "#c8102e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      fontWeight: "800",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      flexShrink: 0,
                    }}
                  >
                    {obtenerIniciales(modalCarnetSocio.nombre_completo)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "1.08rem", fontWeight: "800", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {modalCarnetSocio.nombres} {modalCarnetSocio.apellidos}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: "2px" }}>
                      <strong>DNI:</strong> {modalCarnetSocio.dni}
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                      <strong>Código:</strong> SOC-{String(modalCarnetSocio.id).padStart(5, "0")}
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: "#fff",
                          color: "#8a0c20",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          textTransform: "uppercase",
                        }}
                      >
                        {modalCarnetSocio.tipo}
                      </span>
                      <span
                        style={{
                          background: modalCarnetSocio.estado === "activo" ? "#10b981" : "#ef4444",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                        }}
                      >
                        {modalCarnetSocio.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie del Carnet con Código de Barras Simulado */}
                <div
                  style={{
                    marginTop: "1.2rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px dashed rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>
                    Límite: {modalCarnetSocio.tipo === "docente" ? "5" : modalCarnetSocio.tipo === "estudiante" ? "3" : "1"} libros simultáneos
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      color: "#1e293b",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                      fontSize: "0.78rem",
                      letterSpacing: "2px",
                    }}
                  >
                    |||||||| {modalCarnetSocio.dni} |||||
                  </div>
                </div>
              </div>

              {/* Botones de accion */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.3rem" }}>
                <button
                  type="button"
                  className="secundario"
                  onClick={() => setModalCarnetSocio(null)}
                  style={{ background: "#e2e8f0", color: "#334155" }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🖨️</span> Imprimir Carnet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIAL DE PRÉSTAMOS DEL SOCIO */}
      {modalHistorialSocio && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "780px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1.1rem 1.4rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
                  📚 Historial de Préstamos
                </h2>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "3px" }}>
                  Socio: <strong>{modalHistorialSocio.nombre_completo}</strong> • DNI: {modalHistorialSocio.dni}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalHistorialSocio(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div style={{ padding: "1.4rem", overflowY: "auto", flex: 1 }}>
              {cargandoHistorial ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  ⏳ Cargando información de préstamos...
                </div>
              ) : historialPrestamos.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 1rem",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>📭</div>
                  <div style={{ fontWeight: "700", color: "#334155" }}>Sin historial de préstamos</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                    Este socio aún no ha solicitado préstamos de libros en la biblioteca.
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                      Total préstamos: {historialPrestamos.length}
                    </span>
                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                      Activos: {historialPrestamos.filter((p) => p.estado === "activo").length}
                    </span>
                    <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                      Devueltos: {historialPrestamos.filter((p) => p.estado === "devuelto").length}
                    </span>
                  </div>

                  <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                          <th style={{ padding: "9px 12px" }}>Libro</th>
                          <th style={{ padding: "9px 12px" }}>Fecha Préstamo</th>
                          <th style={{ padding: "9px 12px" }}>Devolución Esperada</th>
                          <th style={{ padding: "9px 12px" }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialPrestamos.map((prestamo) => {
                          const estaVencido =
                            prestamo.estado === "activo" &&
                            new Date(prestamo.fecha_devolucion_esperada) < new Date();

                          return (
                            <tr key={prestamo.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "9px 12px" }}>
                                <strong>{prestamo.libro?.titulo || "Libro no disponible"}</strong>
                                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                  {prestamo.libro?.autor}
                                </div>
                              </td>
                              <td style={{ padding: "9px 12px" }}>
                                {prestamo.fecha_prestamo ? String(prestamo.fecha_prestamo).slice(0, 10) : "-"}
                              </td>
                              <td style={{ padding: "9px 12px" }}>
                                {prestamo.fecha_devolucion_esperada ? String(prestamo.fecha_devolucion_esperada).slice(0, 10) : "-"}
                              </td>
                              <td style={{ padding: "9px 12px" }}>
                                {estaVencido ? (
                                  <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700" }}>
                                    ⚠️ VENCIDO
                                  </span>
                                ) : prestamo.estado === "activo" ? (
                                  <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700" }}>
                                    ● EN CURSO
                                  </span>
                                ) : (
                                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700" }}>
                                    ✓ DEVUELTO
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "0.9rem 1.4rem",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="secundario"
                onClick={() => setModalHistorialSocio(null)}
                style={{ background: "#e2e8f0", color: "#334155" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Socios;
