export interface Collection {
  id: string;
  title: string;
  bannerTitle: string;
  bannerText: string;
  landingText: string;
  mainImageUrl: string;
  previewImageUrl: string;
  products: Product[];
  // Añade más propiedades según necesites
}

export interface Product {
  id: string;
  name: string;
  mainImageUrl: string;
  statusCode: string;
  // Añade más propiedades según necesites
}
