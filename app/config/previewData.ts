export interface PreviewDataProps {
  epigrafe?: string;
  titulo?: string;
  texto?: string;
  imagen?: string;
}

export const previewData: PreviewDataProps = {
  epigrafe: "Nuevo Producto",
  titulo: "Título Principal del Componente",
  texto: "Este es un texto de ejemplo que puedes usar para mostrar el contenido de tu componente. Puede contener información importante sobre productos, servicios o cualquier contenido relevante para tu sitio web.",
  imagen: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
};

export const previewCategories = [
  {
    id: 1,
    title: "Ropa de Mujer",
    mainImage: { url: previewData.imagen || "/img/pixelup/pixelup-white.png" },
    landingText: "Descubre nuestra colección de ropa femenina"
  },
  {
    id: 2,
    title: "Accesorios",
    mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
    landingText: "Complementa tu look con nuestros accesorios"
  },
  {
    id: 3,
    title: "Calzado",
    mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
    landingText: "Encuentra el calzado perfecto para cada ocasión"
  },
  {
    id: 4,
    title: "Bolsos",
    mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
    landingText: "Bolsos elegantes y funcionales"
  }
];

// Datos adicionales para componentes que necesiten más información
export const previewDataExtended = {
  header: {
    titulo: "Nuestras Categorías",
    subtitulo: "Descubre nuestra selección de productos"
  },
  categorias: [
    {
      id: 1,
      title: "Ropa de Mujer",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Descubre nuestra colección de ropa femenina",
      buttonLink: "/tienda?categoria=ropa-mujer"
    },
    {
      id: 2,
      title: "Accesorios",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Complementa tu look con nuestros accesorios",
      buttonLink: "/tienda?categoria=accesorios"
    },
    {
      id: 3,
      title: "Calzado",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Encuentra el calzado perfecto para cada ocasión",
      buttonLink: "/tienda?categoria=calzado"
    },
    {
      id: 4,
      title: "Bolsos",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Bolsos elegantes y funcionales",
      buttonLink: "/tienda?categoria=bolsos"
    },
    {
      id: 5,
      title: "Cosméticos",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Productos de belleza de alta calidad",
      buttonLink: "/tienda?categoria=cosmeticos"
    },
    {
      id: 6,
      title: "Joyas",
      mainImage: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" },
      landingText: "Joyas únicas y elegantes",
      buttonLink: "/tienda?categoria=joyas"
    }
  ]
};