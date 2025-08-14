/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import axios from "axios";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      setLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha("contact_form");

      const data = {
        ...formData,
        recaptchaToken,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/contacts?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Mensaje enviado exitosamente");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        }); // Limpiar el formulario
        router.push("/");
      } else {
        toast.error("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje", error);
      setError("Error al enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10">
      <div className=" px-6 mt-6 mb-12 mx-auto">
        <div className="w-full items-center justify-center text-center">
          <p className="text-4xl md:text-5xl font-extrabold my-6 text-primary">
            Contacto
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-2">
          <div className="p-4 py-6 rounded-lg bg-gray-50 dark:bg-gray-800 md:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                name="name"
                type="text"
                className="block w-full px-5 py-2.5 text-gray-700 placeholder-gray-400 bg-gray-100 border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                className="block w-full px-5 py-2.5 text-gray-700 placeholder-gray-400 bg-gray-100 border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                name="subject"
                type="text"
                className="block w-full px-5 py-2.5 text-gray-700 placeholder-gray-400 bg-gray-100 border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                placeholder="Asunto"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                className="block w-full h-32 px-5 py-2.5 text-gray-700 placeholder-gray-400 bg-gray-100 border border-gray-200 rounded-lg md:h-80 dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                placeholder="Mensaje"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <button
                type="submit"
                className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white bg-primary rounded-lg hover:bg-primary transition-colors duration-300 transform focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Enviar"}
              </button>
            </form>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-1">
            <img
              src="/img/pollollamada.webp"
              alt="Premium Benefits"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const siteKey = process.env.RECAPTCHA_PUBLIC_SITE_KEY || "";

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <ContactForm />
    </GoogleReCaptchaProvider>
  );
}
