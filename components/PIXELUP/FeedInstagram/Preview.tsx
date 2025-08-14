"use client";
import { useState, useEffect } from "react";
import "./quill-custom.css";

interface Post {
  id: string;
  nombre: string; // URL de Instagram
}

const InstagramEmbed = ({ url }: { url: string }) => (
  <iframe
    src={`${url}embed`}
    className="instagram-media"
    width="100%"
    height="470"
    frameBorder="0"
    scrolling="no"
  ></iframe>
);

const FeedInstagramPreview = () => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(1);

  // URL de Instagram proporcionada
  const instagramUrl = "https://www.instagram.com/pixelup.cl/p/DMIeADUu3x1/";

  // Crear 3 posts con la misma URL
  const posts: Post[] = [
    { id: "1", nombre: instagramUrl },
    { id: "2", nombre: instagramUrl },
    { id: "3", nombre: instagramUrl }
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setVisiblePosts(window.innerWidth < 768 ? 1 : 3);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    setIsClient(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className="bg-gray-100 py-10">
      <div className="mx-auto px-6 py-4">
        <h2 className="text-4xl mb-12 text-center text-primary">
          <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-[#f64b85]">
            Social
          </span>
          Sígueme en Instagram
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.slice(0, visiblePosts).map((post) => (
            <div
              key={post.id}
              className="flex justify-center"
            >
              {isClient && <InstagramEmbed url={post.nombre} />}
            </div>
          ))}
        </div>

        {/* Botón Cargar Más */}
        {visiblePosts < posts.length && (
          <div className="text-center mt-12">
            <button
              onClick={() =>
                setVisiblePosts((prev) =>
                  Math.min(prev + (isMobile ? 1 : 3), posts.length)
                )
              }
              className="inline-flex items-center px-8 py-3 rounded-full transition duration-300 group bg-secondary"
            >
              <span className="font-montserrat text-sm tracking-wider">
                {isMobile ? "Ver más" : "Cargar más posts"}
              </span>
              <span className="ml-2 transform group-hover:translate-y-1 transition-transform">
                ↓
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedInstagramPreview;