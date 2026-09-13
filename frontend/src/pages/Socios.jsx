import { useEffect, useState } from "react";
import client from "../api/client.js";
import Modal from "../components/Modal.jsx";

const FORMULARIO_VACIO = {
  nombres: "", apellidos: "", dni: "", correo: "", telefono: "", tipo_socio: "Estudiante",
};

function Socios() {
  const [socios, setSocios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [buscar, setBuscar] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarSocios = async (texto = "") => {
    try {
      const { data } = await client.get("/socios", { params: texto ? { buscar: texto } : {} });
      setSocios(data.datos);
      setError("");
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { cargarSocios(); }, []);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setError(""); setExito("");
    try {
      await client.post("/socios", formulario);
      setExito("Socio registrado correctamente.");
      setFormulario(FORMULARIO_VACIO);
      setModalAbierto(false);
      cargarSocios(buscar);
    } catch (e) { setError(e.message); }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Gestión de Socios</h1>
        <button onClick={() => setModalAbierto(true)}>+ Nuevo Socio</button>
      </div>

      {error && <div className="alerta error">{error}</div>}
      {exito && <div className="alerta exito">{exito}</div>}

      <div className="tarjeta">
        <label htmlFor="buscar">Buscar por nombre, DNI o correo</label>
        <input
          id="buscar"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            cargarSocios(e.target.value);
          }}
          placeholder="Ej. 70123456"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombres</th>
            <th>DNI</th>
            <th>Contacto</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Limite Prestamos</th>
          </tr>
        </thead>
        <tbody>
          {socios.length === 0 && <tr><td colSpan="6">No hay socios registrados.</td></tr>}
          {socios.map((socio) => (
            <tr key={socio.id}>
              <td>{socio.nombres} {socio.apellidos}</td>
              <td>{socio.dni}</td>
              <td>
                {socio.correo} <br />
                <small className="texto-secundario">{socio.telefono}</small>
              </td>
              <td>{socio.tipo_socio}</td>
              <td>
                <span className={socio.estado === "activo" ? "badge activo" : "badge inactivo"}>
                  {socio.estado}
                </span>
              </td>
              <td>{socio.limite_prestamos} libros</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} titulo="Registrar nuevo socio">
        <form className="formulario" onSubmit={guardar}>
          <div>
            <label htmlFor="nombres">Nombres</label>
            <input id="nombres" name="nombres" value={formulario.nombres} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="apellidos">Apellidos</label>
            <input id="apellidos" name="apellidos" value={formulario.apellidos} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="dni">DNI</label>
            <input id="dni" name="dni" value={formulario.dni} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="correo">Correo</label>
            <input id="correo" name="correo" type="email" value={formulario.correo} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="telefono">Telefono</label>
            <input id="telefono" name="telefono" value={formulario.telefono} onChange={cambiar} />
          </div>
          <div>
            <label htmlFor="tipo_socio">Tipo de socio</label>
            <select id="tipo_socio" name="tipo_socio" value={formulario.tipo_socio} onChange={cambiar}>
              <option value="Estudiante">Estudiante (3 prestamos)</option>
              <option value="Profesor">Profesor (5 prestamos)</option>
              <option value="Investigador">Investigador (10 prestamos)</option>
            </select>
          </div>
          <div>
            <button type="submit">Registrar Socio</button>
            <button type="button" className="secundario" onClick={() => setModalAbierto(false)} style={{marginLeft: '12px'}}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default Socios;
