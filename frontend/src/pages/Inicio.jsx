import { useEffect, useState } from "react";
import client from "../api/client.js";

function Inicio() {
  const [estado, setEstado] = useState("Verificando conexion...");

  useEffect(() => {
    client
      .get("/ping")
      .then((r) => setEstado(`API conectada - version ${r.data.version}`))
      .catch((e) => setEstado(e.message));
  }, []);

  return (
    <section>
      <h1>Sistema de Gestion de Biblioteca</h1>
      <p>
        BiblioTech UTP centraliza el catalogo de libros, el registro de socios y
        el control de prestamos y devoluciones de la biblioteca.
      </p>
      <p className="estado-api">{estado}</p>
    </section>
  );
}

export default Inicio;
