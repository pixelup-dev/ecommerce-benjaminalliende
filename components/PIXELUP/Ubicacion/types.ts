export type BannerImage = {
    url: string;
    title: string;
    landingText: string;
    buttonLink: string;
    buttonText: string;
    mainImageLink: string;
    mainImage: {
        url: string;
        width: number;
        height: number;
    };
    orderNumber: number;
    id: string;
}

export type UbicacionResponse = BannerImage[];