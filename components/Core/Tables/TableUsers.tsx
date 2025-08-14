/* eslint-disable @next/next/no-img-element */
"use client";
import { UserData } from "@/types/UserData";
import UserCanvas from "../Offcanvas/UserCanvas";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { obtenerUsuario } from "@/app/utils/obtenerUsuario";
import axios from "axios";
import { toast } from "react-hot-toast";

const TableUsers = () => {
  const token = String(getCookie("AdminTokenAuth"));

  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string>("");
  
  // Estados para verificación de plan
  const [hasProPlan, setHasProPlan] = useState(false);
  const [hasAvanzadoPlan, setHasAvanzadoPlan] = useState(false);
  const [hasInicialPlan, setHasInicialPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");

  const fetchData = async () => {
    try {
      const userData = await obtenerUsuario(token);
      // Filtrar el usuario Admin PixelUP
      const usuariosFiltrados = userData.users.filter(
        (user: UserData) => !(user.firstname === "Admin" && user.lastname === "PixelUP")
      );
      setUsuarios(usuariosFiltrados);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
    }
  };

  const getUserLimit = () => {
    if (hasProPlan) return Infinity; // Sin límite
    if (hasAvanzadoPlan) return 3;
    if (hasInicialPlan) return 1;
    return 0; // Sin suscripción
  };

  const canCreateUser = () => {
    const limit = getUserLimit();
    const currentUserCount = usuarios.length; // Ya está filtrado sin el admin
    return currentUserCount < limit;
  };

  const checkSubscriptionPlan = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Buscar suscripciones activas
      const activeSubscriptions = response.data.subscriptions.filter(
        (sub: any) => sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      // Verificar si tiene plan PRO
      const proSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("pro")
      );

      // Verificar si tiene plan Avanzado
      const avanzadoSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("avanzado")
      );

      // Verificar si tiene plan Inicial
      const inicialSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("inicia")
      );

      // Determinar el plan actual
      let planName = "Sin suscripción activa";
      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0]; // Tomar la primera suscripción activa
        if (subscription.name.toLowerCase().includes("pro")) {
          planName = "Plan PRO";
        } else if (subscription.name.toLowerCase().includes("avanzado")) {
          planName = "Plan Avanzado";
        } else if (subscription.name.toLowerCase().includes("inicia")) {
          planName = "Plan Inicia";
        } else {
          planName = subscription.name;
        }
      }

      setHasProPlan(!!proSubscription);
      setHasAvanzadoPlan(!!avanzadoSubscription);
      setHasInicialPlan(!!inicialSubscription);
      setCurrentPlan(planName);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
      setHasAvanzadoPlan(false);
      setHasInicialPlan(false);
      setCurrentPlan("Error al verificar plan");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Llamada inicial dentro del useEffect
    checkSubscriptionPlan();

    const handleEscKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowConfirmationModal(false); // Asegúrate de que setShowConfirmationModal esté definido
      }
    };

    document.addEventListener("keydown", handleEscKeyPress);

    return () => {
      document.removeEventListener("keydown", handleEscKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openConfirmationModal = (userId: string, userEmail: string) => {
    if (userEmail === "hola.pixelup@gmail.com") {
      toast.error("No se puede eliminar este usuario.");
      return;
    }
    setShowConfirmationModal(true);
    setUserIdToDelete(userId);
  };

  const handleDelete = async () => {
    if (usuarios.length <= 1) {
      alert("No se puede eliminar el último usuario.");
      setShowConfirmationModal(false);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users/${userIdToDelete}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        config
      );

      console.log("Usuario eliminado con éxito:", response.data);
      setUsuarios(usuarios.filter((user) => user.id !== userIdToDelete));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    } finally {
      setShowConfirmationModal(false);
    }
  };

  return (
    <>

      <div className="mr-6 flex items-center justify-end pr-16 lg:pr-0">
        
        <UserCanvas 
          fetchData={fetchData} 
          canCreateUser={canCreateUser()}
          currentPlan={currentPlan}
          userLimit={getUserLimit()}
          currentUserCount={usuarios.length}
        />
        
      </div>
      
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              {/* Información del plan y límite de usuarios */}
      {!subscriptionLoading && (
        <div className="mb-6">
            {/* Mensaje de recomendación */}
            <div className="border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Recomendación:</span> Si necesita ampliar la cantidad de administradores, le recomendamos mejorar su plan de suscripción.
                  </p>

                </div>
              </div>
            </div>
         
        </div>
      )}

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-dark text-left dark:bg-meta-4">
                <th
                  scope="col"
                  className="min-w-[60px] py-4 px-4 font-medium text-secondary dark:text-white xl:pl-11"
                >
                  Avatar
                </th>
                <th
                  scope="col"
                  className="min-w-[220px] py-4 px-4 font-medium text-secondary dark:text-white xl:pl-11"
                >
                  Nombre / Apellido
                </th>
                <th
                  scope="col"
                  className="min-w-[150px] py-4 px-4 font-medium text-secondary dark:text-white"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="py-4 px-4 font-medium text-secondary"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((userDetail, key) => (
                <tr
                  key={key}
                  className="animate-fade-in"
                >
                  <td className="border-b border-dark py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <span className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-300">
                      {userDetail.avatarUrl ? (
                        <img
                          width={112}
                          height={112}
                          src={userDetail.avatarUrl}
                          alt="Avatar"
                          className="rounded-full"
                        />
                      ) : (
                        <span className="h-12 w-12 rounded-full bg-gray-300"></span>
                      )}
                    </span>
                  </td>
                  <td className="border-b border-dark py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {userDetail.firstname}
                    </h5>
                    <p className="text-sm">{userDetail.lastname}</p>
                  </td>
                  <td className="border-b border-dark py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {userDetail.email}
                    </p>
                  </td>
                  <td className="border-b border-dark py-5 px-4 dark:border-strokedark">
                    {usuarios.length > 1 && (
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() =>
                            openConfirmationModal(
                              userDetail.id,
                              userDetail.email
                            )
                          }
                          className="hover:text-primary"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                              fill=""
                            />
                            <path
                              d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                              fill=""
                            />
                            <path
                              d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                              fill=""
                            />
                            <path
                              d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showConfirmationModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto bg-graydark/70 backdrop-blur-sm animate-blurred-fade-in animate-duration-400">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
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
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar eliminación
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar este usuario? Esta
                        acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableUsers;