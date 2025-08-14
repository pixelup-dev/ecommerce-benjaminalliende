/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Lora,
  Playfair_Display,
  Poppins,
  Montserrat,
  Oswald,
  Roboto,
  Fira_Sans,
  Bebas_Neue,
  Open_Sans,
  Libre_Baskerville,
  Raleway,
  Merriweather,
} from "next/font/google";

// Configuración de las fuentes
const lora = Lora({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "600"], subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });
const oswald = Oswald({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "500"], subsets: ["latin"] });
const firaSans = Fira_Sans({ weight: ["400", "500"], subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const openSans = Open_Sans({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({
  weight: "400",
  subsets: ["latin"],
});
const raleway = Raleway({ subsets: ["latin"] });
const merriweather = Merriweather({ weight: "400", subsets: ["latin"] });

const BannerTemplate = ({
  style,
  epigraphFont,
  titleFont,
  subtitleFont,
  backgroundImage,
}: {
  style: string;
  epigraphFont: any;
  titleFont: any;
  subtitleFont: any;
  backgroundImage: string;
}) => {
  return (
    <div className="relative w-full h-[400px] mb-8 overflow-hidden rounded-lg">
      <img
        src={backgroundImage}
        alt="Banner background"
        className="absolute w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-8">
        <p
          className={`${epigraphFont.className} text-sm uppercase tracking-wider mb-2`}
        >
          Epígrafe de Ejemplo
        </p>
        <h2
          className={`${titleFont.className} text-4xl md:text-5xl font-bold text-center mb-4`}
        >
          Título Principal
        </h2>
        <p
          className={`${subtitleFont.className} text-lg md:text-xl text-center max-w-2xl`}
        >
          Subtítulo descriptivo que proporciona más información sobre el
          contenido
        </p>
      </div>
    </div>
  );
};

export default function BannerFonts() {
  return (
    <div className=" mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Plantillas de Banners</h1>

      <div className="space-y-12">
        {/* Elegante y moderna */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">1️⃣ Elegante y moderna</h2>
          <BannerTemplate
            style="elegant"
            epigraphFont={lora}
            titleFont={playfair}
            subtitleFont={poppins}
            backgroundImage="https://picsum.photos/seed/elegant/1200/400"
          />
        </div>

        {/* Minimalista y limpia */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            2️⃣ Minimalista y limpia
          </h2>
          <BannerTemplate
            style="minimal"
            epigraphFont={montserrat}
            titleFont={oswald}
            subtitleFont={roboto}
            backgroundImage="https://picsum.photos/seed/minimal/1200/400"
          />
        </div>

        {/* Creativa y llamativa */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            3️⃣ Creativa y llamativa
          </h2>
          <BannerTemplate
            style="creative"
            epigraphFont={firaSans}
            titleFont={bebasNeue}
            subtitleFont={openSans}
            backgroundImage="https://picsum.photos/seed/creative/1200/400"
          />
        </div>

        {/* Vintage y nostálgica */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            4️⃣ Vintage y nostálgica
          </h2>
          <BannerTemplate
            style="vintage"
            epigraphFont={libreBaskerville}
            titleFont={raleway}
            subtitleFont={merriweather}
            backgroundImage="https://picsum.photos/seed/vintage/1200/400"
          />
        </div>
      </div>
    </div>
  );
}
