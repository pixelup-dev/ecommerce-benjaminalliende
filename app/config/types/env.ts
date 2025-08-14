export interface SiteConfig {
  site: {
    url: string;
    defaultCommuneId: string;
  };
  api: {
    clientUrl: string;
    boClientUrl: string;
    siteId: string;
  };
  banners: {
    seo: string;
    principal02: string;
    principal02Mobile: string;
    sinFoto: string;
  };
  images: {
    logoColor: string;
    logoWhite: string;
    logoColorMobile: string;
  };
  analytics: {
    gaId: string;
    propertyId: string;
  };
}
