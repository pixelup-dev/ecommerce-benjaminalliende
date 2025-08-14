export interface UbicacionContent {
  title: string;
  contentText: string;
  additionalData: {
    subtitle: string;
    description: string;
    secondaryTitle: string;
    buttonText: string;
    buttonLink: string;
    address: {
      street: string;
      city: string;
    };
    schedule: {
      weekdays: string;
      saturday: string;
    };
    contact: {
      phone: string;
      email: string;
    };
  };
}

export interface ContentBlockData {
  title: string;
  contentText: string;
}

export interface BannerImage {
  id: string;
  title: string;
  orderNumber: number;
  mainImage: {
    url: string;
  };
}
