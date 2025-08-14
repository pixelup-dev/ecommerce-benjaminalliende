"use client";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState, useRef } from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { obtenerZonasRepartosBO } from "@/app/utils/obtenerZonasRepartosBO";
import { getCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import FreeShippingOption from "./FreeShippingOption";
import LoaderProgress from "@/components/common/LoaderProgress";

interface Zone {
  id: string;
  name: string;
  description: string;
  amount: number;
  communes: any[];
}
interface ZoneData {
  id: string | null;
  currencyCodeId: string;
  name: string;
  description: string;
  amount: number | null; // Aquí permitimos que amount sea null
  statusCode: string;
  communes: { id: string; name: string }[];
}

interface Region {
  id: string;
  name: string;
}

interface Commune {
  id: string;
  name: string;
}

interface CommuneWithRegion extends Commune {
  regionId: string;
  regionName: string;
}

function ZonasRepartos() {
  const endOfPageRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const ZonasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [zonas, setZonas] = useState<Zone[]>([]);
  const { addToCartHandler, products, setProducts } = useAPI();
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedCommunes, setSelectedCommunes] = useState<CommuneWithRegion[]>(
    []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [communesToDelete, setCommunesToDelete] = useState<string[]>([]);
  const [isDeleteCommunesModalVisible, setIsDeleteCommunesModalVisible] =
    useState(false);
  const [zoneData, setZoneData] = useState<ZoneData>({
    id: null,
    currencyCodeId: "",
    name: "",
    description: "",
    amount: null, // Inicializamos amount como null
    statusCode: "ACTIVE",
    communes: [],
  });
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});
  const [isLoadingAllRegions, setIsLoadingAllRegions] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showDeleteModal = (zoneId: any) => {
    setZoneToDelete(zoneId);
    setIsDeleteModalVisible(true);
  };

  // Ocultar el modal de confirmación
  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setZoneToDelete(null);
  };

  // Confirmar y eliminar la zona
  const confirmDeleteZone = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/shipping-zones/${zoneToDelete}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Zona eliminada exitosamente.");
      // Actualizar el estado o recargar las zonas
      fetchZonas();
      hideDeleteModal();
    } catch (error) {
      toast.error("Error al eliminar la zona.");
      hideDeleteModal();
    }
  };

  useEffect(() => {
    if (selectedCommunes.length > 0) {
      endOfPageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedCommunes]);
  useEffect(() => {
    const fetchCurrencyCode = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const currencyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const currencyCodeId = currencyResponse.data.currencyCodes[0].id;
        setZoneData((prevData) => ({
          ...prevData,
          currencyCodeId: currencyCodeId,
        }));
      } catch (error) {
        console.error("Error fetching currency code:", error);
        toast.error("Error al obtener el código de moneda.");
      }
    };

    fetchCurrencyCode();
  }, []);

  const updateZoneInBatches = async (zoneId: string, communes: CommuneWithRegion[], token: string | undefined, currencyCodeId: string) => {
    if (!token) {
      toast.error("No se encontró el token de autenticación");
      return false;
    }
    
    try {
      // Enviar todas las comunas en una sola solicitud
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/shipping-zones/${zoneId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          id: zoneId,
          currencyCodeId: currencyCodeId,
          name: zoneData.name,
          description: zoneData.description,
          amount: zoneData.amount !== null && zoneData.amount !== undefined
            ? parseInt(zoneData.amount.toString())
            : 0,
          statusCode: zoneData.statusCode,
          communes: communes.map((commune) => ({ id: commune.id })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error al actualizar la zona:", error);
      return false;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingProgress({ current: 0, total: 100 });

    // Validación básica
    if (!zoneData.name) {
      toast.error("El nombre de la zona es obligatorio.");
      setIsSubmitting(false);
      return;
    }
    if (!zoneData.description) {
      toast.error("La descripción de la zona es obligatoria.");
      setIsSubmitting(false);
      return;
    }
    if (
      zoneData.amount !== null &&
      zoneData.amount !== undefined &&
      zoneData.amount <= 1
    ) {
      toast.error("El costo de despacho debe ser mayor que 1.");
      setIsSubmitting(false);
      return;
    }
    if (selectedCommunes.length === 0) {
      toast.error("Debe agregar al menos una comuna.");
      setIsSubmitting(false);
      return;
    }

    try {
      setLoadingProgress({ current: 20, total: 100 });
      const token = getCookie("AdminTokenAuth");

      // Obtener todas las zonas existentes
      const existingZonesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/shipping-zones?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLoadingProgress({ current: 40, total: 100 });
      const existingZones = existingZonesResponse.data.shippingZones;

      // Comprobar si alguna comuna ya está asignada en otra zona
      const communesInOtherZones = selectedCommunes.filter((commune) =>
        existingZones.some(
          (zone: any) =>
            zone.id !== zoneData.id &&
            zone.communes.some(
              (existingCommune: any) => existingCommune.id === commune.id
            )
        )
      );

      if (communesInOtherZones.length > 0) {
        const communeNames = communesInOtherZones
          .map((commune) => commune.name)
          .join(", ");
        toast.error(
          `Las siguientes comunas ya tienen un precio asignado: ${communeNames}`
        );
        setIsSubmitting(false);
        return;
      }

      setLoadingProgress({ current: 60, total: 100 });
      const currencyResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const currencyCodeId = currencyResponse.data.currencyCodes[0].id;
      setZoneData((prevData) => ({
        ...prevData,
        currencyCodeId: currencyCodeId,
      }));

      setLoadingProgress({ current: 80, total: 100 });
      if (isEditing) {
        const success = await updateZoneInBatches(zoneData.id!, selectedCommunes, token, currencyCodeId);
        if (success) {
          toast.success("Zona actualizada exitosamente.");
        } else {
          toast.error("Error al actualizar la zona. Por favor, intente nuevamente.");
          setIsSubmitting(false);
          return;
        }
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/shipping-zones?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              currencyCodeId: currencyCodeId,
              name: zoneData.name,
              description: zoneData.description,
              amount: zoneData.amount !== null && zoneData.amount !== undefined
                ? parseInt(zoneData.amount.toString())
                : 0,
              statusCode: zoneData.statusCode,
              communes: selectedCommunes.map((commune) => ({ id: commune.id })),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          toast.success("Zona creada exitosamente.");
        } catch (error) {
          console.error("Error al crear la zona:", error);
          toast.error("Error al crear la zona. Por favor, intente nuevamente.");
          setIsSubmitting(false);
          return;
        }
      }

      setLoadingProgress({ current: 100, total: 100 });
      fetchZonas();
      ZonasRef.current?.scrollIntoView({ behavior: "smooth" });
      setIsEditing(false);
      setZoneData({
        id: null,
        currencyCodeId: "",
        name: "",
        description: "",
        amount: 0,
        statusCode: "ACTIVE",
        communes: [],
      });

      setSelectedCommunes([]);
      setSelectedRegion("");
      setSelectedCommune("");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error(
          "Una o más comunas o regiones ya tienen asignado un valor de despacho."
        );
      } else {
        console.error(
          "Error al",
          isEditing ? "actualizar" : "crear",
          "la zona:",
          error
        );
        toast.error(
          "Error al " + (isEditing ? "actualizar" : "crear") + " la zona."
        );
      }
    } finally {
      setIsSubmitting(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  const fetchZonas = async () => {
    try {
      const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const PageNumber = 1;
      const PageSize = 50;

      const token = getCookie("AdminTokenAuth");

      const data = await obtenerZonasRepartosBO(PageNumber, PageSize, token);
      setZonas(data.shippingZones);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error as Error);
      toast.error("Error al obtener las zonas de reparto.");
    }
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
      toast.error("Error al obtener las regiones.");
    }
  };

  const fetchCommunes = async (regionId: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const Pais = "CL";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/countries/${Pais}/regions/${regionId}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCommunes(response.data.communes);
    } catch (error) {
      console.error("Error fetching communes:", error);
      toast.error("Error al obtener las comunas.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setZoneData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  const addCommune = () => {
    if (selectedCommune) {
      if (selectedCommunes.length >= 200) {
        toast.error("Has alcanzado el límite máximo de 200 comunas.");
        return;
      }
      const selectedCommuneObj = communes.find(
        (commune) => commune.id === selectedCommune
      );
      const selectedRegionObj = regions.find(
        (region) => region.id === selectedRegion
      );
      if (selectedCommuneObj && selectedRegionObj) {
        const isCommuneAlreadySelected = selectedCommunes.some(
          (c) => c.id === selectedCommuneObj.id
        );
        if (!isCommuneAlreadySelected) {
          const communeWithRegion: CommuneWithRegion = {
            id: selectedCommuneObj.id,
            name: selectedCommuneObj.name,
            regionId: selectedRegionObj.id,
            regionName: selectedRegionObj.name,
          };
          setSelectedCommunes((prevCommunes) => [
            ...prevCommunes,
            communeWithRegion,
          ]);
        }
      }
    }
    toast.success("Comuna agregada exitosamente.");
  };

  const removeCommune = (communeId: string) => {
    setSelectedCommunes((prevCommunes) =>
      prevCommunes.filter((commune) => commune.id !== communeId)
    );
  };
  const addAllCommunes = () => {
    if (communes.length > 0) {
      const selectedRegionObj = regions.find(
        (region) => region.id === selectedRegion
      );

      if (selectedRegionObj) {
        const newCommunes: CommuneWithRegion[] = communes
          .filter(
            (commune) =>
              !selectedCommunes.some(
                (selectedCommune) => selectedCommune.id === commune.id
              )
          )
          .map((commune) => ({
            id: commune.id,
            name: commune.name,
            regionId: selectedRegionObj.id,
            regionName: selectedRegionObj.name,
          }));

        if (newCommunes.length > 0) {
          const totalCommunesAfterAdd = selectedCommunes.length + newCommunes.length;
          if (totalCommunesAfterAdd > 200) {
            const remainingSlots = 200 - selectedCommunes.length;
            if (remainingSlots > 0) {
              const communesToAdd = newCommunes.slice(0, remainingSlots);
              setSelectedCommunes((prevCommunes) => [
                ...prevCommunes,
                ...communesToAdd,
              ]);
              toast.success(`Se han agregado ${remainingSlots} comunas de la región. Has alcanzado el límite máximo de 200 comunas.`);
            } else {
              toast.error("Has alcanzado el límite máximo de 200 comunas.");
            }
          } else {
            setSelectedCommunes((prevCommunes) => [
              ...prevCommunes,
              ...newCommunes,
            ]);
            toast.success("Todas las comunas de la región han sido agregadas.");
          }
        } else {
          toast.error(
            "Todas las comunas de esta región ya han sido seleccionadas."
          );
        }
      }
    } else {
      toast.error("No hay comunas para agregar en esta región.");
    }
  };

  const processBatch = async (regions: Region[], startIndex: number, batchSize: number) => {
    const endIndex = Math.min(startIndex + batchSize, regions.length);
    const batch = regions.slice(startIndex, endIndex);
    
    const batchPromises = batch.map(async (region) => {
      try {
        const communesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/countries/CL/regions/${region.id}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${getCookie("AdminTokenAuth")}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        return communesResponse.data.communes.map((commune: any) => ({
          id: commune.id,
          name: commune.name,
          regionId: region.id,
          regionName: region.name,
        }));
      } catch (error) {
        console.error(`Error al cargar comunas de la región ${region.name}:`, error);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);
    return batchResults.flat();
  };

  const addAllRegions = async () => {
    setIsLoadingAllRegions(true);
    setLoadingProgress({ current: 0, total: regions.length });
    
    try {
      const BATCH_SIZE = 3; // Procesar 3 regiones a la vez
      const allCommunes: CommuneWithRegion[] = [];
      
      for (let i = 0; i < regions.length; i += BATCH_SIZE) {
        const batchCommunes = await processBatch(regions, i, BATCH_SIZE);
        allCommunes.push(...batchCommunes);
        setLoadingProgress(prev => ({ ...prev, current: Math.min(i + BATCH_SIZE, regions.length) }));
        
        // Pequeña pausa entre lotes para no sobrecargar la API
        if (i + BATCH_SIZE < regions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Filtrar comunas que ya están seleccionadas
      const newCommunes = allCommunes.filter(
        commune => !selectedCommunes.some(selected => selected.id === commune.id)
      );

      if (newCommunes.length > 0) {
        const totalCommunesAfterAdd = selectedCommunes.length + newCommunes.length;
        if (totalCommunesAfterAdd > 200) {
          const remainingSlots = 200 - selectedCommunes.length;
          if (remainingSlots > 0) {
            const communesToAdd = newCommunes.slice(0, remainingSlots);
            setSelectedCommunes(prev => [...prev, ...communesToAdd]);
            toast.success(`Se han agregado ${remainingSlots} comunas. Has alcanzado el límite máximo de 200 comunas.`);
          } else {
            toast.error("Has alcanzado el límite máximo de 200 comunas.");
          }
        } else {
          setSelectedCommunes(prev => [...prev, ...newCommunes]);
          toast.success("Todas las regiones han sido agregadas exitosamente.");
        }
      } else {
        toast.error("Todas las comunas ya han sido seleccionadas.");
      }
    } catch (error) {
      console.error("Error al cargar todas las regiones:", error);
      toast.error("Error al cargar todas las regiones.");
    } finally {
      setIsLoadingAllRegions(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchRegions();
      await fetchZonas();
    };

    fetchInitialData();
  }, []);

  const handleEdit = async (zone: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const currencyResponse = await axios.get<{
        currencyCodes: { id: string }[];
      }>(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const currencyCodeId = currencyResponse.data.currencyCodes[0].id;

      // Crear el array de comunas con la información de región que ya viene en la respuesta
      const communesWithRegions: CommuneWithRegion[] = zone.communes.map(
        (commune: any) => ({
          id: commune.id,
          name: commune.name,
          regionId: commune.region.id,
          regionName: commune.region.name,
        })
      );

      setIsEditing(true);
      productsRef.current?.scrollIntoView({ behavior: "smooth" });
      setZoneData({
        id: zone.id,
        currencyCodeId: currencyCodeId,
        name: zone.name,
        description: zone.description,
        amount: zone.amount,
        statusCode: zone.statusCode,
        communes: zone.communes,
      });
      setSelectedCommunes(communesWithRegions);
    } catch (error) {
      console.error("Error editing zone:", error);
      toast.error("Error al editar la zona.");
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/shipping-zones/${zoneId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Zona eliminada:", response.data);
      fetchZonas();
      setIsEditing(false);
      setZoneData({
        id: null,
        currencyCodeId: "",
        name: "",
        description: "",
        amount: 0,
        statusCode: "ACTIVE",
        communes: [],
      });
      setSelectedCommunes([]);
      setSelectedRegion("");
      toast.success("Zona eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar la zona:", error);
      toast.error("Error al eliminar la zona.");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remover ceros iniciales y validar que solo se ingresen números
    const cleanValue = value.replace(/^0+/, "").replace(/\D/g, "");

    setZoneData((prevData) => ({
      ...prevData,
      amount: cleanValue ? parseInt(cleanValue) : null,
    }));
  };
  const removeAllCommunes = () => {
    if (selectedCommunes.length > 0) {
      setSelectedCommunes([]);
      toast.success("Todas las comunas han sido eliminadas.");
    } else {
      toast.error("No hay comunas seleccionadas para eliminar.");
    }
  };

  const removeSelectedCommunes = () => {
    if (communesToDelete.length > 0) {
      setSelectedCommunes((prevCommunes) =>
        prevCommunes.filter((commune) => !communesToDelete.includes(commune.id))
      );
      setCommunesToDelete([]);
      setIsDeleteCommunesModalVisible(false);
      toast.success("Comunas seleccionadas eliminadas exitosamente.");
    }
  };

  const handleCheckboxChange = (communeId: string) => {
    setCommunesToDelete((prev) => {
      if (prev.includes(communeId)) {
        return prev.filter((id) => id !== communeId);
      } else {
        return [...prev, communeId];
      }
    });
  };

  const handleSelectAllCommunesInRegion = (regionName: string) => {
    const regionCommunes = selectedCommunes.filter(commune => commune.regionName === regionName);
    const allSelected = regionCommunes.every(commune => communesToDelete.includes(commune.id));
    
    if (allSelected) {
      // Si todas están seleccionadas, deseleccionar todas las de esta región
      setCommunesToDelete(prev => prev.filter(id => 
        !regionCommunes.some(commune => commune.id === id)
      ));
    } else {
      // Si no están todas seleccionadas, seleccionar todas las de esta región
      const newSelected = new Set([...communesToDelete]);
      regionCommunes.forEach(commune => newSelected.add(commune.id));
      setCommunesToDelete(Array.from(newSelected));
    }
  };

  const handleSelectAll = () => {
    const allSelected = selectedCommunes.every(commune => communesToDelete.includes(commune.id));
    
    if (allSelected) {
      // Si todas están seleccionadas, deseleccionar todas
      setCommunesToDelete([]);
    } else {
      // Si no están todas seleccionadas, seleccionar todas
      setCommunesToDelete(selectedCommunes.map(commune => commune.id));
    }
  };

  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  const groupedCommunes = selectedCommunes.reduce((acc, commune) => {
    if (!acc[commune.regionName]) {
      acc[commune.regionName] = [];
    }
    acc[commune.regionName].push(commune);
    return acc;
  }, {} as { [key: string]: CommuneWithRegion[] });

  return (
    <>
      <title>Zonas de Repartos</title>
      <section className="p-10">
        <FreeShippingOption />
        <div className="shadow-md  rounded-lg p-4 bg-white my-6 overflow-x-auto">
          <div
            ref={ZonasRef}
            className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 "
          >
            <div>Zonas Activas</div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Comunas
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Editar / Eliminar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zonas.map((zone) => (
                <tr key={zone.id}>
                  <td className="px-6 py-4 md:whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.name}</div>
                  </td>
                  <td className="px-6 py-4 md:whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      {zone.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 md:whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${zone.amount.toLocaleString("es-CL")}
                    </div>
                  </td>
                  <td className="px-2 py-4 md:whitespace-normal max-w-xs break-words">
                    <div className="text-sm text-gray-900">
                      {zone.communes
                        .slice(0, 10)
                        .map((commune) => commune.name)
                        .join(", ")}
                      {zone.communes.length > 10 && ", ..."}
                    </div>
                  </td>

                  <td className="px-6 py-4 md:whitespace-nowrap flex flex-col md:flex-row gap-2 items-center justify-center">
                    {[
                      {
                        onClick: () => handleEdit(zone),
                        bgColor: "bg-primary",
                        hoverColor: "hover:bg-secondary",
                        textColor: "text-secondary",
                        hoverTextColor: "hover:text-primary",
                        svgPath:
                          "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
                      },
                      {
                        onClick: () => showDeleteModal(zone.id),
                        bgColor: "bg-red-500",
                        hoverColor: "hover:bg-red-700",
                        textColor: "text-white",
                        hoverTextColor: "hover:text-white",
                        svgPath:
                          "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
                      },
                    ].map((button, index) => (
                      <button
                        key={index}
                        onClick={button.onClick}
                        className={`${button.bgColor} ${button.hoverColor} ${button.textColor} ${button.hoverTextColor} font-bold py-2 px-4 rounded flex items-center justify-center w-full md:w-auto`}
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
                            d={button.svgPath}
                          />
                        </svg>
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          ref={productsRef}
          className="shadow-md  rounded-lg p-4 bg-white my-6"
        >
          <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 ">
            <div>
              {isEditing ? "Editar Zona de Reparto" : "Crear Zona de Reparto"}
            </div>
          </div>
          <div>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setZoneData({
                    id: null,
                    currencyCodeId: "",
                    name: "",
                    description: "",
                    amount: 0,
                    statusCode: "ACTIVE",
                    communes: [],
                  });
                  setSelectedCommunes([]);
                }}
                className="bg-red-500 hover:bg-red-700 w-full uppercase text-white   font-bold py-2 px-4 rounded flex-wrap mt-4"
              >
                Cancelar Edición
              </button>
            )}
          </div>
          <div>
            <label className="block mt-4">
              <h4 className="font-normal text-primary">
                Nombre Zona<span className="text-primary">*</span>
              </h4>
              <input
                type="text"
                id="ZoneName"
                name="name"
                onChange={handleChange}
                value={zoneData.name}
                placeholder="Ingresa nombre de nueva Zona...."
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              />
            </label>
            <label className="block mt-4">
              <h3 className="font-normal text-primary">
                Descripción zona <span className="text-primary">*</span>
              </h3>
              <textarea
                id="ZoneDescription"
                name="description"
                value={zoneData.description}
                onChange={handleChange}
                placeholder="Ingresa descripción de nueva Zona...."
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              ></textarea>
            </label>

            <div
              style={{ borderRadius: "var(--radius)" }}
              className="shadow flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
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
                <span className="font-semibold">Costo de despacho.</span> El
                costo de despacho es para la zona a crear.
              </div>
            </div>

            <label className="block mt-4">
              <h3 className="font-normal text-primary">
                Costo de despacho <span className="text-primary">*</span>
              </h3>
              {/*             <input
              type="number"
              id="ZoneAmount"
              name="amount"
              value={zoneData.amount}
              onChange={handleChange}
              placeholder="Ingresa Precio de nueva Zona...."
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
            /> */}
              <input
                type="text"
                id="ZoneAmount"
                name="amount"
                value={zoneData.amount === null ? "" : zoneData.amount}
                onChange={handleAmountChange}
                placeholder="Ingresa Precio de nueva Zona...."
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                pattern="\d*"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              htmlFor="region"
              className="block mt-4"
            >
              <h3 className="font-normal text-primary">
                Región <span className="text-primary">*</span>
              </h3>
              <select
                id="region"
                value={selectedRegion}
                onChange={(event) => {
                  handleRegionChange(event);
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option>Selecciona Región</option>
                {regions.map((region: any) => (
                  <option
                    key={region.id}
                    value={region.id}
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor="commune"
              className="block mt-4"
            >
              <h3 className="font-normal text-primary">
                Comuna <span className="text-primary">*</span>
              </h3>
              <select
                id="commune"
                value={selectedCommune}
                onChange={(event) => {
                  handleCommuneChange(event);
                }}
                disabled={!selectedRegion}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option>Selecciona Comuna</option>
                {communes.map((commune: any) => (
                  <option
                    key={commune.id}
                    value={commune.id}
                  >
                    {commune.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <button
              onClick={addCommune}
              className="shadow bg-primary hover:bg-secondary uppercase text-secondary hover:text-primary font-bold py-2 px-4 w-full"
              style={{ borderRadius: "var(--radius)" }}
            >
              Agregar Comuna
            </button>
            <button
              onClick={addAllCommunes}
              className="shadow bg-primary hover:bg-secondary uppercase text-secondary hover:text-primary font-bold py-2 px-4 w-full"
              style={{ borderRadius: "var(--radius)" }}
            >
              Agregar Todas las Comunas de la Región
            </button>
            <button
              onClick={addAllRegions}
              disabled={isLoadingAllRegions}
              className={`shadow bg-primary hover:bg-secondary uppercase text-secondary hover:text-primary font-bold py-2 px-4 w-full flex items-center justify-center ${
                isLoadingAllRegions ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              {isLoadingAllRegions ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando regiones...
                </>
              ) : (
                'Agregar Todas las Regiones'
              )}
            </button>
          </div>

          <div className="mt-4">
            <div className="text-sm flex gap-2 font-medium border-b py-2 mb-6 ">
              <h3 className="font-normal text-primary">
                Comunas Seleccionadas: {selectedCommunes.length}/200
              </h3>
            </div>
            {selectedCommunes.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsDeleteCommunesModalVisible(true)}
                  disabled={communesToDelete.length === 0}
                  className={`shadow ${
                    communesToDelete.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-700"
                  } uppercase text-white font-bold py-2 px-4`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Eliminar Comunas Seleccionadas ({communesToDelete.length})
                </button>
                <button
                  onClick={handleSelectAll}
                  className="shadow bg-primary hover:bg-secondary uppercase text-secondary hover:text-primary font-bold py-2 px-4"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {selectedCommunes.every(commune => communesToDelete.includes(commune.id)) 
                    ? "Deseleccionar Todas" 
                    : "Seleccionar Todas"}
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Seleccionar
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Región
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Comuna
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedCommunes).map(([regionName, communes]) => (
                    <React.Fragment key={regionName}>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-2">
                          <input
                            type="checkbox"
                            checked={communes.every(commune => communesToDelete.includes(commune.id))}
                            onChange={() => handleSelectAllCommunesInRegion(regionName)}
                            className="h-4 w-4 text-primary border-gray-300 rounded"
                          />
                        </td>
                        <td 
                          colSpan={3}
                          className="px-6 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleRegion(regionName)}
                        >
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{regionName}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({communes.length} comunas)
                            </span>
                            <svg
                              className={`ml-2 h-5 w-5 transform transition-transform ${
                                expandedRegions[regionName] ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </td>
                      </tr>
                      {expandedRegions[regionName] && communes.map((commune) => (
                        <tr key={commune.id} className="bg-white">
                          <td className="px-6 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={communesToDelete.includes(commune.id)}
                              onChange={() => handleCheckboxChange(commune.id)}
                              className="h-4 w-4 text-primary border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            {commune.regionName}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {commune.name}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setCommunesToDelete([commune.id]);
                                setIsDeleteCommunesModalVisible(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              {isSubmitting ? (
                <div className="w-full">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? "Actualizando Zona..." : "Creando Zona..."}
                  </div>
                </div>
              ) : (
                isEditing ? "Actualizar Zona" : "Crear Zona"
              )}
            </button>
          </div>
        </div>
        {/* Modal de confirmación de eliminación */}
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
                      Eliminar Cupón
                    </h3>
                    <div className="mt-2">
                      <p>¿Estás seguro de que deseas eliminar este cupón?</p>
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
                    onClick={hideDeleteModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDeleteZone}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación para eliminar comunas */}
        {isDeleteCommunesModalVisible && (
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
                      Eliminar Comunas
                    </h3>
                    <div className="mt-2">
                      <p>
                        ¿Estás seguro de que deseas eliminar{" "}
                        {communesToDelete.length === 1
                          ? "esta comuna"
                          : `estas ${communesToDelete.length} comunas`}
                        ?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Las comunas seleccionadas serán eliminadas de la lista.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse justify-between">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsDeleteCommunesModalVisible(false);
                      setCommunesToDelete([]);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={removeSelectedCommunes}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfPageRef} />
      </section>
      {isSubmitting && <LoaderProgress message={isEditing ? "Actualizando zona..." : "Creando zona..."} />}
      {isLoadingAllRegions && <LoaderProgress message="Cargando regiones..." />}
    </>
  );
}

export default ZonasRepartos;
