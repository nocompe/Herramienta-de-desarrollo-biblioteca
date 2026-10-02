import { useEffect, useState } from "react";
import client from "../api/client.js";
import Modal from "../components/Modal.jsx";

const FORMULARIO_VACIO = { libro_id: "", socio_id: "", dias_plazo: 7 };

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
        <button onClick={() => setModalAbierto(true)} className="boton-primario">
          + Registrar nuevo préstamo
          </button>
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
