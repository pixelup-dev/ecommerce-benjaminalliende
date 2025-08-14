"use client";
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import BodegasStarken from "./BodegasStarken";
import { jwtDecode } from "jwt-decode";

interface Option {
  id: string;
  code: string;
  description: string;
  value: string;
}

interface FormData {
  description: string;
  value: string;
}

const OptionsComponent = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    description: "",
    value: "",
  });
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const token = getCookie("AdminTokenAuth");

  const fetchOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/options?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOptions(response.data.options);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (option: Option) => {
    setEditingOption(option.id);
    setFormData({
      description: option.description,
      value: option.value,
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveClick = async () => {
    if (!editingOption) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/options/${editingOption}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          description: formData.description,
          value: formData.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.id === editingOption
            ? {
                ...option,
                description: formData.description,
                value: formData.value,
              }
            : option
        )
      );
      setEditingOption(null);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "vamoscontodo") {
      setIsAuthorized(true);
    } else {
      alert("Código incorrecto. Por favor, intente nuevamente.");
      setAccessCode("");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) return;
        
        const decodedToken = jwtDecode<{ sub: string }>(token as string);
        const userId = decodedToken.sub;
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users/${userId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const userEmail = response.data.user.email;
        setUserEmail(userEmail);
        // Autorizar automáticamente solo si es el usuario de PixelUP
        if (userEmail === "hola.pixelup@gmail.com") {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthorized && userEmail !== "hola.pixelup@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Acceso Restringido</h2>
          <form onSubmit={handleCodeSubmit}>
            <div className="mb-4">
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Ingrese el código de acceso
              </label>
              <input
                type="password"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verificar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Opciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            className="p-6 border rounded-lg shadow-lg bg-white"
          >
            {editingOption === option.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingOption(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">ID:</span>{" "}
                  {option.id}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Código:</span>{" "}
                  {option.code}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    Descripción:
                  </span>{" "}
                  {option.description}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Valor:</span>{" "}
                  {option.value}
                </p>
                <button
                  onClick={() => handleEditClick(option)}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <BodegasStarken token={token as string} />
    </div>
  );
};

export default OptionsComponent;
