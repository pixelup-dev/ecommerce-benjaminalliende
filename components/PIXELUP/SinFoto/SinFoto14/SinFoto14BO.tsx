"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import { Plus, X, Check, Loader2, Package, Search } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import Loader from "@/components/common/Loader-t";

interface Option {
  id: string;
  text: string;
  price: string;
  icon: string;
}

interface ContentData {
  title1: string;
  title2: string;
  options1: Option[];
  options2: Option[];
  note: string;
}

const SinFoto14BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO14_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<ContentData>({
    title1: "",
    title2: "",
    options1: [],
    options2: [],
    note: ""
  });

  const [newOption, setNewOption] = useState<Omit<Option, 'id'>>({
    text: "",
    price: "",
    icon: "Package"
  });

  // Lista de iconos comunes
  const commonIcons = [
    "Package", "Box", "ShoppingBag", "ShoppingCart", "Store", "Tag", "Tags",
    "Gift", "Heart", "Star", "Award", "Medal", "Trophy", "Crown", "Gem",
    "Diamond", "Coins", "CreditCard", "Wallet", "Banknote", "DollarSign",
    "Euro", "Pound", "Yen", "Percent", "TrendingUp", "TrendingDown",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Check", "X",
    "Plus", "Minus", "Divide", "Multiply", "Equals", "Infinity", "Percent",
    "Hash", "AtSign", "Asterisk", "AlertCircle", "AlertTriangle", "Info",
    "HelpCircle", "QuestionMark", "CheckCircle", "XCircle", "MinusCircle",
    "PlusCircle", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
    "Star", "Heart", "Diamond", "Spade", "Club", "Flower", "Leaf",
    "Tree", "Plant", "Zap", "Shield"
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0 && response.data.contentBlock) {
        try {
          const parsedData = JSON.parse(response.data.contentBlock.contentText);
          setFormData({
            title1: parsedData.title1 || "",
            title2: parsedData.title2 || "",
            options1: Array.isArray(parsedData.options1) ? parsedData.options1 : [],
            options2: Array.isArray(parsedData.options2) ? parsedData.options2 : [],
            note: parsedData.note || ""
          });
        } catch (error) {
          console.error("Error al parsear JSON:", error);
          setFormData({
            title1: "",
            title2: "",
            options1: [],
            options2: [],
            note: ""
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos");
      setFormData({
        title1: "",
        title2: "",
        options1: [],
        options2: [],
        note: ""
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOption = () => {
    if (!newOption.text.trim() || !newOption.price.trim()) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    const option: Option = {
      id: Date.now().toString(),
      ...newOption
    };

    setFormData(prev => ({
      ...prev,
      [`options${selectedSection}`]: [...prev[`options${selectedSection}` as keyof ContentData] as Option[], option]
    }));

    setNewOption({
      text: "",
      price: "",
      icon: "Package"
    });
  };

  const handleRemoveOption = (id: string, section: 1 | 2) => {
    setFormData(prev => ({
      ...prev,
      [`options${section}`]: (prev[`options${section}` as keyof ContentData] as Option[]).filter(option => option.id !== id)
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          title: "SinFoto Content",
          contentText: JSON.stringify(formData),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Datos actualizados exitosamente");
      
      // Revalidar el cache del cliente
      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/api/v1/content-blocks/${ContentBlockId}`,
        }),
      });

      await fetchData();
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      toast.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent size={20} /> : <Package size={20} />;
  };

  const filteredIcons = commonIcons.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Sección SinFoto</h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mb-8 overflow-x-auto">
            <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Este es un preview referencial, por lo cual algunos elementos pueden no quedar correctamente organizados.</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Primera sección */}
                <div className="bg-gray-50 p-6 rounded">
                  <h4 className="text-xl font-semibold mb-4 text-primary">
                    {formData.title1}
                  </h4>
                  <ul className="space-y-2">
                    {formData.options1.map((option) => (
                      <li key={option.id} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                        <div className="flex items-center space-x-3">
                          {renderIcon(option.icon)}
                          <span>{option.text}</span>
                        </div>
                        <span className="font-bold text-primary">{option.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Segunda sección */}
                <div className="bg-gray-50 p-6 rounded">
                  <h4 className="text-xl font-semibold mb-4 text-primary">
                    {formData.title2}
                  </h4>
                  <ul className="space-y-2">
                    {formData.options2.map((option) => (
                      <li key={option.id} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                        <div className="flex items-center space-x-3">
                          {renderIcon(option.icon)}
                          <span>{option.text}</span>
                        </div>
                        <span className="font-bold text-primary">{option.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {formData.note && (
              <div className="mt-12 text-center">
                <div className="inline-block bg-blue-50 p-4 rounded">
                  <p className="text-gray-700">
                    <span className="font-semibold text-primary">Nota:</span>{" "}
                    {formData.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulario de edición */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Títulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Sección 1
              </label>
              <input
                type="text"
                value={formData.title1}
                onChange={(e) => setFormData(prev => ({ ...prev, title1: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Sección 2
              </label>
              <input
                type="text"
                value={formData.title2}
                onChange={(e) => setFormData(prev => ({ ...prev, title2: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Selector de sección */}
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setSelectedSection(1)}
              className={`px-4 py-2 rounded-md ${
                selectedSection === 1
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Sección 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedSection(2)}
              className={`px-4 py-2 rounded-md ${
                selectedSection === 2
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Sección 2
            </button>
          </div>

          {/* Opciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar Opción a Sección {selectedSection}
            </label>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newOption.text}
                  onChange={(e) => setNewOption(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Descripción de la opción"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowIconSelector(true);
                    setSelectedOptionIndex(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {renderIcon(newOption.icon)}
                </button>
              </div>
              <input
                type="text"
                value={newOption.price}
                onChange={(e) => setNewOption(prev => ({ ...prev, price: e.target.value }))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Precio"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={20} />
                Agregar
              </button>
            </div>

            {/* Lista de opciones */}
            <div className="space-y-2">
              {(formData[`options${selectedSection}` as keyof ContentData] as Option[]).map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowIconSelector(true);
                        setSelectedOptionIndex(index);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {renderIcon(option.icon)}
                    </button>
                    <span>{option.text}</span>
                    <span className="font-bold text-primary">{option.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id, selectedSection)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Ingrese la nota que aparecerá al final de la sección"
            />
          </div>

          {/* Selector de iconos */}
          {showIconSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Seleccionar Icono</h3>
                  <button
                    onClick={() => {
                      setShowIconSelector(false);
                      setIconSearch("");
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Buscar icono..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-[60vh]">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => {
                        if (selectedOptionIndex !== null) {
                          const newOptions = [...(formData[`options${selectedSection}` as keyof ContentData] as Option[])];
                          newOptions[selectedOptionIndex].icon = iconName;
                          setFormData(prev => ({
                            ...prev,
                            [`options${selectedSection}`]: newOptions
                          }));
                        } else {
                          setNewOption(prev => ({ ...prev, icon: iconName }));
                        }
                        setShowIconSelector(false);
                        setIconSearch("");
                      }}
                      className="p-2 hover:bg-gray-100 rounded flex items-center justify-center"
                      title={iconName}
                    >
                      {renderIcon(iconName)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botón de guardar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-primary hover:bg-primary/90 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Guardando...
              </>
            ) : (
              <>
                <Check size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SinFoto14BO;
