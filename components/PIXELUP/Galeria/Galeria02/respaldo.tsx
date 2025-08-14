/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from "react";

import axios from "axios";

import Script from "next/script";



interface BannerImage {

  id: string;

  mainImage: {

    url: string;

    data?: string;

  };

}



interface ContentData {

  title: string;

  landingText: string;

  buttonLink: string;

  buttonText: string;

}



interface LandingTextContent {

  mainTitle: string;

  mainDescription: string;

  features: {

    title1: string;

    description1: string;

    title2: string;

    description2: string;

  };

  buttonText: string;

}



function Galeria() {

  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);

  const [content, setContent] = useState<ContentData>({

    title: "",

    landingText: "",

    buttonLink: "",

    buttonText: "",

  });

  const [parsedContent, setParsedContent] = useState<LandingTextContent>({

    mainTitle: "",

    mainDescription: "",

    features: {

      title1: "",

      description1: "",

      title2: "",

      description2: "",

    },

    buttonText: "",

  });

  const [loading, setLoading] = useState(true);



  const fetchData = async () => {

    try {

      setLoading(true);

      const imagesResponse = await axios.get(

        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_GALERIA_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`

      );



      if (imagesResponse.data?.banner?.images) {

        setBannerImages(imagesResponse.data.banner.images);

      }



      const contentResponse = await axios.get(

        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_GALERIA_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`

      );



      if (contentResponse.data?.banner) {

        setContent(contentResponse.data.banner);

        try {

          const parsed = JSON.parse(contentResponse.data.banner.landingText || "{}");

          setParsedContent(parsed);

        } catch (error) {

          console.error("Error al parsear el contenido:", error);

        }

      }

    } catch (error) {

      console.error("Error al obtener los datos:", error);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchData();

  }, []);



  if (loading) {

    return (

      <div className="bg-white py-24">

        <div className="mx-auto px-4">

          <div className="grid md:grid-cols-2 gap-12">

            <div className="h-[524px] w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse" />

            <div className="grid grid-cols-2 gap-4">

              {[1, 2, 3, 4].map((index) => (

                <div key={index} className="h-[250px] rounded-xl bg-gray-200 animate-pulse" />

              ))}

            </div>

          </div>

        </div>

      </div>

    );

  }



  return (

    <>

      <Script

        src="https://www.youtube.com/iframe_api"

        strategy="beforeInteractive"

      />


      <div className="bg-white py-24">

        <div className="mx-auto px-4">


          <div className="grid md:grid-cols-2 gap-12">


            <div className="h-[524px] w-full rounded-2xl overflow-hidden">

              {content.buttonLink && (

                <>

                  <iframe

                    className="w-full h-full"

                    src={`${content.buttonLink}?autoplay=1&mute=1&playlist=${content.buttonLink.split('/').pop()}&rel=0&modestbranding=1&controls=0&showinfo=0&enablejsapi=1`}

                    title="Video corporativo"

                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"

                    allowFullScreen

                    loading="lazy"

                    id="youtube-player"

                  />

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

                </>

              )}

            </div>


            <div className="grid grid-cols-2 gap-4">

              {bannerImages.map((image, index) => (

                <div

                  key={image.id}


                  className="relative rounded-xl overflow-hidden shadow-lg h-[250px] hover:shadow-2xl transition-all duration-300 group"

                >

                  <img

                    src={image.mainImage.url}

                    alt={`Proyecto ${index + 1}`}

                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"

                  />



                </div>

              ))}

              {bannerImages.length < 4 &&

                Array.from({ length: 4 - bannerImages.length }).map((_, index) => (

                  <div

                    key={`default-${index}`}


                    className="relative rounded-xl overflow-hidden shadow-lg h-[250px] hover:shadow-2xl transition-all duration-300 group"

                  >

                    <img

                      src={`/cubico/${bannerImages.length + index + 1}.webp`}

                      alt={`Proyecto ${bannerImages.length + index + 1}`}

                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"

                    />



                  </div>

                ))}

            </div>

          </div>

        </div>

      </div>

    </>

  );

}

