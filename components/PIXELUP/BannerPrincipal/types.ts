export interface BannerImage {
  mainImage: {
    url: string;
    width: number;
    height: number;
  };
  title: string;
  buttonLink: string;
}

export interface BannerData {
  images: BannerImage[];
}

export interface BannerResponse {
  banner: BannerData;
}
