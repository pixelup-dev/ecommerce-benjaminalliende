import React, { useEffect, useState } from "react";
import axios from "axios";
interface Commune {
  id: string;
  name: string;
  regionId: string;
}
interface Region {
  id: string;
  name: string;
}
interface Bodega {
  id: string;
  name: string;
  description: string;
  commune: Commune;
  alternativeCommuneId?: string;
  statusCode: string;
}
interface BodegasStarkenProps {
  token: string;
}
const BodegasStarken = ({ token }: BodegasStarkenProps) => {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [selectedBodegaId, setSelectedBodegaId] = useState<string | null>(null);
  const [selectedBodega, setSelectedBodega] = useState<Bodega | null>(null);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [alternativeRegion, setAlternativeRegion] = useState<string>("");
  const [alternativeCommunes, setAlternativeCommunes] = useState<Commune[]>([]);
  const [alternativeCommuneId, setAlternativeCommuneId] = useState<string>("");
  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBodegas(response.data.warehouses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bodegas", error);
        setLoading(false);
      }
    };
    const fetchRegions = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        setRegions(response.data.regions);
      } catch (error) {
        console.error("Error fetching regions", error);
      }
    };
    fetchBodegas();
    fetchRegions();
  }, [token]);
  const fetchCommunes = async (regionId: string, forAlternative = false) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions/${regionId}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      if (forAlternative) {
        setAlternativeCommunes(response.data.communes);
      } else {
        setCommunes(response.data.communes);
      }
    } catch (error) {
      console.error("Error fetching communes", error);
    }
  };
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCommune(""); // Reinicia la comuna cuando se selecciona una nueva región
    if (regionId) {
      fetchCommunes(regionId); // Fetch de las comunas para la región seleccionada
    }
  };
  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommune(e.target.value);
  };
  const handleAlternativeRegionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const regionId = e.target.value;
    setAlternativeRegion(regionId);
    setAlternativeCommuneId(""); // Reinicia la comuna alternativa cuando se selecciona una nueva región
    if (regionId) {
      fetchCommunes(regionId, true); // Fetch de comunas para la región alternativa
    }
  };
  const handleAlternativeCommuneChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAlternativeCommuneId(e.target.value);
  };
  const fetchBodegaDetail = async (id: string) => {
    setSelectedBodegaId(id);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedBodega(response.data.warehouse);
      setSelectedRegion(response.data.warehouse.commune.regionId); // Setea la región actual
      fetchCommunes(response.data.warehouse.commune.regionId); // Fetch de comunas para la región actual
    } catch (error) {
      console.error("Error fetching bodega details", error);
    }
  };
  const handleSaveClick = async () => {
    if (!selectedBodega) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses/${selectedBodega.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          name: selectedBodega.name,
          description: selectedBodega.description,
          statusCode: selectedBodega.statusCode,
          communeId: selectedCommune || selectedBodega.commune.id, // Se envía la comuna actual o la seleccionada
          alternativeCommuneId: alternativeCommuneId || undefined, // Si hay comuna alternativa seleccionada
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Bodega actualizada con éxito");
    } catch (error) {
      console.error("Error updating bodega", error);
      alert("Error al actualizar la bodega");
    }
  };
  if (loading) {
    return <div>Cargando bodegas...</div>;
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Bodegas Starken
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista de Bodegas */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Lista de Bodegas</h2>
          <div className="space-y-3">
            {bodegas.map((bodega) => (
              <div
                key={bodega.id}
                className={`p-4 rounded-lg transition-all duration-200 cursor-pointer
                  ${selectedBodegaId === bodega.id 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                onClick={() => fetchBodegaDetail(bodega.id)}
              >
                <h3 className="text-lg font-medium text-gray-800">{bodega.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{bodega.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de Edición */}
        {selectedBodega && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
              Editar Bodega
            </h2>
            
            <div className="space-y-6">
              {/* Campos de texto */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={selectedBodega.name}
                    onChange={(e) =>
                      setSelectedBodega({ ...selectedBodega, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={selectedBodega.description}
                    onChange={(e) =>
                      setSelectedBodega({
                        ...selectedBodega,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Selección de Comuna Actual */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">Comuna Actual</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Región
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={handleRegionChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Seleccionar Región</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Comuna
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={handleCommuneChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    disabled={!selectedRegion}
                  >
                    <option value="">Seleccionar Comuna</option>
                    {communes.map((commune) => (
                      <option key={commune.id} value={commune.id}>
                        {commune.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selección de Comuna Alternativa */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">Comuna Alternativa</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Región
                  </label>
                  <select
                    value={alternativeRegion}
                    onChange={handleAlternativeRegionChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Seleccionar Región</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Comuna
                  </label>
                  <select
                    value={alternativeCommuneId}
                    onChange={handleAlternativeCommuneChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    disabled={!alternativeRegion}
                  >
                    <option value="">Seleccionar Comuna</option>
                    {alternativeCommunes.map((commune) => (
                      <option key={commune.id} value={commune.id}>
                        {commune.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveClick}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BodegasStarken;