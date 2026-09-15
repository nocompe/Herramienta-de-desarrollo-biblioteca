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
 * MODULO 2 - Gestion de Socios
 * Registro, edicion, suspension y busqueda de socios de la biblioteca.
 */
function Socios() {
  const [socios, setSocios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarSocios = async (texto = "") => {
    try {
      const { data } = await client.get("/socios", {
        params: texto ? { buscar: texto } : {},
      });
      setSocios(data.datos);
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

  const guardar = async (evento) => {
    evento.preventDefault();
    setError("");
    setExito("");
    try {
      if (editandoId) {
        await client.put("/socios/" + editandoId, formulario);
        setExito("Socio actualizado correctamente.");
      } else {
        await client.post("/socios", formulario);
        setExito("Socio registrado correctamente.");
      }
      setFormulario(FORMULARIO_VACIO);
      setEditandoId(null);
      cargarSocios(buscar);
    } catch (e) {
      setError(e.message);
    }
  };

  const editar = (socio) => {
    setEditandoId(socio.id);
    setFormulario({
      nombres: socio.nombres,
      apellidos: socio.apellidos,
      dni: socio.dni,
      correo: socio.correo,
      telefono: socio.telefono || "",
      tipo: socio.tipo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cambiarEstado = async (socio) => {
    try {
      const { data } = await client.patch("/socios/" + socio.id + "/estado");
      setExito(data.mensaje);
      cargarSocios(buscar);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h1>Gestion de Socios</h1>

      {error && <div className="alerta error">{error}</div>}
      {exito && <div className="alerta exito">{exito}</div>}

      <div className="tarjeta">
        <h2>{editandoId ? "Editar socio" : "Registrar nuevo socio"}</h2>
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
            <input id="dni" name="dni" maxLength="8" value={formulario.dni} onChange={cambiar} required />
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
            <label htmlFor="tipo">Tipo de socio</label>
            <select id="tipo" name="tipo" value={formulario.tipo} onChange={cambiar}>
              <option value="estudiante">Estudiante (3 prestamos)</option>
              <option value="docente">Docente (5 prestamos)</option>
              <option value="externo">Externo (1 prestamo)</option>
            </select>
          </div>
          <div>
            <button type="submit">{editandoId ? "Actualizar datos" : "+ Registrar socio"}</button>{" "}
            {editandoId && (
              <button
                type="button"
                className="secundario"
                onClick={() => {
                  setEditandoId(null);
                  setFormulario(FORMULARIO_VACIO);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="tarjeta">
        <label htmlFor="buscarSocio">Buscar por nombre, DNI o correo ({socios.length} socio{socios.length !== 1 ? "s" : ""} encontrado{socios.length !== 1 ? "s" : ""})</label>
        <input
          id="buscarSocio"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            cargarSocios(e.target.value);
          }}
          placeholder="Buscar por DNI, nombres o correo institucional..."
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Socio</th>
            <th>DNI</th>
            <th>Correo</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {socios.length === 0 && (
            <tr>
              <td colSpan="6">No hay socios registrados.</td>
            </tr>
          )}
          {socios.map((socio) => (
            <tr key={socio.id}>
              <td>{socio.nombre_completo}</td>
              <td>{socio.dni}</td>
              <td>{socio.correo}</td>
              <td>{socio.tipo}</td>
              <td>
                <span className={socio.estado === "activo" ? "badge activo" : "badge inactivo"}>
                  {socio.estado}
                </span>
              </td>
              <td>
                <button className="secundario" onClick={() => editar(socio)}>
                  Editar
                </button>{" "}
                <button onClick={() => cambiarEstado(socio)}>
                  {socio.estado === "activo" ? "Suspender" : "Reactivar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Socios;
