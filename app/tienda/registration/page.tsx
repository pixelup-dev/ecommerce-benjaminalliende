/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState<{ id: any }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword(!showRepeatPassword);
  };

  const fetchRegions = async () => {
    try {
      const Pais = "CL";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setRegions(response.data.regions);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchCommunes = async (regionId: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const Pais = "CL";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions/${regionId}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setCommunes(response.data.communes);
    } catch (error) {
      console.error("Error fetching communes:", error);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCommune("");
    if (regionId) {
      fetchCommunes(regionId);
    } else {
      setCommunes([]);
    }
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = e.target.value;
    setSelectedCommune(communeId);
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    const regex = /^\+?[0-9]{9,11}$/; /* El signo + es opcional */
    return regex.test(phone);
  };

  const validateForm = () => {
    const validationErrors = [];
    
    // Nueva validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      validationErrors.push("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (!@#$%^&*).");
    }
    
    if (password !== repeatPassword) {
      validationErrors.push("Las contraseñas no coinciden.");
    }
    if (!validateEmail(email)) {
      validationErrors.push("El correo no es válido.");
    }
    if (!validatePhone(phone)) {
      validationErrors.push("El número de celular no es válido.");
    }
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      return;
    }

    const recaptchaToken = await executeRecaptcha("register");

    const formData = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
      confirmPassword: repeatPassword,
      phoneNumber: phone,
      communeId: selectedCommune,
      addressLine1: address,
      recaptchaToken: recaptchaToken,
    };

    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers?siteId=${SiteId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 3) {
          setEmailExists(true);
        } else {
          setPassword("");
          setRepeatPassword("");
          setEmail("");
          setAddress("");
          setFirstname("");
          setLastname("");
          setPhone("");
          router.push("/tienda/login");
          toast.success("Cuenta creada exitosamente");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-200">
      <div className="relative z-10 mx-auto min-w-[400px] w-[90%] max-w-[800px] px-6 lg:px-8 py-20">
        <div
          className="bg-white shadow-xl"
          style={{ borderRadius: "var(--radius)" }}
        >
          <form
            onSubmit={handleSubmit}
            className="lg:p-11 p-7 mx-auto"
          >
            <div className="mb-11">
              <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                Crear cuenta
              </h1>
              <p className="text-gray-500 text-center text-base font-medium leading-6">
                Completa con tus datos personales
              </p>
            </div>
            <div className="flex space-x-4 mb-6">
              <div className="w-1/2">
                <label className="block text-gray-700">Nombre*</label>
                <input
                  type="text"
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                  placeholder="Nombre"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700">Apellido*</label>
                <input
                  type="text"
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                  placeholder="Apellido"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Contraseña*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4 pr-10"
                  placeholder="Contraseña"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
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
                      className="size-6"
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
              <label className="block text-gray-700">Repetir contraseña*</label>
              <div className="relative">
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4 pr-10"
                  placeholder="Repetir contraseña"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600"
                  onClick={toggleRepeatPasswordVisibility}
                >
                  {showRepeatPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
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
                      className="size-6"
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
              <label className="block text-gray-700">Correo*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Correo"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Teléfono*</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => {
                  // Permitir solo números, el signo +, la tecla Backspace y las flechas izquierda y derecha
                  if (
                    (e.key === "+" && e.currentTarget.value.includes("+")) || // Solo permitir un signo +
                    (!/^[0-9+]$/.test(e.key) && // Permitir solo números y +
                      e.key !== "Backspace" && // Permitir Backspace
                      e.key !== "ArrowLeft" && // Permitir flecha izquierda
                      e.key !== "ArrowRight") // Permitir flecha derecha
                  ) {
                    e.preventDefault();
                  }
                }}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Teléfono"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Dirección*</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Dirección"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Región*</label>
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value="">Selecciona una región</option>
                {regions.map((region: any) => (
                  <option
                    key={region.id}
                    value={region.id}
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Comuna*</label>
              <select
                value={selectedCommune}
                onChange={handleCommuneChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value="">Selecciona una comuna</option>
                {communes.map((commune: any) => (
                  <option
                    key={commune.id}
                    value={commune.id}
                  >
                    {commune.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.length > 0 && (
              <div className="mb-6">
                <ul className="text-red-500 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
            >
              Crear cuenta
            </button>
          </form>
        </div>
      </div>
      {emailExists && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Correo ya existe</h2>
            <p className="mb-4">
              El correo que has ingresado ya está registrado. Por favor, intenta
              con otro correo.
            </p>
            <button
              onClick={() => setEmailExists(false)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
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
      <RegisterForm />
    </GoogleReCaptchaProvider>
  );
}
