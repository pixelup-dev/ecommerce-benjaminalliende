/* eslint-disable @next/next/no-img-element */
export default function SubscriptionPending() {
  return (
    <>
      <title>Sitio Web Inactivo</title>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl w-full p-8 bg-white rounded-xl shadow-2xl text-center border border-gray-100">
          <img
            src="/img/pixelup.png"
            alt="Ícono de mantenimiento"
            className="w-40 h-40 mx-auto"
          />
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Sitio Web Temporalmente Inactivo
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
              </svg>{" "}
              Ingresa a la sección Suscripción en el administrador de tu sitio
              web para reactivar el servicio.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta a nuestro equipo en{" "}
              <a
                href="mailto:hola@pixelup.cl"
                className="text-rosa hover:text-dark font-medium"
              >
                hola@pixelup.cl
              </a>{" "}
              o{" "}
              <a
                href="mailto:soporte@pixelup.cl"
                className="text-rosa hover:text-dark font-medium"
              >
                soporte@pixelup.cl
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
