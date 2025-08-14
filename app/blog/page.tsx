/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import BlogBanner from "@/components/PIXELUP/Blog/BlogBanner";

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
  detailContent: string;
  detailImage: { url: string };
  slug: string;
  articleCategories: Category[];
}

const ITEMS_PER_PAGE = 6;

const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/articles?pageSize=10&pageNumber=1&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/article-categories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageSize=10&pageNumber=1`
          ),
        ]);

        setPosts(postsResponse.data.articles);
        setCategories(categoriesResponse.data.articleCategories || []);
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Error al cargar los datos. Por favor, intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((post) =>
        post.articleCategories.some((cat) => cat.id === selectedCategory)
      )
    : posts;

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostClick = () => {
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
{/*       <div className="relative h-[300px] w-full mb-12">
        <img
          src="https://picsum.photos/1920/300"
          alt="Blog banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">Nuestro Blog</h1>
        </div>
      </div> */}
       <div className="relative w-full mb-12">
    <BlogBanner/></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Explorar por categoría
            </h2>
            <div className="relative w-full max-w-md">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                rounded-lg shadow-sm text-lg text-gray-700 dark:text-gray-200 cursor-pointer
                hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                transition-all duration-300"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-white dark:bg-gray-800 rounded overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href={`/blog/post/${post.id}`} className="block" onClick={handlePostClick}>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.previewImage.url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="flex gap-2 flex-wrap">
                      {post.articleCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="text-sm text-white px-3 py-1 rounded bg-primary"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  <Link
                    href={`/blog/post/${post.id}`}
                    className="text-gray-900 hover:text-[#92400E]"
                    onClick={handlePostClick}
                  >
                    {post.title}
                  </Link>
                </h2>
                <div
                  dangerouslySetInnerHTML={{ __html: post.previewContent }}
                  className="text-gray-700 dark:text-gray-300 mb-6 prose prose-img:rounded prose-img:mx-auto line-clamp-3"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.creationDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/blog/post/${post.id}`}
                    className="text-[#92400E] hover:text-primary text-sm font-medium"
                    onClick={handlePostClick}
                  >
                    Leer más →
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ←
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } transition-colors`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;
