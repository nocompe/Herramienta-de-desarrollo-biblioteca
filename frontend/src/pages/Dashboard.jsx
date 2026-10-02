import { useEffect, useState } from "react";
import client from "../api/client.js";

/**
 * MODULO 4 - Dashboard de indicadores
 * Resume el estado de la biblioteca: inventario, socios y prestamos.
 * Soporta filtrado por rango de fechas.
 */
function Dashboard() {
  const [indicadores, setIndicadores] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [vencidos, setVencidos] = useState([]);
  const [error, setError] = useState("");
  
  // Estados para los filtros de fecha
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(false);

  // Cargar datos con filtros
  const cargarDatos = async (desdeParam = "", hastaParam = "") => {
    try {
      const params = new URLSearchParams();
      if (desdeParam) params.append("desde", desdeParam);
      if (hastaParam) params.append("hasta", hastaParam);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const [resInd, resRank, resVenc] = await Promise.all([
        client.get(`/reportes/indicadores${queryString}`),
        client.get(`/reportes/libros-mas-prestados${queryString}`),
        client.get(`/reportes/prestamos-vencidos${queryString}`),
      ]);
      
      setIndicadores(resInd.data.datos);
      setRanking(resRank.data.datos);
      setVencidos(resVenc.data.datos);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  // Cargar datos inicialmente sin filtros
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejar aplicación de filtros
  const aplicarFiltros = () => {
    if (!desde || !hasta) {
      setError("Por favor selecciona ambas fechas");
      return;
    }
    if (new Date(desde) > new Date(hasta)) {
      setError("La fecha 'desde' debe ser menor a la fecha 'hasta'");
      return;
    }
    cargarDatos(desde, hasta);
    setFiltroActivo(true);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setDesde("");
    setHasta("");
    setFiltroActivo(false);
    cargarDatos();
  };

  const tarjetas = indicadores
    ? [
        { etiqueta: "Titulos registrados", valor: indicadores.titulos_registrados },
        { etiqueta: "Ejemplares totales", valor: indicadores.ejemplares_totales },
        { etiqueta: "Ejemplares disponibles", valor: indicadores.ejemplares_disponibles },
        { etiqueta: "Socios activos", valor: indicadores.socios_activos },
        { etiqueta: "Prestamos activos", valor: indicadores.prestamos_activos },
        { etiqueta: "Prestamos vencidos", valor: indicadores.prestamos_vencidos, alerta: true },
        { etiqueta: "Devoluciones periodo", valor: indicadores.devoluciones_periodo },
        { etiqueta: "Tasa devolución", valor: indicadores.tasa_devolucion },
      ]
    : [];

  return (
    <section>
      <h1>📊 Dashboard de la Biblioteca</h1>

      {error && <div className="alerta error">{error}</div>}

      {/* Filtro de fechas */}
      <div className="tarjeta filtro-fechas">
        <h3>Filtrar por período</h3>
        <div className="filtro-controles">
          <div className="grupo-campo">
            <label htmlFor="desde">Desde:</label>
            <input
              id="desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          
          <div className="grupo-campo">
            <label htmlFor="hasta">Hasta:</label>
            <input
              id="hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>

          <button className="btn btn-primario" onClick={aplicarFiltros}>
            Aplicar Filtro
          </button>

          {filtroActivo && (
            <button className="btn btn-secundario" onClick={limpiarFiltros}>
              Limpiar Filtro
            </button>
          )}
        </div>
        {filtroActivo && desde && hasta && (
          <p className="filtro-activo">
            📅 Mostrando datos desde {desde} hasta {hasta}
          </p>
        )}
      </div>

      <div className="panel-indicadores">
        {tarjetas.map((tarjeta) => (
          <div key={tarjeta.etiqueta} className={tarjeta.alerta && tarjeta.valor > 0 ? "indicador alerta-indicador" : "indicador"}>
            <span className="indicador-valor">{tarjeta.valor}</span>
            <span className="indicador-etiqueta">{tarjeta.etiqueta}</span>
          </div>
        ))}
      </div>

      <div className="tarjeta">
        <h2>Top 5 libros mas prestados</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Titulo</th>
              <th>Autor</th>
              <th>Categoria</th>
              <th>Prestamos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 && (
              <tr>
                <td colSpan="5">Todavia no se registran prestamos.</td>
              </tr>
            )}
            {ranking.map((fila, indice) => (
              <tr key={fila.titulo}>
                <td>{indice + 1}</td>
                <td>{fila.titulo}</td>
                <td>{fila.autor}</td>
                <td>{fila.categoria}</td>
                <td>{fila.total_prestamos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tarjeta">
        <h2>Prestamos vencidos</h2>
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Socio</th>
              <th>Correo</th>
              <th>Vencio el</th>
              <th>Dias</th>
            </tr>
          </thead>
          <tbody>
            {vencidos.length === 0 && (
              <tr>
                <td colSpan="5">No hay prestamos vencidos. Todo en orden.</td>
              </tr>
            )}
            {vencidos.map((fila) => (
              <tr key={fila.id}>
                <td>{fila.libro}</td>
                <td>{fila.socio}</td>
                <td>{fila.correo}</td>
                <td>{fila.fecha_devolucion_esperada}</td>
                <td>
                  <span className="badge pendiente">{fila.dias_vencido}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Dashboard;
