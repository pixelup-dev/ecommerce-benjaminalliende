"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Post {
  id: string;
  title: string;
  detailContent: string;
  detailImage: string;
  creationDate: string;
}

const styles = `
  .prose {
    max-width: none;
  }

  .prose img {
    max-width: 100%;
    height: auto;
    display: inline-block;
    margin: 1em 0;
  }

  .prose p {
    clear: both;
    margin-top: 1em;
  }

  /* Estilos para los encabezados */
  .prose h1 {
    font-size: 2em;
    margin-top: 0.67em;
    margin-bottom: 0.67em;
  }

  .prose h2 {
    font-size: 1.5em;
    margin-top: 0.83em;
    margin-bottom: 0.83em;
  }

  .prose h3 {
    font-size: 1.17em;
    margin-top: 1em;
    margin-bottom: 1em;
  }

  /* Estilos para las listas */
  .prose ul, .prose ol {
    padding-left: 2em;
    margin: 1em 0;
  }

  .prose ul {
    list-style-type: disc;
  }

  .prose ol {
    list-style-type: decimal;
  }

  /* Estilos para blockquotes */
  .prose blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1em;
    margin: 1em 0;
  }

  /* Estilos para código */
  .prose pre {
    background-color: #f3f4f6;
    padding: 1em;
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  .prose code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
  }

  /* Modo oscuro */
  .dark .prose {
    color: #e5e7eb;
  }

  .dark .prose blockquote {
    border-left-color: #4b5563;
  }

  .dark .prose pre,
  .dark .prose code {
    background-color: #374151;
  }
`;

// Agrega los estilos al documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();
        setPost(data.article);
      } catch (error) {
        console.error("Error fetching post", error);
        setError("Failed to fetch post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      ) : post ? (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <time className="text-gray-500 dark:text-gray-400">
                {new Date(post.creationDate).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </header>

          {post.detailImage && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={post.detailImage}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div 
            dangerouslySetInnerHTML={{ __html: post.detailContent }}
            className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
          />
        </article>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-gray-600 dark:text-gray-400 text-xl">
            Post no encontrado
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
