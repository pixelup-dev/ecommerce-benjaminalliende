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
  import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de importar el modal
  import Cropper from "react-easy-crop";
  import { getCroppedImg } from "@/lib/cropImage";
  import imageCompression from "browser-image-compression";
  
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
  
  const NavbarbannerBO: React.FC = () => {
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
  
    const fetchBannerHome = async () => {
      try {
        setLoading(true);
        setSkeletonLoading(true);
        const token = getCookie("AdminTokenAuth");
        const bannerId = `${process.env.NEXT_PUBLIC_NAVBARBANNER_ID}`;
  
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
        const bannerId = `${process.env.NEXT_PUBLIC_NAVBARBANNER_ID}`;
  
        const dataToSend = {
          title: formData.title,
          landingText: formData.landingText,
          buttonLink: "medicaltrainer.cl",
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
  
        const bannerId = `${process.env.NEXT_PUBLIC_NAVBARBANNER_ID}`;
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
  
              <>
              <img
                src={mainImage || formData.mainImage.url}
                alt={formData.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10">
                <div className="container mx-auto px-6 h-full flex items-center">
                  <div className="max-w-2xl pl-6 xl:pl-0">
                    {/* <span className="text-white/90 text-lg mb-4 block font-light">
                      Encuentra el equilibrio que necesitas
                    </span> */}
                    <h1 className="text-4xl md:text-6xl font-light text-white mb-6 font-poppins ">
                      
                    {formData.title}
                    </h1> 
                    {/* Comienza tu camino hacia una vida saludable */}
                    <p className="text-xl text-white/80 mb-8">
                      {/* Encuentra tu equilibrio y bienestar a través de un
                      acompañamiento personalizado */}
                       {formData.landingText}
                    </p>
                    <button
                      className="bg-white text-[#4A6741] px-8 py-3 rounded-full hover:bg-white/90 transition duration-300 shadow-md hover:shadow-lg font-montserrat text-sm tracking-wider uppercase"
                    >
                      {/* Evaluación gratuita */}
                      {formData.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </>
  
  
  
  
  
  
  
  
  
  
  
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
              Texto <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              name="landingText"
              value={formData.landingText}
              onChange={handleChange}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Texto descriptivo"
            />
  
  
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
  
            <div>
              <input
                type="file"
                accept="image/*"
                id="mainImage"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {isMainImageUploaded ? (
                <div className="flex flex-col items-center mt-3 relative">
                  <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                    Tu fotografía{" "}
                    <span className="text-dark">{formData.mainImage.name}</span>{" "}
                    ya ha sido cargada.
                    <br /> Actualiza para ver los cambios.
                  </h4>
  
                  <button
                    type="button"
                    className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full text-xs mt-4"
                    onClick={handleClearImage}
                  >
                    <span className="self-center">Seleccionar otra Imagen</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-normal text-primary">
                    Foto <span className="text-primary">*</span>
                  </h3>
                  <label
                    htmlFor="mainImage"
                    className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed rounded-lg cursor-pointer w-full z-10"
                  >
                    <div className="flex flex-col justify-center items-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Subir Imagen</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG o Webp (1800x400px)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
  
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
  
        {/* Modal de recorte */}
        {isModalOpen && (
          <Modal
            showModal={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <div className="relative h-96 w-full">
              <Cropper
                image={mainImage || ""}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="w-full py-6">
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => {
                    setZoom(parseFloat(e.target.value));
                  }}
                  className="zoom-range w-full custom-range"
                />
              </div>
              <div className="flex justify-between w-full gap-2">
                <button
                  onClick={handleCrop}
                  className="bg-primary text-[13px] md:text-[16px] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Recortar y Subir
                </button>
                <button
                  onClick={() => {
                    setMainImage(null);
                    setIsMainImageUploaded(false);
                    setIsModalOpen(false);
                  }}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-[13px] md:text-[16px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </section>
    );
  };
  
  export default NavbarbannerBO;
  