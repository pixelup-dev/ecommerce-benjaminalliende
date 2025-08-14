"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { setCookie } from "cookies-next";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

function ClientLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Modificar los estados para usar localStorage con comprobación del lado del cliente
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Añadir efecto para inicializar los valores desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAttempts = localStorage.getItem('clientLoginAttempts');
      const savedLockoutTime = localStorage.getItem('clientLockoutTime');
      
      if (savedAttempts) {
        setLoginAttempts(parseInt(savedAttempts));
      }
      
      if (savedLockoutTime) {
        const time = parseInt(savedLockoutTime);
        if (time > Date.now()) {
          setLockoutTime(time);
        }
      }
    }
  }, []);

  // Añadir efectos para persistir datos
  useEffect(() => {
    if (loginAttempts > 0) {
      localStorage.setItem('clientLoginAttempts', loginAttempts.toString());
    } else {
      localStorage.removeItem('clientLoginAttempts');
    }
  }, [loginAttempts]);

  useEffect(() => {
    if (lockoutTime) {
      localStorage.setItem('clientLockoutTime', lockoutTime.toString());
    } else {
      localStorage.removeItem('clientLockoutTime');
    }
  }, [lockoutTime]);

  // Modificar el efecto del temporizador
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTime && lockoutTime > Date.now()) {
      timer = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        setRemainingSeconds(remaining);
        
        if (Date.now() > lockoutTime) {
          setLockoutTime(null);
          setLoginAttempts(0);
          setRemainingSeconds(0);
          localStorage.removeItem('clientLockoutTime');
          localStorage.removeItem('clientLoginAttempts');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const { executeRecaptcha } = useGoogleReCaptcha();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
    }
  }, [executeRecaptcha]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (lockoutTime && lockoutTime > Date.now()) {
      setError(`Error: Has excedido el número máximo de intentos. Por favor, espera ${formatTime(remainingSeconds)}`);
      setLoading(false);
      return;
    }

    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      setLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha("login");
      setRecaptchaToken(recaptchaToken);

      const data = {
        email: e.target[0].value,
        password: e.target[1].value,
        recaptchaToken: recaptchaToken, // Añadir el token de reCAPTCHA
      };

      const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/authentications?siteId=${SiteId}`,
        data
      );

      if (response.status !== 200) {
        console.log("error");
        throw new Error("Error during login");
      }

      const authToken = response.data.token;

      // Configurar la cookie para que expire en 45 minutos
      setCookie("ClientTokenAuth", authToken, {
        maxAge: 60 * 45, // 45 minutos en segundos
      });

      setLoginAttempts(0);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during login:", error);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockoutEndTime = Date.now() + 5 * 60 * 1000; // 5 minutos
        setLockoutTime(lockoutEndTime);
        setError(`Error: Has excedido el número máximo de intentos. Por favor, espera ${formatTime(300)}`);
      } else {
        setError("Error de inicio de sesión. Por favor, verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full justify-center items-center h-[40rem] md:h-screen bg-gray-200">
      <div className="mx-4 md:mx-0 w-full max-w-md px-6 py-10 rounded-2xl bg-white shadow-three dark:bg-dark sm:p-10">
        <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
          Ingresa a tu cuenta
        </h3>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label
              htmlFor="email"
              className="mb-3 block text-sm text-dark dark:text-white"
            >
              Tu Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Ingresa tu Email"
              className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
              required
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="password"
              className="mb-3 block text-sm text-dark dark:text-white"
            >
              Tu Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Ingresa tu Contraseña"
                className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none pr-12" // Ajuste en el padding derecho
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-sm bg-primary px-9 py-4 text-base font-medium text-secondary shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
        <p className="text-center text-base  text-body-color text-[0.8rem]">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/tienda/registration"
            className="text-gray-600 underline"
          >
            Regístrate
          </Link>
        </p>
        <p className="text-center text-base font-medium text-body-color text-[0.8rem]">
          ¿Olvidaste tu Contraseña?{" "}
          <Link
            href="/tienda/recuperar-password"
            className="text-gray-600 underline"
          >
            <p className="text-center text-base font-medium text-body-color text-[0.8rem]">
              Recuperar Contraseña
            </p>
          </Link>
        </p>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[9999]">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      )}
    </div>
  );
}

export default function App() {
  const siteKey = process.env.RECAPTCHA_PUBLIC_SITE_KEY || "";

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <ClientLoginForm />
    </GoogleReCaptchaProvider>
  );
}
