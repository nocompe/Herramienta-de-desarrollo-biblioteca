import { useCallback, useEffect, useRef, useState } from "react";
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
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const solicitudId = useRef(0);

  const cargarLibros = useCallback(async (texto = "") => {
    const idActual = ++solicitudId.current;
    setCargando(true);
    try {
      const { data } = await client.get("/libros", {
        params: texto ? { buscar: texto } : {},
      });
      if (idActual !== solicitudId.current) return;
      setLibros(data.datos);
      setError("");
    } catch (e) {
      if (idActual === solicitudId.current) setError(e.message);
    } finally {
      if (idActual === solicitudId.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(
      () => cargarLibros(buscar.trim()),
      buscar ? 300 : 0
    );
    return () => {
      window.clearTimeout(temporizador);
      solicitudId.current += 1;
    };
  }, [buscar, cargarLibros]);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
    setError("");
    setExito("");
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);
    const datosLibro = {
      ...formulario,
      anio_publicacion:
        formulario.anio_publicacion === "" ? null : Number(formulario.anio_publicacion),
      ejemplares_totales: Number(formulario.ejemplares_totales),
    };
    try {
      if (editandoId) {
        await client.put("/libros/" + editandoId, datosLibro);
        setExito("Libro actualizado correctamente.");
      } else {
        await client.post("/libros", datosLibro);
        setExito("Libro registrado correctamente.");
      }
      setFormulario(FORMULARIO_VACIO);
      setEditandoId(null);
      await cargarLibros(buscar.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
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
    setError("");
    setExito("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (libro) => {
    if (!window.confirm("Eliminar el libro: " + libro.titulo + "?")) return;
    setError("");
    setExito("");
    setEliminandoId(libro.id);
    try {
      await client.delete("/libros/" + libro.id);
      setExito("Libro eliminado correctamente.");
      await cargarLibros(buscar.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setEliminandoId(null);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setError("");
    setExito("");
  };

  return (
    <section>
      <h1>Catalogo de Libros</h1>

      {error && <div className="alerta error" role="alert">{error}</div>}
      {exito && <div className="alerta exito" role="status">{exito}</div>}

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
            <input id="anio" name="anio_publicacion" type="number" min="0" step="1" value={formulario.anio_publicacion} onChange={cambiar} />
          </div>
          <div>
            <label htmlFor="ejemplares">Ejemplares</label>
            <input id="ejemplares" name="ejemplares_totales" type="number" min="1" step="1" value={formulario.ejemplares_totales} onChange={cambiar} required />
          </div>
          <div>
            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Registrar"}
            </button>{" "}
            {editandoId && (
              <button type="button" className="secundario" onClick={cancelarEdicion}>
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
          }}
          placeholder="Ej. Vargas Llosa"
        />
      </div>

      {cargando && libros.length > 0 && (
        <p className="catalogo-estado" role="status">Actualizando resultados...</p>
      )}

      {cargando && libros.length === 0 ? (
        <p className="catalogo-vacio" role="status">Cargando libros...</p>
      ) : libros.length === 0 ? (
        <p className="catalogo-vacio">
          {buscar.trim()
            ? "No se encontraron libros con esa búsqueda."
            : "No hay libros registrados todavía."}
        </p>
      ) : (
        <div className="catalogo-grid">
          {libros.map((libro) => {
            const variacionPortada = Array.from(libro.isbn).reduce(
              (total, caracter) => total + caracter.charCodeAt(0),
              0
            ) % 4;

            return (
              <article className="libro-card" key={libro.id}>
                <div className={`libro-portada libro-portada-${variacionPortada}`} aria-hidden="true">
                  <span className="libro-portada-editorial">{libro.editorial || libro.categoria}</span>
                  <strong>{libro.titulo}</strong>
                  <span className="libro-portada-autor">{libro.autor}</span>
                </div>
                <div className="libro-card-contenido">
                  <span className="libro-categoria">{libro.categoria}</span>
                  <h2>{libro.titulo}</h2>
                  <p className="libro-autor">{libro.autor}</p>
                  <p className="libro-isbn">ISBN: {libro.isbn}</p>
                  <span className={`libro-disponibilidad ${libro.ejemplares_disponibles > 0 ? "disponible" : "agotado"}`}>
                    {libro.ejemplares_disponibles} / {libro.ejemplares_totales} disponibles
                  </span>
                </div>
                <div className="libro-card-acciones">
                  <button type="button" className="secundario" onClick={() => editar(libro)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="peligro"
                    onClick={() => eliminar(libro)}
                    disabled={eliminandoId === libro.id}
                  >
                    {eliminandoId === libro.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Libros;
