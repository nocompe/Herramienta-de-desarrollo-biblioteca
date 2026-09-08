import { useEffect, useState } from "react";
import client from "../api/client.js";

const FORMULARIO_VACIO = {
  titulo: "",
  autor: "",
  isbn: "",
  editorial: "",
  categoria: "General",
  anio_publicacion: "",
  ejemplares_totales: 1,
};

/**
 * MODULO 1 - Catalogo de Libros
 * Permite registrar, buscar, editar y eliminar libros del catalogo.
 */
function Libros() {
  const [libros, setLibros] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarLibros = async (texto = "") => {
    try {
      const { data } = await client.get("/libros", {
        params: texto ? { buscar: texto } : {},
      });
      setLibros(data.datos);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    cargarLibros();
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
        await client.put("/libros/" + editandoId, formulario);
        setExito("Libro actualizado correctamente.");
      } else {
        await client.post("/libros", formulario);
        setExito("Libro registrado correctamente.");
      }
      setFormulario(FORMULARIO_VACIO);
      setEditandoId(null);
      cargarLibros(buscar);
    } catch (e) {
      setError(e.message);
    }
  };

  const editar = (libro) => {
    setEditandoId(libro.id);
    setFormulario({
      titulo: libro.titulo,
      autor: libro.autor,
      isbn: libro.isbn,
      editorial: libro.editorial || "",
      categoria: libro.categoria,
      anio_publicacion: libro.anio_publicacion || "",
      ejemplares_totales: libro.ejemplares_totales,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (libro) => {
    if (!window.confirm("Eliminar el libro: " + libro.titulo + "?")) return;
    try {
      await client.delete("/libros/" + libro.id);
      setExito("Libro eliminado correctamente.");
      cargarLibros(buscar);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h1>Catalogo de Libros</h1>

      {error && <div className="alerta error">{error}</div>}
      {exito && <div className="alerta exito">{exito}</div>}

      <div className="tarjeta">
        <h2>{editandoId ? "Editar libro" : "Registrar nuevo libro"}</h2>
        <form className="formulario" onSubmit={guardar}>
          <div>
            <label htmlFor="titulo">Titulo</label>
            <input id="titulo" name="titulo" value={formulario.titulo} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="autor">Autor</label>
            <input id="autor" name="autor" value={formulario.autor} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="isbn">ISBN</label>
            <input id="isbn" name="isbn" value={formulario.isbn} onChange={cambiar} required />
          </div>
          <div>
            <label htmlFor="editorial">Editorial</label>
            <input id="editorial" name="editorial" value={formulario.editorial} onChange={cambiar} />
          </div>
          <div>
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" name="categoria" value={formulario.categoria} onChange={cambiar}>
              <option>General</option>
              <option>Novela</option>
              <option>Informatica</option>
              <option>Historia</option>
              <option>Ciencias</option>
            </select>
          </div>
          <div>
            <label htmlFor="anio">Anio de publicacion</label>
            <input id="anio" name="anio_publicacion" type="number" value={formulario.anio_publicacion} onChange={cambiar} />
          </div>
          <div>
            <label htmlFor="ejemplares">Ejemplares</label>
            <input id="ejemplares" name="ejemplares_totales" type="number" min="1" value={formulario.ejemplares_totales} onChange={cambiar} required />
          </div>
          <div>
            <button type="submit">{editandoId ? "Actualizar" : "Registrar"}</button>{" "}
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
        <label htmlFor="buscar">Buscar por titulo, autor o ISBN</label>
        <input
          id="buscar"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            cargarLibros(e.target.value);
          }}
          placeholder="Ej. Vargas Llosa"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Autor</th>
            <th>ISBN</th>
            <th>Categoria</th>
            <th>Disponibles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {libros.length === 0 && (
            <tr>
              <td colSpan="6">No hay libros registrados.</td>
            </tr>
          )}
          {libros.map((libro) => (
            <tr key={libro.id}>
              <td>{libro.titulo}</td>
              <td>{libro.autor}</td>
              <td>{libro.isbn}</td>
              <td>{libro.categoria}</td>
              <td>
                <span className={libro.ejemplares_disponibles > 0 ? "badge activo" : "badge inactivo"}>
                  {libro.ejemplares_disponibles} / {libro.ejemplares_totales}
                </span>
              </td>
              <td>
                <button className="secundario" onClick={() => editar(libro)}>
                  Editar
                </button>{" "}
                <button className="peligro" onClick={() => eliminar(libro)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Libros;
