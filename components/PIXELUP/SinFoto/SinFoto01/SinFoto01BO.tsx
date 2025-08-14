/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface BannerImage {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: any;
}

const   SinFoto01BO: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const [bannerData, setBannerData] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<BannerImage>({
    id: "",
    title: "pixelup.cl",
    landingText: "pixelup.cl",
    buttonLink: "",
    buttonText: "",
    mainImageLink: "pixelup.cl",
    orderNumber: 1,
    mainImage: {
      url: "",
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(true);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const MAX_CHARACTERS = 1000;
  const ALERT_CHARACTERS = 999;

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      setSkeletonLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO01_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBannerData(response.data.bannerImages);
      if (response.data.bannerImages.length > 0) {
        console.log(response.data.bannerImages, "response.data.bannerImages");
        const initialImage = response.data.bannerImages[0];
        setFileName(initialImage.mainImage.name);
        setFormData({
          id: initialImage.id,
          title: initialImage.title,
          landingText: initialImage.landingText,
          buttonLink: initialImage.buttonLink,
          buttonText: initialImage.buttonText,
          mainImageLink: initialImage.mainImageLink,
          orderNumber: initialImage.orderNumber,
          mainImage: initialImage.mainImage,
        });
        setMainImage(initialImage.mainImage.url || initialImage.mainImage.data);
      }
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setLoading(false);
      setSkeletonLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Almacena el nombre del archivo
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsMainImageUploaded(true); // Indicar que una nueva imagen ha sido cargada
        setIsModalOpen(true); // Open modal for cropping
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );
  const handleCrop = async () => {
    if (!mainImage) return;

    try {
      const croppedImage = await getCroppedImg(mainImage, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 1,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName, // Usa el nombre del archivo almacenado
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormData((prevFormData) => ({
        ...prevFormData,
        mainImage: imageInfo,
      }));
      setMainImage(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClearImage = () => {
    setMainImage(formData.mainImage.url || formData.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO01_ID}`;

      const dataToSend = {
        title: formData.title,
        landingText: formData.landingText,
        buttonLink: formData.buttonLink,
        buttonText: formData.buttonText,
        mainImageLink: "mainImageLink",
        orderNumber: formData.orderNumber,
        ...(isMainImageUploaded && { mainImage: formData.mainImage }),
      };

      if (isAddingImage) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setIsAddingImage(false);
      } else {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      fetchBannerHome();
    } catch (error) {
      console.error("Error al actualizar el banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO01_ID}`;
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchBannerHome();
    } catch (error) {
      console.error("Error al borrar la imagen del banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = async () => {
    setSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const nextIndex = (currentIndex + 1) % bannerData.length;
    setCurrentIndex(nextIndex);
    const nextImage = bannerData[nextIndex];
    setFormData(nextImage);
    setMainImage(nextImage.mainImage.url || nextImage.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado de la imagen cargada
    setSkeletonLoading(false);
  };

  const handlePrevImage = async () => {
    setSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const prevIndex =
      (currentIndex - 1 + bannerData.length) % bannerData.length;
    setCurrentIndex(prevIndex);
    const prevImage = bannerData[prevIndex];
    setFormData(prevImage);
    setMainImage(prevImage.mainImage.url || prevImage.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado de la imagen cargada
    setSkeletonLoading(false);
  };
  const handleAddImageClick = () => {
    if (isAddingImage) {
      // Si ya estamos en el estado de agregar, esto cancela la operación
      setFormData({
        id: bannerData[currentIndex]?.id || "",
        title: bannerData[currentIndex]?.title || "",
        landingText: bannerData[currentIndex]?.landingText || "",
        buttonLink: bannerData[currentIndex]?.buttonLink || "",
        buttonText: bannerData[currentIndex]?.buttonText || "",
        mainImageLink: bannerData[currentIndex]?.mainImageLink || "",
        orderNumber: bannerData[currentIndex]?.orderNumber || 1,
        mainImage: bannerData[currentIndex]?.mainImage || {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setMainImage(
        bannerData[currentIndex]?.mainImage?.url ||
          bannerData[currentIndex]?.mainImage?.data ||
          null
      );
      setIsAddingImage(false);
      setIsMainImageUploaded(false); 
    } else {
      // Si no estamos agregando, iniciar el proceso de agregar
      setFormData({
        id: "",
        title: "",
        landingText: "",
        buttonLink: "",
        buttonText: "",
        mainImageLink: "",
        orderNumber: 1,
        mainImage: {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setMainImage(null);
      setIsAddingImage(true);
      fileInputRef.current?.click();
      setIsMainImageUploaded(false);
    }
  };

  const handleEditorChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setFormData({ ...formData, landingText: value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  const SkeletonLoader = () => (
    <div className="relative font-sans before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-30 before:z-10">
      <div className="absolute inset-0 w-full h-full bg-gray-100 animate-pulse" />
      <div className="min-h-[300px] relative z-20 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
        <div className="w-1/2 h-6 bg-gray-500 animate-pulse mb-2 rounded"></div>
        <div className="w-3/4 h-4 bg-gray-500 animate-pulse rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
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
    );
  }

  return (
    <section
      id="banner"
      className="relative w-full overflow-hidden"
      aria-label="Banner principal"
    >
      <div className="relative w-full">
        {skeletonLoading ? (
          <SkeletonLoader />
        ) : (
          <>

          <section className="py-20 bg-[#F5F7F2]">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-kalam text-[#4A6741] mb-8 text-center">
          <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-[#8BA888] font-montserrat">
          {formData.buttonLink}
          </span>
          {formData.title}
        </h2>
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div
            className="text-[#718878] text-lg leading-relaxed editortexto mb-12"
            dangerouslySetInnerHTML={{ __html: formData?.landingText }}
          />
          <button
            className="bg-[#6B8E4E] text-white px-8 py-3 rounded-full hover:bg-[#8BA888] transition duration-300 shadow-md hover:shadow-lg font-montserrat text-sm tracking-wider uppercase"
          >
            {formData.buttonText}
          </button>
        </div>
      </div>
    </div>
  </section>










            {/* Controles de navegación */}
            {bannerData.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-[40%] transform -translate-y-1/2 z-30 text-white bg-black/50 p-2 rounded cursor-pointer hover:bg-black/70"
                  onClick={handlePrevImage}
                  aria-label="Imagen anterior"
                >
                  &#10094;
                </button>
                <button
                  className="absolute right-4 top-[40%] transform -translate-y-1/2 z-30 text-white bg-black/50 p-2 rounded cursor-pointer hover:bg-black/70"
                  onClick={handleNextImage}
                  aria-label="Siguiente imagen"
                >
                  &#10095;
                </button>

                {/* Indicadores de posición */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                  {bannerData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === currentIndex
                          ? "bg-white"
                          : "bg-gray-400/60 hover:bg-gray-400"
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Resto del formulario y controles */}
      <div className="mt-8">
{/*         <div className="flex justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={handleAddImageClick}
            className={`shadow w-full uppercase text-white font-bold py-2 px-4 rounded flex-wrap ${
              isAddingImage
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAddingImage ? "Cancelar" : "Agregar Banner"}
          </button>

          {bannerData.length > 1 && (
            <button
              type="button"
              onClick={handleDeleteImage}
              className="shadow bg-red-600 hover:bg-red-700 w-full uppercase text-white font-bold py-2 px-4 rounded flex-wrap"
            >
              Borrar Imagen
            </button>
          )}
        </div> */}

        {/* Formulario existente */}
        <form
          onSubmit={handleSubmit}
          className="px-4 mx-auto"
        >
          <h3 className="font-normal text-primary">
            Epígrafe <span className="text-primary">*</span>
          </h3>
          <input
            type="text"
            name="buttonLink"
            value={formData.buttonLink}
            onChange={handleChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
            placeholder="Título del banner"
          />
          <h3 className="font-normal text-primary">
            Título <span className="text-primary">*</span>
          </h3>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
            placeholder="Título del banner"
          />

<h3 className="font-normal text-primary">
          Contenido <span className="text-primary">*</span>
        </h3>
        <ReactQuill
          value={formData.landingText}
          onChange={handleEditorChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Contenido"
          onKeyDown={handleKeyDown}
        />
        <div className="text-right text-sm text-gray-600">
        {formData.landingText.length}/{MAX_CHARACTERS}
        </div>
        {formData.landingText.length > ALERT_CHARACTERS && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">Limite Alcanzado!</span> Los
              caracteres extras no seran mostrados.
            </div>
          </div>
        )}

          <h3 className="font-normal text-primary">
            Texto Botón <span className="text-primary">*</span>
          </h3>
          <input
            type="text"
            name="buttonText"
            value={formData.buttonText}
            onChange={handleChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
            placeholder="Texto Botón"
          />

          <button
            type="submit"
            disabled={loading}
            className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
            style={{ borderRadius: "var(--radius)" }}
          >
            {loading ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                Loading...
              </>
            ) : isAddingImage ? (
              "Crear Banner"
            ) : (
              "Actualizar"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SinFoto01BO;