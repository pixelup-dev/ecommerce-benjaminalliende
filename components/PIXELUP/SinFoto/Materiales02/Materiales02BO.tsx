"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import { Plus, X, Check, Loader2, Package, Search } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Material {
  id: string;
  text: string;
  icon: string;
}

function Materiales02BO() {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewShowAll, setPreviewShowAll] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    text: "",
    icon: "Package"
  });
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  // Lista de iconos más comunes y útiles
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

  const handleAddMaterial = () => {
    if (!newMaterial.text.trim()) {
      toast.error("Por favor ingrese un material");
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      text: newMaterial.text.trim(),
      icon: newMaterial.icon
    };

    setMaterials([...materials, material]);
    setNewMaterial({ text: "", icon: "Package" });
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_MATERIALES02_CONTENTBLOCK}`;
      const token = getCookie("AdminTokenAuth");
      
      const contentText = materials.map(m => `${m.icon}|${m.text}`).join('\n');
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          contentText,
          materialsList: materials.map(m => m.text),
          title: "Materiales"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      toast.success("Materiales actualizados exitosamente");
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      toast.error("Error al actualizar los materiales");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_MATERIALES02_CONTENTBLOCK}`;
      const Token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contentBlock = response.data.contentBlock;
      if (contentBlock?.contentText) {
        const parsedMaterials = contentBlock.contentText
          .split('\n')
          .filter((line: string) => line.trim() !== '')
          .map((line: string) => {
            const [icon, text] = line.split('|');
            return {
              id: Date.now().toString() + Math.random(),
              text: text.trim(),
              icon: icon || "Package"
            };
          });
        setMaterials(parsedMaterials);
      }
    } catch (error) {
      console.error("Error al obtener los materiales:", error);
      toast.error("Error al cargar los materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent size={20} /> : <Package size={20} />;
  };

  // Filtrar iconos basados en la búsqueda
  const filteredIcons = commonIcons.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Listado de Materiales</h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
        </div>

        {/* Formulario para agregar materiales */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={newMaterial.text}
                onChange={(e) => setNewMaterial({ ...newMaterial, text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Ingrese un material..."
              />
              <button
                type="button"
                onClick={() => setShowIconSelector(!showIconSelector)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {renderIcon(newMaterial.icon)}
              </button>
            </div>
            <button
              onClick={handleAddMaterial}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={20} />
              Agregar
            </button>
          </div>

          {/* Selector de iconos */}
          {showIconSelector && (
            <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 max-h-96 w-96 overflow-hidden">
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
              <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-64">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => {
                      setNewMaterial({ ...newMaterial, icon: iconName });
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
          )}
        </div>

        {/* Lista de materiales */}
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 bg-gray-50"
              style={{ borderRadius: "var(--radius)" }}

            >
              <div className="flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}

              >
                {renderIcon(material.icon)}
                <span>{material.text}</span>
              </div>
              <button
                onClick={() => handleRemoveMaterial(material.id)}
                className="p-1 hover:bg-gray-200"
                style={{ borderRadius: "var(--radius)" }}

              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
            <div className="flex flex-wrap gap-2">
              {materials.map((material) => (
                <span
                  key={material.id}
                  className="px-4 py-2 bg-white border border-gray-200 text-sm flex items-center gap-2"
                  style={{ borderRadius: "var(--radius)" }}

                >
                  {renderIcon(material.icon)}
                  {material.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botón de guardar */}
        <form onSubmit={handleSubmit} className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-primary hover:bg-primary/90 focus:ring-4 font-medium text-sm px-5 py-2.5 text-center inline-flex items-center justify-center gap-2"
            style={{ borderRadius: "var(--radius)" }}

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
    </div>
  );
}

export default Materiales02BO;
