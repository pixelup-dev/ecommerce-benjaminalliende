
import Categoria02 from "./cdgcategorias02";

export default function Categoria() {
  const Categorias = {
    titulo: "Categorías Disponibles",
    categoria1: "COLGANTES",
    img1: "/img/categoria/Colgantes.webp",
    categoria2: "ANILLOS",
    img2: "/img/categoria/Anillos.webp",
    categoria3: "PULSERAS",
    img3: "/img/categoria/pulseras.webp",
    categoria4: "AROS",
    img4: "/img/categoria/Aros.webp",
  }
    
      return (
        <Categoria02 Categoria02Data={Categorias} />
      )
    }