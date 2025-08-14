'use client';

import { useState, useEffect } from 'react';
import { InstagramEmbed, FacebookEmbed, LinkedInEmbed, PinterestEmbed, TikTokEmbed } from 'react-social-media-embed';
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin, FaPinterest } from 'react-icons/fa';
import axios from 'axios';

interface SocialPost {
  id: string;
  type: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'pinterest';
  url: string;
  postUrl?: string;
  title: string;
  description?: string;
}

interface InstagramPost {
  id: string;
  nombre: string;
}

const FeedRRSS = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'instagram'>('all');
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
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

        const postsData = JSON.parse(response.data.contentBlock.contentText || "[]");
        setInstagramPosts(postsData);
      } catch (error) {
        console.error("Error al obtener los posts de Instagram:", error);
      }
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setVisiblePosts(window.innerWidth < 768 ? 1 : 3);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    fetchInstagramPosts();
    setIsClient(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const socialPosts: SocialPost[] = [
    ...instagramPosts.map((post: InstagramPost) => ({
      id: post.id,
      type: 'instagram' as const,
      url: post.nombre,
      title: 'Post de Instagram'
    }))
  ];

  const filteredPosts = socialPosts.filter(post => 
    activeTab === 'all' ? true : post.type === activeTab
  );

  const visibleFilteredPosts = filteredPosts.slice(0, visiblePosts);

  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + (isMobile ? 1 : 3));
  };

  const renderPost = (post: SocialPost) => {
    switch (post.type) {
      case 'instagram':
        return (
          <div className="w-full max-w-sm mx-auto">
            <InstagramEmbed 
              url={post.url}
              width={325}
              height={570}
            />
          </div>
        );
      case 'facebook':
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FacebookEmbed url={post.url} width={550} />
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-full max-w-sm mx-auto">
            <LinkedInEmbed 
              url={post.url}
              postUrl={post.postUrl}
              width={325}
              height={570}
            />
          </div>
        );
      case 'pinterest':
        return (
          <div className="w-full max-w-sm mx-auto">
            <PinterestEmbed 
              url={post.url}
              width={345}
              height={467}
            />
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-full max-w-sm mx-auto">
            <TikTokEmbed 
              url={post.url}
              width={325}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!socialPosts.length) return null;

  return (
    <section className="bg-gray-100 py-10">
      <div className="mx-auto px-6 py-4">
        <h2 className="text-4xl mb-12 text-center text-primary">
          <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-[#f64b85]">
            Social
          </span>
          Sígueme en Redes Sociales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {visibleFilteredPosts.map((post) => (
            <div key={post.id} className="flex justify-center">
              {isClient && renderPost(post)}
            </div>
          ))}
        </div>

        {visiblePosts < filteredPosts.length && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
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

export default FeedRRSS;
