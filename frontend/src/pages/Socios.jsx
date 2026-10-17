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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

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

        <div style={{ fontSize: "0.8rem", color: "var(--gris-medio)", textAlign: "right" }}>
          Mostrando <strong>{sociosFiltrados.length}</strong> de <strong>{socios.length}</strong> socios registrados
        </div>
      </div>

      {/* Tabla Premium */}
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
    </section>
  );
}

export default Socios;
