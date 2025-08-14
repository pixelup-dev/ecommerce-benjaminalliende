/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

export default function HomeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, email, subject, message } = formData;
    const data = {
      name,
      email,
      subject,
      message,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/contacts?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        alert("Mensaje enviado exitosamente");
      } else {
        alert("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje", error);
      alert("Error al enviar el mensaje");
    }
  };

  return (
    <div className="pt-16">
      <div className="bg-white min-h-[475px] text-[#333] font-[sans-serif]">
        <div className="grid md:grid-cols-2 justify-center items-center max-md:text-center gap-8">
          <div className="max-w-md mx-auto p-4">
            <h2 className="text-4xl md:text-5xl font-extrabold my-6 md:!leading-[55px] uppercase">
              Encarga tu pedido
            </h2>
            <p className="text-base">Haz tu pedido personalizado con {process.env.NEXT_PUBLIC_NOMBRE_TIENDA}</p>
            <div className="my-8 space-y-6">
              <input
                name="name"
                type="text"
                className="bg-gray-100 w-full text-sm px-4 py-3 outline-[#333]"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                className="bg-gray-100 w-full text-sm px-4 py-3 outline-[#333]"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                name="subject"
                type="text"
                className="bg-gray-100 w-full text-sm px-4 py-3 outline-[#333]"
                placeholder="Asunto"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                className="bg-gray-100 w-full text-sm px-4 py-3 outline-[#333]"
                placeholder="Mensaje"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <button
                type="button"
                className="w-full px-4 py-2 text-base tracking-wider font-semibold outline-none border border-[#333] bg-[#222] text-white hover:bg-transparent hover:text-[#333] transition-all duration-300"
                onClick={handleSubmit}
              >
                Enviar
              </button>
            </div>
          </div>
          <div className="md:text-right max-md:mt-12 h-full hidden md:flex">
            <img
              src="/img/Anillo-Infinito_01.webp"
              alt="Premium Benefits"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
