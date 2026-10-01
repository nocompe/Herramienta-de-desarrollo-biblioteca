import { useEffect, useState } from "react";
import client from "../api/client.js";

/**
 * MODULO 4 - Dashboard de indicadores
 * Resume el estado de la biblioteca: inventario, socios y prestamos.
 */
function Dashboard() {
  const [indicadores, setIndicadores] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [vencidos, setVencidos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resInd, resRank, resVenc] = await Promise.all([
          client.get("/reportes/indicadores"),
          client.get("/reportes/libros-mas-prestados"),
          client.get("/reportes/prestamos-vencidos"),
        ]);
        setIndicadores(resInd.data.datos);
        setRanking(resRank.data.datos);
        setVencidos(resVenc.data.datos);
      } catch (e) {
        setError(e.message);
      }
    };
    cargar();
  }, []);

  const tarjetas = indicadores
    ? [
        { etiqueta: "Titulos registrados", valor: indicadores.titulos_registrados },
        { etiqueta: "Ejemplares totales", valor: indicadores.ejemplares_totales },
        { etiqueta: "Ejemplares disponibles", valor: indicadores.ejemplares_disponibles },
        { etiqueta: "Socios activos", valor: indicadores.socios_activos },
        { etiqueta: "Prestamos activos", valor: indicadores.prestamos_activos },
        { etiqueta: "Prestamos vencidos", valor: indicadores.prestamos_vencidos, alerta: true },
      ]
    : [];

  return (
    <section className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="page-header">
        <h1>Dashboard de la Biblioteca</h1>
      </div>

      {error && <div className="alerta error">{error}</div>}

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
