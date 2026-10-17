import { useEffect, useState } from "react";
import client from "../api/client.js";
import Modal from "../components/Modal.jsx";

const FORMULARIO_VACIO = { libro_id: "", socio_id: "", dias_plazo: 7 };

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const descargarInformePdf = (prestamos, setError) => {
  if (!prestamos.length) {
    setError("No hay préstamos para exportar en este momento.");
    return;
  }

  const filas = prestamos.map((prestamo) => {
    const socio = `${prestamo.socio?.nombres ?? ""} ${prestamo.socio?.apellidos ?? ""}`.trim();
    const estado = prestamo.estado === "devuelto"
      ? "Devuelto"
      : prestamo.vencido
        ? "Vencido"
        : "Activo";

    return `
      <tr>
        <td>${escapeHtml(prestamo.libro?.titulo ?? "")}</td>
        <td>${escapeHtml(socio)}</td>
        <td>${escapeHtml(prestamo.fecha_prestamo?.substring(0, 10) ?? "")}</td>
        <td>${escapeHtml(prestamo.fecha_devolucion_esperada?.substring(0, 10) ?? "")}</td>
        <td>${escapeHtml(estado)}</td>
        <td>${escapeHtml(prestamo.dias_retraso ?? 0)}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Informe de préstamos</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 32px;
            color: #1f2937;
          }
          h1 {
            text-align: center;
            margin-bottom: 24px;
            font-size: 28px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background: #f3f4f6;
          }
          .subtitulo {
            margin-bottom: 16px;
            font-size: 14px;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <h1>Informe de préstamos</h1>
        <div class="subtitulo">Fecha de generación: ${new Date().toLocaleDateString("es-ES")}</div>
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Socio</th>
              <th>Fecha préstamo</th>
              <th>Fecha devolución esperada</th>
              <th>Estado</th>
              <th>Días de retraso</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank", "width=900,height=700");
  if (!ventana) {
    setError("El navegador bloqueó la ventana del informe. Permite las ventanas emergentes para generar el PDF.");
    return;
  }

  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();

  setTimeout(() => {
    ventana.print();
    ventana.close();
  }, 300);
};

function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [socios, setSocios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [filtro, setFiltro] = useState("todos");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarPrestamos = async (estado = filtro) => {
    try {
      const param = estado !== "todos" ? { estado } : {};
      const { data } = await client.get("/prestamos", { params: param });
      setPrestamos(data.datos);
      setError("");
    } catch (e) { setError(e.message); }
  };

  const cargarCatalogos = async () => {
    try {
      const [resLibros, resSocios] = await Promise.all([
        client.get("/libros"), client.get("/socios"),
      ]);
      setLibros(resLibros.data.datos);
      setSocios(resSocios.data.datos);
    } catch (e) { setError("No se pudieron cargar los listados para el formulario."); }
  };

  useEffect(() => {
    cargarPrestamos();
    cargarCatalogos();
  }, []);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setError(""); setExito("");
    try {
      const { data } = await client.post("/prestamos", formulario);
      setExito("Prestamo registrado correctamente.");
      setFormulario(FORMULARIO_VACIO);
      setModalAbierto(false);
      cargarCatalogos();
      cargarPrestamos();
    } catch (e) { setError(e.response?.data?.mensaje || e.message); }
  };

  const devolver = async (prestamo) => {
    if (!window.confirm("Confirmar devolucion del libro?")) return;
    try {
      const { data } = await client.post(`/prestamos/${prestamo.id}/devolver`);
      setExito(data.mensaje);
      cargarCatalogos();
      cargarPrestamos();
    } catch (e) { setError(e.message); }
  };

  const cambiarFiltro = (valor) => {
    setFiltro(valor);
    cargarPrestamos(valor);
  };

  return (
    <section>
      <div className="page-header">
        <h1>Préstamos y Devoluciones</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="secundario" onClick={() => descargarInformePdf(prestamos, setError)}>
            Exportar a PDF
          </button>
          <button onClick={() => setModalAbierto(true)} className="boton-primario">
            + Registrar nuevo préstamo
          </button>
        </div>
      </div>

      {error && <div className="alerta error">{error}</div>}
      {exito && <div className="alerta exito">{exito}</div>}

      <div className="tarjeta">
        <label htmlFor="filtro">Filtrar prestamos ({prestamos.length} resultado{prestamos.length !== 1 ? "s" : ""})</label>
        <select id="filtro" value={filtro} onChange={(e) => cambiarFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activo">Solo activos</option>
          <option value="devuelto">Solo devueltos</option>
          <option value="vencidos">Solo vencidos</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Libro</th>
            <th>Socio</th>
            <th>Prestamo</th>
            <th>Devolver antes de</th>
            <th>Estado</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {prestamos.length === 0 && <tr><td colSpan="6">No hay prestamos que coincidan con el filtro.</td></tr>}
          {prestamos.map((prestamo) => (
            <tr key={prestamo.id}>
              <td>{prestamo.libro?.titulo}</td>
              <td>{prestamo.socio?.nombres} {prestamo.socio?.apellidos}</td>
              <td>{prestamo.fecha_prestamo?.substring(0, 10)}</td>
              <td>{prestamo.fecha_devolucion_esperada?.substring(0, 10)}</td>
              <td>
                {prestamo.estado === "devuelto" ? (
                  <span className="badge activo">devuelto</span>
                ) : prestamo.vencido ? (
                  <span className="badge peligro">vencido</span>
                ) : (
                  <span className="badge activo">activo</span>
                )}
              </td>
              <td>
                {prestamo.estado === "activo" ? (
                  <button onClick={() => devolver(prestamo)}>Devolver</button>
                ) : (
                  <span>{prestamo.dias_retraso > 0 ? prestamo.dias_retraso + " dia(s) de retraso" : "A tiempo"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} titulo="Registrar préstamo">
        <form className="formulario" onSubmit={registrar}>
          <div>
            <label htmlFor="libro_id">Libro</label>
            <select id="libro_id" name="libro_id" value={formulario.libro_id} onChange={cambiar} required>
              <option value="">-- Seleccione --</option>
              {libros.map((libro) => (
                <option key={libro.id} value={libro.id} disabled={libro.ejemplares_disponibles === 0}>
                  {libro.titulo} ({libro.ejemplares_disponibles} disp.)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="socio_id">Socio</label>
            <select id="socio_id" name="socio_id" value={formulario.socio_id} onChange={cambiar} required>
              <option value="">-- Seleccione --</option>
              {socios.map((socio) => (
                <option key={socio.id} value={socio.id}>
                  {socio.nombres} {socio.apellidos} - {socio.dni}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dias_plazo">Dias de plazo</label>
            <input id="dias_plazo" name="dias_plazo" type="number" min="1" max="30" value={formulario.dias_plazo} onChange={cambiar} />
          </div>
          <div>
            <button type="submit">Registrar prestamo</button>
            <button type="button" className="secundario" onClick={() => setModalAbierto(false)} style={{marginLeft: '12px'}}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default Prestamos;
