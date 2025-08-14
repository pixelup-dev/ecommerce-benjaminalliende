"use client";
import { useState, useEffect } from "react";
import axios from "axios";
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

export default function FeedInstagram() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(1);

  const fetchPosts = async () => {
    try {
      const contentBlockId = `${process.env.NEXT_PUBLIC_FEEDINSTAGRAM_CONTENTBLOCK}`;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const postsData = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );
      setPosts(postsData);
    } catch (error) {
      console.error("Error al obtener los posts:", error);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setVisiblePosts(window.innerWidth < 768 ? 1 : 3);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    fetchPosts();
    setIsLoaded(true);
    setIsClient(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!posts.length) return null;

  return (
    <section className=" py-10">
      {" "}
      {/* bg-[#F5F7F2] */}
      <div className="mx-auto px-6 py-4">
        <h2 className="text-4xl   mb-12 text-center text-primary">
          {" "}
          {/* font-kalam text-[#4A6741] */}
          <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-primary/80">
            {" "}
            {/* font-montserrat text-[#8BA888] */}
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
              className="inline-flex items-center px-8 py-3  rounded-full  transition duration-300 group bg-secondary" /* bg-[#6B8E4E]/10 text-[#4A6741] hover:bg-[#6B8E4E]/20 */
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
}
