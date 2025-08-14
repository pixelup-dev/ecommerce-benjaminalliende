"use client";
import React from "react";
import Script from "next/script";
import { previewData } from "@/app/config/previewData";

const Hero07Preview = () => {
  // Datos de ejemplo para el preview
  const contentData = {
    title: previewData.titulo || "Título Principal del Hero",
    paragraph: previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección.",
    listItems: [
      "Característica importante 1",
      "Característica importante 2", 
      "Característica importante 3"
    ],
    buttonText: "Conoce más",
    buttonLink: "#",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  };

  return (
    <>
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="beforeInteractive"
      />
      <section className="py-16">
        <div className="mx-auto px-8 max-w-[90%]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Columna de Texto */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold mb-4">
                {contentData.title}
              </h2>
              <div 
                className="text-lg mb-6"
                dangerouslySetInnerHTML={{ __html: contentData.paragraph }}
              />
              <div className="space-y-4">
                {contentData.listItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="">{item}</span>
                  </div>
                ))}
              </div>
              <a 
                href={contentData.buttonLink}
                className="mt-8 bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/50 transition-colors inline-flex items-center gap-2"
                style={{ borderRadius: "var(--radius)" }}
              >
                {contentData.buttonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            {/* Columna de Video */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius)" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`${contentData.videoUrl}?autoplay=1&mute=1&playlist=${contentData.videoUrl.split('/').pop()}&rel=0&modestbranding=1&controls=0&showinfo=0&enablejsapi=1`}
                title="Video corporativo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                id="youtube-player"
              ></iframe>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    var player;
                    function onYouTubeIframeAPIReady() {
                      player = new YT.Player('youtube-player', {
                        events: {
                          'onStateChange': onPlayerStateChange
                        }
                      });
                    }
                    function onPlayerStateChange(event) {
                      if (event.data == YT.PlayerState.ENDED) {
                        player.playVideo();
                      }
                    }
                  `,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero07Preview;