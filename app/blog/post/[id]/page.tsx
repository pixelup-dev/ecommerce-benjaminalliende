/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  detailContent: string;
  detailImage: { url: string };
  creationDate: string;
  previewContent: string;
  previewImage: { url: string };
}

const styles = `
  /* Estilos base */
  .ql-editor {
    padding: 0;
    overflow-x: hidden;
    max-width: 100%;
  }

  /* Estilos de texto */
  .ql-editor p {
    margin-bottom: 1em;
    clear: both;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Encabezados */
  .ql-editor h1 {
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .ql-editor h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .ql-editor h3 {
    font-size: 1.17em;
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  /* Alineación */
  .ql-editor .ql-align-left {
    text-align: left;
  }

  .ql-editor .ql-align-center {
    text-align: center;
  }

  .ql-editor .ql-align-right {
    text-align: right;
  }

  .ql-editor .ql-align-justify {
    text-align: justify;
  }

  /* Imágenes */
  .ql-editor img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em auto;
    object-fit: contain;
  }

  /* Contenedores de imágenes */
  .ql-editor p:has(img) {
    max-width: 100%;
    overflow: hidden;
  }

  /* Ajustes para imágenes alineadas */
  .ql-editor p.ql-align-center img {
    margin-left: auto;
    margin-right: auto;
  }

  .ql-editor p.ql-align-right img {
    margin-left: auto;
    margin-right: 0;
  }

  .ql-editor p.ql-align-left img {
    margin-right: auto;
    margin-left: 0;
  }

  /* Asegurar que todos los elementos respeten el ancho máximo */
  .ql-editor * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Estilos de texto */
  .ql-editor strong {
    font-weight: bold;
  }

  .ql-editor em {
    font-style: italic;
  }

  .ql-editor u {
    text-decoration: underline;
  }

  .ql-editor strike {
    text-decoration: line-through;
  }

  /* Blockquotes */
  .ql-editor blockquote {
    border-left: 4px solid #ccc;
    margin-bottom: 1em;
    margin-top: 1em;
    padding-left: 16px;
  }

  /* Código */
  .ql-editor pre {
    background-color: #f0f0f0;
    border-radius: 3px;
    padding: 1em;
    margin-bottom: 1em;
    white-space: pre-wrap;
  }

  /* Modo oscuro */
  .dark .ql-editor pre {
    background-color: #2d3748;
  }

  .dark .ql-editor blockquote {
    border-left-color: #4a5568;
  }
`;

// Agregar los estilos al documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, relatedResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/articles/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/articles?pageSize=4&pageNumber=1&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          )
        ]);
        
        setPost(postResponse.data.article);
        setRelatedPosts(relatedResponse.data.articles.filter((p: Post) => p.id !== id).slice(0, 4));
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Error al cargar los datos. Por favor, intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center mt-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!post) {
    return <div className="text-center mt-8">Post no encontrado</div>;
  }

  return (
    <main>
      {/* Banner de imagen principal */}
      <div className="w-full h-[300px] mb-12">
        <img
          src={post.detailImage?.url}
          alt={post.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600">
          <Link href="/blog" className="hover:text-blue-600">
            Blog
          </Link>
          <span className="mx-2">→</span>
          <span>Artículo</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-gray-600 mb-4 text-sm">
                <time className="bg-gray-100 px-3 py-1 rounded">
                  {new Date(post.creationDate).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>
            </div>

            <div className="prose prose-lg max-w-3xl">
              <div
                dangerouslySetInnerHTML={{ __html: post.previewContent }}
                className="ql-editor"
              />
            </div>
            <div className="prose prose-lg max-w-3xl">
              <div
                dangerouslySetInnerHTML={{ __html: post.detailContent }}
                className="ql-editor"
              />
            </div>
          </div>

          {/* Barra lateral */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-gray-50 rounded p-6">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">
                Últimos artículos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    href={`/blog/post/${relatedPost.id}`}
                    key={relatedPost.id}
                    className="flex flex-col gap-3 group"
                  >
                    <div className="relative w-full aspect-video">
                      <img
                        src={relatedPost.previewImage?.url}
                        alt={relatedPost.title}
                        className="object-cover rounded w-full h-full transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <time className="text-sm text-gray-600 mt-1 block">
                        {new Date(relatedPost.creationDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default PostDetail;
