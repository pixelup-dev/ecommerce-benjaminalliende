/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });
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
    <div className="">
      <div className="bg-white min-h-[475px] text-[#333] font-[sans-serif] ">
        <div className="grid md:grid-cols-2 justify-center items-center max-md:text-center gap-8">
          <div className="max-w-2xl mx-auto p-4 ">
            <h2 className="text-3xl md:text-3xl font-extrabold my-6 uppercase">
              EXPERTOS CREANDO MOMENTOS PARA COMPARTIR
            </h2>
            <p className="text-base">
              Somos una marca creada con el objetivo de brindarles a aquellos
              amantes del queso, la charcutería y de los picoteos en general, la
              posibilidad de disfrutar de una combinación de sabores únicos y
              presentaciones gastronómicas de primer nivel. Combinando sabores
              traídos directamente de Europa como lo son el Prosciutto 14 messi,
              la Spinatta romana, la Coppa Italiana, quesos semiduros como el
              Parmesano Reggiano u otros enmohecidos como el queso Brie, entre
              otros. Con sabores nacionales como el queso Mantecoso o el queso
              Chanco elaborados en el hermoso sector sur del país. Jamones y
              charcutería nacional como el jamón acaramelado o ahumado. Además
              de diversas frutas y verduras nacionales utilizadas en diversas
              preparaciones como la mermelada de tomate, romero y tomillo y
              nuestra maravillosa salsa de Merlot.
            </p>
            <p className="text-base mt-2">
              Todo de la mano de nuestro chef fundador, quien se enfoca en
              entregar la mejor calidad en las preparaciones y presentaciones de
              nuestros productos, gracias a su experiencia en cocina nacional y
              su paso por la alta gastronomía en los Alpes y costa azul de
              Francia. experiencia que lo motivó a traer a las mesas de sus
              comensales un producto que los transporte y genere momentos para
              recordar con sus invitados a través de sabores y presentaciones de
              un 5 estrellas.
            </p>
          </div>
          <div className="md:text-right max-md:mt-12 h-full ">
            <img
              src="/img/tavola.jfif"
              alt="Premium Benefits"
              className="w-full h-[800px] object-cover "
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
