/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl w-full p-8 bg-white rounded-xl shadow-2xl text-center border border-gray-100">
        <img
          src={process.env.NEXT_PUBLIC_LOGO}
          alt="Logo PixelUp"
          className="w-40 h-40 mx-auto mb-6"
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            404 - Página no encontrada
          </h1>
        </div>

        <div className="space-y-4 text-gray-600">
          <p className="text-lg font-medium text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-rosa mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Lo sentimos, la página que buscas parece que se ha perdido en el
            espacio.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-rosa text-white font-semibold rounded-lg hover:bg-dark transition-colors duration-200"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </span>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
