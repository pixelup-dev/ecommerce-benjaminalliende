import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 px-4">
      {/* Número 404 estilizado */}
      <h1 className="text-9xl font-extrabold text-gray-900 tracking-widest animate-pulse">
        404
      </h1>

      {/* Mensaje de error */}
      <div className="bg-white px-8 py-6 rounded-lg shadow-lg text-center mt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Ups! Página no encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          Lo sentimos, la página que buscas parece que se ha perdido en el
          espacio.
        </p>

        {/* Botón para volver al inicio */}
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Volver al inicio
        </Link>
      </div>

      {/* Línea decorativa */}
      <div className="w-full max-w-lg h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mt-8 rounded-full" />
    </div>
  );
}
