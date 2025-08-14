"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

// Definir interfaces para el tipado
interface ContentData {
  title: string;
  paragraph: string;
  listItems: string[];
  buttonText: string;
  buttonLink: string;
  videoUrl: string;
  videoUrl2: string;
  videoTitle1: string;
  videoTitle2: string;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const Hero14: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_HERO14_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data.code === 0 && response.data.contentBlock) {
          try {
            const parsedData = JSON.parse(response.data.contentBlock.contentText);
            setContentData(parsedData);
          } catch (error) {
            console.error("Error al parsear JSON:", error);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [ContentBlockId]);

  if (!contentData) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="beforeInteractive"
      />
      <section className="py-12 bg-white">
        <div className="mx-auto px-4">
          {/* Encabezado con estilo consistente */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <h2 className="font-oldStandard text-2xl md:text-3xl text-gray-900 px-4">
                {contentData?.title || ""}
              </h2>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            <h4 className="font-poppins text-md text-primary uppercase tracking-wider -mt-2">
              {contentData?.paragraph || ""}
            </h4>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna video 1 */}
                <div className="aspect-video overflow-hidden shadow-lg"  style={{ borderRadius: "var(--radius)" }}
              >
                <iframe
                  className="w-full h-full shadow-lg"
                  src={`${contentData?.videoUrl || ""}?autoplay=1&mute=1&playlist=${contentData?.videoUrl?.split('/').pop()}&rel=0&modestbranding=1&controls=1&showinfo=0&enablejsapi=1`}
                  title="Video 1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  id="youtube-player-1"
                />
                <div className="p-4 bg-gray-50">
                  <h3 className="font-oldStandard text-lg text-gray-800">
                    {contentData?.videoTitle1 || ""}
                  </h3>
                </div>
              </div>

              {/* Columna video 2 */}
              <div className="aspect-video overflow-hidden shadow-lg"  style={{ borderRadius: "var(--radius)" }}
              >
                <iframe
                  className="w-full h-full shadow-lg"
                  src={`${contentData?.videoUrl2 || ""}?autoplay=1&mute=1&playlist=${contentData?.videoUrl2?.split('/').pop()}&rel=0&modestbranding=1&controls=1&showinfo=0&enablejsapi=1`}
                  title="Video 2"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  id="youtube-player-2" 
                  

                />
                <div className="p-4 bg-gray-50">
                  <h3 className="font-oldStandard text-lg text-gray-800">
                    {contentData?.videoTitle2 || ""}
                  </h3>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6"  
            >
              <a
                href={contentData?.buttonLink || "#"}
                className="bg-primary hover:bg-primary text-white px-4 py-2"
                style={{ borderRadius: "var(--radius)" }}
              >
                {contentData?.buttonText || ""}
              </a>
            </div>
          </div>
        </div>
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            var player1, player2;
            function onYouTubeIframeAPIReady() {
              player1 = new YT.Player('youtube-player-1', {
                events: {
                  'onStateChange': function(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                      player1.playVideo();
                    }
                  }
                }
              });
              player2 = new YT.Player('youtube-player-2', {
                events: {
                  'onStateChange': function(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                      player2.playVideo();
                    }
                  }
                }
              });
            }
          `,
        }}
      />
    </>
  );
};

export default Hero14;
