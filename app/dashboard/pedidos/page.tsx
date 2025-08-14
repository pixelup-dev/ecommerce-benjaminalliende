"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { getCookie } from "cookies-next";
import { obtenerPedidos } from "@/app/utils/obtenerPedidos";
import Link from "next/link";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "@/components/common/Loader";
import * as XLSX from "xlsx";

type Pedido = {
  id: string;
  correlative: string;
  statusCode: string;
  creationDate: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
  };
  deliveryType: {
    code: string;
  };
  totals: {
    totalAmount: number;
  };
  internalStatusCode: string | null;
};

function PedidosBO() {
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const { setPedidos, pedidos } = useAPI();
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]); // Almacena todos los pedidos

  const [isMobile, setIsMobile] = useState(false);

  // Estados para verificación de plan PRO
  const [hasProPlan, setHasProPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");

  // Nuevos estados para el modal de exportación
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0], // Último mes por defecto
    endDate: new Date().toISOString().split("T")[0],
  });

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageNumber(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPageNumber(1);
  };

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const token = getCookie("AdminTokenAuth");
      const allData: Pedido[] = [];
      let pageNumber = 1;
      let data;

      do {
        data = await obtenerPedidos(pageNumber, 50, token); // Pagina de 50 en 50
        allData.push(...data.orders);
        pageNumber += 1;
      } while (data.orders.length > 0);

      setAllPedidos(allData);
      setTotalOrders(allData.length);
      setTotalPages(Math.ceil(allData.length / pageSize));
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
    setLoading(false);
  }, [pageSize]);

  useEffect(() => {
    fetchPedidos(); // Llama a la función cuando el componente se monta
    checkSubscriptionPlan();
  }, [fetchPedidos]);

  const checkSubscriptionPlan = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
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
      setCurrentPlan(planName);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
      setCurrentPlan("Error al verificar plan");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const paginatedPedidos = useMemo(() => {
    // Aplicar filtros y búsqueda
    const filtered = allPedidos.filter((pedido) => {
      const matchesStatus = statusFilter
        ? pedido.statusCode === statusFilter
        : true;
      const matchesSearch = searchTerm
        ? pedido.customer.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pedido.correlative.toString().includes(searchTerm) ||
          `${pedido.customer.firstname} ${pedido.customer.lastname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      const matchesPending = showPendingOnly
        ? pedido.internalStatusCode !== "COMPLETED"
        : true;
      const matchesCompleted = showCompletedOnly
        ? pedido.internalStatusCode === "COMPLETED"
        : true;
      return (
        matchesStatus && matchesSearch && matchesPending && matchesCompleted
      );
    });

    // Recalcular el total de páginas basado en los resultados filtrados
    setTotalPages(Math.ceil(filtered.length / pageSize));

    // Paginación
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [
    allPedidos,
    statusFilter,
    searchTerm,
    showPendingOnly,
    showCompletedOnly,
    pageNumber,
    pageSize,
  ]);

  useEffect(() => {
    setPedidos(paginatedPedidos);
  }, [paginatedPedidos, setPedidos]);

  const statusMap: { [key: string]: string } = {
    PAYMENT_PENDING: "Pendiente de pago",
    PAYMENT_COMPLETED: "Pagado",
    CREATED: "Creada",

  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
  };

  const handleCopyLink = async (orderId: string) => {
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/pago?orderId=${orderId}`;
    try {
      await navigator.clipboard.writeText(orderUrl);
      toast.success("URL de pago copiada al portapapeles");
    } catch (error) {
      toast.error("Error al copiar la URL de pago");
      console.error("Error al copiar la URL de pago:", error);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    currentStatus: string | null
  ) => {
    const token = getCookie("AdminTokenAuth");
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/orders/${orderId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          internalStatusCode: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPedidos();
      toast.success("Estado del pedido actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      toast.error("Error al actualizar el estado del pedido");
    }
  };

  const handleDeleteOrderClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalVisible(true);
  };

  const deleteOrder = async (orderId: string) => {
    const token = getCookie("AdminTokenAuth");

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/orders/${orderId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPedidos();
      toast.success("Orden eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
      toast.error("Error al eliminar la orden");
    }
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
    }
    setIsDeleteModalVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownVisible(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px es el breakpoint md de Tailwind
      setPageSize(window.innerWidth < 768 ? 4 : 20); // 4 items en mobile, 20 en desktop
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const renderPagination = () => {
    if (isMobile) {
      // En mobile, mostrar solo página actual, anterior y siguiente
      return (
        <ul className="inline-flex items-center space-x-1">
          <li>
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="flex items-center justify-center h-full py-2 px-4 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          </li>
          <li>
            <span className="flex items-center justify-center text-sm py-2 px-4 leading-tight text-gray-500 bg-white border border-gray-300">
              {pageNumber} / {totalPages}
            </span>
          </li>
          <li>
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="flex items-center justify-center h-full py-2 px-4 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </li>
        </ul>
      );
    }

    // Mantener el paginador actual para desktop
    return (
      <ul className="inline-flex items-center space-x-1">
        <li>
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex items-center justify-center h-full py-2 px-4 text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, page) => (
          <li key={page}>
            <button
              onClick={() => handlePageChange(page + 1)}
              className={`flex items-center justify-center text-sm py-2 px-4 leading-tight border ${
                pageNumber === page + 1
                  ? "text-primary bg-gray-200 "
                  : "text-gray-300 bg-white "
              } hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              {page + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className="flex items-center justify-center h-full py-2 px-4 text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </li>
      </ul>
    );
  };

  const handleExportDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExportDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportToExcel = async () => {
    try {
      setExportLoading(true);

      // Filtrar pedidos por rango de fechas
      const filteredPedidos = allPedidos.filter((pedido) => {
        const pedidoDate = new Date(pedido.creationDate)
          .toISOString()
          .split("T")[0];
        return (
          pedidoDate >= exportDateRange.startDate &&
          pedidoDate <= exportDateRange.endDate
        );
      });

      if (filteredPedidos.length === 0) {
        toast.error("No hay pedidos en el rango de fechas seleccionado");
        setExportLoading(false);
        return;
      }

      if (filteredPedidos.length > 5000) {
        toast.error(
          "El rango seleccionado contiene demasiados pedidos. Por favor, seleccione un rango más pequeño."
        );
        setExportLoading(false);
        return;
      }

      // Preparar los datos para Excel en chunks para mejor rendimiento
      const chunkSize = 1000;
      const dataToExport = [];

      for (let i = 0; i < filteredPedidos.length; i += chunkSize) {
        const chunk = filteredPedidos.slice(i, i + chunkSize).map((pedido) => ({
          "N° Pedido": pedido.correlative,
          Fecha: new Date(pedido.creationDate).toLocaleDateString("es-ES"),
          Cliente: `${pedido.customer.firstname} ${pedido.customer.lastname}`,
          Email: pedido.customer.email,
          "Tipo Delivery":
            pedido.deliveryType.code === "HOME_DELIVERY_WITHOUT_COURIER"
              ? "Delivery"
              : "Retiro en Tienda",
          Monto: new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(pedido.totals.totalAmount),
          "Estado Pago": statusMap[pedido.statusCode] || "Estado desconocido",
          "Estado Pedido":
            pedido.internalStatusCode === "COMPLETED"
              ? "Completado"
              : "En Proceso",
        }));
        dataToExport.push(...chunk);
      }

      // Crear el libro de trabajo y la hoja
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

      // Generar el archivo y descargarlo
      const fileName = `Pedidos_${exportDateRange.startDate}_a_${exportDateRange.endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(
        `Archivo Excel generado correctamente con ${filteredPedidos.length} pedidos`
      );
      setIsExportModalVisible(false);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("Error al generar el archivo Excel");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <title>Mis Pedidos</title>
      <section className="mx-2 md:mx-10 py-10">
        <Breadcrumb pageName="Mis Pedidos" />
        <div className="p-3 sm:p-5 relative">
          <div className="mx-auto">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden min-w-56 min-h-96">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="w-full md:w-1/2">
                  <form className="flex items-center">
                    <label
                      htmlFor="simple-search"
                      className="sr-only"
                    >
                      Search
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 text-gray-500 dark:text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="simple-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Busca por Email, Cliente o N° de Pedido"
                        required
                      />
                    </div>
                  </form>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                  <button
                    onClick={() => setIsExportModalVisible(true)}
                    className="flex items-center justify-center text-white bg-primary hover:bg-primary/80 focus:ring-4 focus:ring-primary/30 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary dark:hover:bg-primary/80 focus:outline-none dark:focus:ring-primary/30"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Exportar a Excel
                  </button>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <button
                        id="filterDropdownButton"
                        onClick={toggleFilterDropdown}
                        className="w-full sm:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        type="button"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            clipRule="evenodd"
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          />
                        </svg>
                        Filtro por Estado
                      </button>

                      <div
                        id="filterDropdown"
                        ref={filterDropdownRef}
                        className={`z-50 ${
                          filterDropdownVisible ? "block" : "hidden"
                        } absolute left-0 mt-2 w-48 p-3 bg-white rounded-lg shadow-lg dark:bg-gray-700`}
                      >
                        <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                          Filtrar por estado
                        </h6>
                        <ul
                          className="space-y-2 text-sm"
                          aria-labelledby="filterDropdownButton"
                        >
                          <li className="flex items-center">
                            <input
                              id="all"
                              type="checkbox"
                              checked={statusFilter === ""}
                              onChange={() => handleStatusFilterChange("")}
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="all"
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Todos
                            </label>
                          </li>
                          <li className="flex items-center">
                            <input
                              id="payment_completed"
                              type="checkbox"
                              checked={statusFilter === "PAYMENT_COMPLETED"}
                              onChange={() =>
                                handleStatusFilterChange("PAYMENT_COMPLETED")
                              }
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="payment_completed"
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Pagado
                            </label>
                          </li>
                          <li className="flex items-center">
                            <input
                              id="payment_pending"
                              type="checkbox"
                              checked={statusFilter === "PAYMENT_PENDING"}
                              onChange={() =>
                                handleStatusFilterChange("PAYMENT_PENDING")
                              }
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="payment_pending"
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Pendiente de pago
                            </label>
                          </li>
                          <li className="flex items-center">
                            <input
                              id="created"
                              type="checkbox"
                              checked={statusFilter === "CREATED"}
                              onChange={() =>
                                handleStatusFilterChange("CREATED")
                              }
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="created"
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Creada
                            </label>
                          </li>


                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          setShowPendingOnly(!showPendingOnly);
                          setShowCompletedOnly(false);
                          setPageNumber(1);
                        }}
                        className={`w-full sm:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium ${
                          showPendingOnly
                            ? "text-white bg-primary"
                            : "text-gray-900 bg-white"
                        } rounded-lg border ${
                          showPendingOnly
                            ? "border-primary-600 hover:bg-primary-700"
                            : "border-gray-200 hover:bg-gray-100"
                        } focus:z-10 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`}
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        En Proceso
                      </button>

                      <button
                        onClick={() => {
                          setShowCompletedOnly(!showCompletedOnly);
                          setShowPendingOnly(false);
                          setPageNumber(1);
                        }}
                        className={`w-full sm:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium ${
                          showCompletedOnly
                            ? "text-white bg-primary"
                            : "text-gray-900 bg-white"
                        } rounded-lg border ${
                          showCompletedOnly
                            ? "border-primary-600 hover:bg-primary-700"
                            : "border-gray-200 hover:bg-gray-100"
                        } focus:z-10 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`}
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Completados
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {/* Vista desktop */}
                    <table className="hidden md:table w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-3 min-w-10 text-center"
                          >
                            N°
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 max-w-16"
                          >
                            Fecha
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3"
                          >
                            Cliente
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 max-w-16 text-center"
                          >
                            Tipo Delivery
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 text-center"
                          >
                            Monto
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 text-center"
                          >
                            Estado Pago
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 text-center"
                          >
                            Pedido
                            <br /> Completado
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-3 text-center"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPedidos.map(
                          (pedido: Pedido, index: number) => (
                            <tr
                              key={index}
                              className="border-b dark:border-gray-700"
                            >
                              <td className="px-2 py-3 flex items-center justify-center align-middle text-center">
                                {pedido.correlative}
                              </td>
                              <td className="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white min-w-16">
                                {new Date(
                                  pedido.creationDate
                                ).toLocaleDateString("es-ES", {
                                  year: "2-digit",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </td>
                              <td className="px-2 py-3 max-w-20">
                                <div className="flex flex-col">
                                  <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
                                    {pedido.customer.firstname}{" "}
                                    {pedido.customer.lastname}
                                  </div>
                                  <div className="font-bold overflow-hidden whitespace-nowrap overflow-ellipsis">
                                    {pedido.customer.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-3 max-w-20 text-center">
                                {pedido.deliveryType.code ===
                                "HOME_DELIVERY_WITHOUT_COURIER"
                                  ? "Delivery"
                                  : "Retiro en Tienda"}
                              </td>
                              <td className="px-2 py-3 text-center">
                                {new Intl.NumberFormat("es-CL", {
                                  style: "currency",
                                  currency: "CLP",
                                }).format(pedido.totals.totalAmount)}
                              </td>
                              <td
                                className={`px-2 py-3 w-16 ${
                                  pedido.statusCode === "PAYMENT_COMPLETED"
                                    ? "text-green-600"
                                    : pedido.statusCode === "PAYMENT_PENDING"
                                    ? "text-yellow-600"
                                    : ""
                                }`}
                              >
                                {statusMap[pedido.statusCode] ||
                                  "Estado desconocido"}
                              </td>
                              <td className="px-2 py-3 text-center w-30">
                                <label className="inline-flex relative items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={
                                      pedido.internalStatusCode === "COMPLETED"
                                    }
                                    onChange={() =>
                                      updateOrderStatus(
                                        pedido.id,
                                        pedido.internalStatusCode
                                      )
                                    }
                                  />
                                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                </label>
                              </td>
                              <td className="px-2 py-3 flex items-center justify-center">
                                <div className="flex items-center pt-2 space-x-3.5 relative">
                                  <Link
                                    href={`/dashboard/pedidos/${pedido.id}`}
                                    className="relative group"
                                  >
                                    <svg
                                      className="fill-current hover:fill-primary"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 18 18"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                        fill=""
                                      />
                                      <path
                                        d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                        fill=""
                                      />
                                    </svg>
                                    <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 invisible group-hover:visible">
                                      Detalle Pedido
                                    </span>
                                  </Link>

                                  <button
                                    onClick={() => handleCopyLink(pedido.id)}
                                    disabled={
                                      pedido.statusCode === "PAYMENT_COMPLETED" || !hasProPlan
                                    }
                                    className={`focus:outline-none relative group ${
                                      pedido.statusCode === "PAYMENT_COMPLETED" || !hasProPlan
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="size-6"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                      />
                                    </svg>
                                    <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 invisible group-hover:visible">
                                      {hasProPlan ? "Copiar Link de Pago" : "Copiar Link de Pago exclusiva del Plan Pro"}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteOrderClick(pedido.id)
                                    }
                                    className="focus:outline-none relative group"
                                    data-tip
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-6 h-6 text-red-600 hover:text-red-800"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                    <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 invisible group-hover:visible">
                                      Eliminar Pedido
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    {/* Vista mobile */}
                    <div className="md:hidden">
                      {paginatedPedidos.map((pedido: Pedido, index: number) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-900 dark:text-white">
                              N° {pedido.correlative}
                            </span>
                            <span className="text-sm">
                              {new Date(pedido.creationDate).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "2-digit",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Cliente:
                              </p>
                              <p className="font-semibold">
                                {pedido.customer.firstname}{" "}
                                {pedido.customer.lastname}
                              </p>
                              <p className="text-sm">{pedido.customer.email}</p>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Delivery:
                                </p>
                                <p>
                                  {pedido.deliveryType.code ===
                                  "HOME_DELIVERY_WITHOUT_COURIER"
                                    ? "Delivery"
                                    : "Retiro en Tienda"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Monto:
                                </p>
                                <p className="font-semibold">
                                  {new Intl.NumberFormat("es-CL", {
                                    style: "currency",
                                    currency: "CLP",
                                  }).format(pedido.totals.totalAmount)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Estado Pago:
                                </p>
                                <p
                                  className={`${
                                    pedido.statusCode === "PAYMENT_COMPLETED"
                                      ? "text-green-600"
                                      : pedido.statusCode === "PAYMENT_PENDING"
                                      ? "text-yellow-600"
                                      : ""
                                  }`}
                                >
                                  {statusMap[pedido.statusCode] ||
                                    "Estado desconocido"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Pedido Completado:
                                </p>
                                <label className="inline-flex relative items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={
                                      pedido.internalStatusCode === "COMPLETED"
                                    }
                                    onChange={() =>
                                      updateOrderStatus(
                                        pedido.id,
                                        pedido.internalStatusCode
                                      )
                                    }
                                  />
                                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                </label>
                              </div>
                            </div>

                            <div className="flex flex-col xs:flex-row justify-center gap-2 xs:space-x-4 pt-3 border-t">
                              <Link
                                href={`/dashboard/pedidos/${pedido.id}`}
                                className="w-full xs:w-auto text-center text-gray-600 hover:text-primary flex items-center justify-center space-x-1 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                <span>Ver</span>
                              </Link>

                              <button
                                onClick={() => handleCopyLink(pedido.id)}
                                disabled={
                                  pedido.statusCode === "PAYMENT_COMPLETED" || !hasProPlan
                                }
                                className={`w-full xs:w-auto flex items-center justify-center space-x-1 py-2 px-4 rounded-lg border ${
                                  pedido.statusCode === "PAYMENT_COMPLETED" || !hasProPlan
                                    ? "opacity-50 cursor-not-allowed text-gray-400 border-gray-200"
                                    : "text-gray-600 hover:text-primary border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>{hasProPlan ? "Pago" : "Pago (PRO)"}</span>
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteOrderClick(pedido.id)
                                }
                                className="w-full xs:w-auto flex items-center justify-center space-x-1 py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <nav
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                aria-label="Table navigation"
              >
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Página{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pageNumber} de {totalPages}
                  </span>
                </span>
                {renderPagination()}
              </nav>
            </div>
          </div>
        </div>

        {isDeleteModalVisible && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar Pedido
                    </h3>
                    <div className="mt-2">
                      <p>¿Estás seguro de que deseas eliminar este pedido?</p>
                      <p className="text-sm text-red-500 uppercase mt-2">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse justify-between">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsDeleteModalVisible(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDeleteOrder}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exportación */}
        {isExportModalVisible && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Exportar Pedidos a Excel
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Selecciona el rango de fechas para exportar los pedidos
                        (máximo 5000 registros por archivo)
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fecha Inicio
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={exportDateRange.startDate}
                            onChange={handleExportDateChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fecha Fin
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={exportDateRange.endDate}
                            onChange={handleExportDateChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    onClick={exportToExcel}
                    disabled={exportLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      "Exportar"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExportModalVisible(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default PedidosBO;
