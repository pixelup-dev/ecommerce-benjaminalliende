"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const CreatePasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Obtener el token de la URL
  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("La contraseña debe incluir al menos una letra mayúscula");
      return;
    }

    if (!/\d/.test(password)) {
      toast.error("La contraseña debe incluir al menos un número");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users/${userId}/passwords`,
        {
          token,
          password,
          confirmPassword,
        }
      );

      toast.success("Contraseña creada con éxito");
      router.push("/admin/login");
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("Datos inválidos, por favor revisa tu información");
      } else {
        toast.error("Error al crear la contraseña");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-20  flex justify-center">
      <div className="flex flex-col max-w-3xl justify-center p-10 bg-gray-50 rounded shadow">
        <h2 className="text-3xl font-bold text-center">Crea tu contraseña</h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mt-10"
        >
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePasswordForm;
