"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  previewContent: string;
  previewImage: { url: string };
  creationDate: string;
  articleCategories: Category[];
}

interface BannerData {
  mainImage: {
    url: string;
  };
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
}

const BlogSection01 = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/articles?pageSize=2&pageNumber=1&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        setPosts(postsResponse.data.articles);

        // Fetch banner data - modificado para seguir la estructura de Hero01
        const bannerId = `${process.env.NEXT_PUBLIC_BLOGHOME_ID}`;
        const bannerResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        
        const bannerImage = bannerResponse.data.banner.images[0];
        setBannerData({
          mainImage: bannerImage.mainImage,
          title: bannerImage.title,
          landingText: bannerImage.landingText,
          buttonText: bannerImage.buttonText,
          buttonLink: bannerImage.buttonLink,
          mainImageLink: bannerImage.mainImageLink
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const SkeletonBanner = () => (
    <div className="relative h-[600px] md:h-full overflow-hidden rounded bg-gray-200 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="h-12 w-3/4 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-300 rounded mb-6"></div>
        <div className="h-12 w-48 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonPost = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-pulse">
      <div className="md:col-span-2">
        <div className="relative h-48 md:h-40 rounded bg-gray-200"></div>
      </div>
      <div className="md:col-span-3">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="py-16 bg-white">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Banner lateral */}
          {loading ? (
            <SkeletonBanner />
          ) : (
            <div className="relative h-[600px] md:h-full overflow-hidden rounded">
              <img
                src={bannerData?.mainImage?.url}
                alt="Blog Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {bannerData?.title}
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-lg">
                  {bannerData?.landingText}
                </p>
                <a
                  href="/blog"
                  className="inline-block bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-full transition-all duration-300"
                >
                  Ver todos los artículos
                </a>
              </div>
            </div>
          )}

          {/* Posts recientes */}
          <div className="space-y-8 md:p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {loading ? (
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                'Últimos Artículos'
              )}
            </h3>
            <div className="space-y-8">
              {loading ? (
                <>
                  <SkeletonPost />
                  <SkeletonPost />
                </>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/post/${post.id}`}
                    className="group cursor-pointer block"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-2">
                        <div className="relative h-48 md:h-40 overflow-hidden rounded">
                          <img
                            src={post.previewImage.url}
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        {post.articleCategories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary text-white mb-3 mr-2"
                          >
                            {category.name}
                          </span>
                        ))}
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#92400E] transition-colors">
                          {post.title}
                        </h4>
                        <div
                          className="text-gray-600 text-sm mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.previewContent }}
                        />
                        <span className="text-sm text-gray-500">
                          {new Date(post.creationDate).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="pt-4">
              <Link
                href="/blog"
                className=" font-medium inline-flex items-center group text-[#92400E]"
              >
                Ver más artículos
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSection01;
