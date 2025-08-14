"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HomeConfig } from "@/app/utils/homeConfig";
import { useComponentCategories } from "@/hooks/useComponentCategories";
import { ComponentPreview, SortableComponent, type ComponentConfig } from "@/app/components/shared/BaseComponentManager";

interface HomeConfigManagerProps {
  availableComponents: ComponentConfig[];
  config: HomeConfig;
  onConfigChange: (config: HomeConfig) => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
  aboutVisibleComponents?: string[];
}

// Modal para componentes inactivos
function InactiveComponentsModal({
  isOpen,
  onClose,
  inactiveComponents,
  onActivateComponent,
  aboutVisibleComponents = [],
  activeComponents = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  inactiveComponents: ComponentConfig[];
  onActivateComponent: (componentId: string) => void;
  aboutVisibleComponents?: string[];
  activeComponents?: ComponentConfig[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewComponent, setPreviewComponent] =
    useState<ComponentConfig | null>(null);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);

  // Combinar todos los componentes disponibles
  const allComponents = [...activeComponents, ...inactiveComponents];

  // Usar el hook de categorías
  const { getCategoryIcon, getCategoryColor, getAllCategories } = useComponentCategories(allComponents);

  // Obtener categorías únicas
  const categories = Array.from(
    new Set(
      allComponents
        .map((comp) => comp.category)
        .filter(Boolean) as string[]
    )
  );

  // Filtrar componentes por búsqueda y categoría
  const filteredComponents = allComponents.filter((component) => {
    const matchesSearch =
      component.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesCategory =
      selectedCategory === "all" || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Agrupar por categoría
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    const category = component.category || "Sin Categoría";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as { [key: string]: ComponentConfig[] });

  const handlePreview = (component: ComponentConfig) => {
    setPreviewComponent(component);
    
    // Encontrar el índice del componente en la lista filtrada
    const allFilteredComponents = filteredComponents;
    const index = allFilteredComponents.findIndex(comp => comp.id === component.id);
    setCurrentComponentIndex(index >= 0 ? index : 0);
  };

  const handleAddDirect = (componentId: string) => {
    onActivateComponent(componentId);
    onClose();
  };

  const handleAddFromPreview = () => {
    if (previewComponent) {
      onActivateComponent(previewComponent.id);
      setPreviewComponent(null);
      onClose();
    }
  };

  const navigateToComponent = (direction: 'prev' | 'next') => {
    if (!previewComponent) return;
    
    const allFilteredComponents = filteredComponents;
    const currentIndex = allFilteredComponents.findIndex(comp => comp.id === previewComponent.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allFilteredComponents.length - 1;
    } else {
      newIndex = currentIndex < allFilteredComponents.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentComponentIndex(newIndex);
    setPreviewComponent(allFilteredComponents[newIndex]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-primary to-primary/70">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Agregar Componentes
                </h2>
                <p className="text-white text-sm">
                  Explora y selecciona los componentes que deseas agregar a tu página Home
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full bg-gray-200 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido principal con sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Categorías */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Categorías
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
                      selectedCategory === "all"
                        ? "bg-primary/30 text-primary border border-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                    </svg>
                    <span>Todas ({allComponents.length})</span>
                  </button>
                  {categories.map((category) => {
                    const categoryCount = allComponents.filter(comp => comp.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
                          selectedCategory === category
                            ? "bg-primary/30 text-primary border border-primary"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {getCategoryIcon(category)}
                        </div>
                        <span>{category} ({categoryCount})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Área principal de contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.keys(groupedComponents).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="font-medium text-lg mb-2">No se encontraron componentes</p>
                  <p className="text-sm text-gray-400">
                    Intenta con otros términos de búsqueda o cambia de categoría
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedComponents).map(
                    ([category, components]) => (
                      <div key={category}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 flex items-center justify-center text-gray-500">
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {category}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {components.length} componente{components.length !== 1 ? 's' : ''} disponible{components.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        {/* Vista de componentes según el modo seleccionado */}
                        {viewMode === "grid" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {components.map((component) => {
                              const isActive = activeComponents.some(active => active.id === component.id);
                              const isAboutComponent = aboutVisibleComponents.includes(component.id);

                              return (
                                <div
                                  key={component.id}
                                  className="group block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                                >
                                  {/* Fondo decorativo con gradiente sutil */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="flex flex-col space-y-4 relative z-10">
                                    {/* Información del componente */}
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                                          {component.title.charAt(0)}
                                        </div>
                                        <div>
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                            {component.title}
                                          </h4>
                                          <p className="text-xs text-gray-500 font-medium">
                                            ID: {component.id}
                                          </p>
                                          {isActive && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                              Activo
                                            </span>
                                          )}
                                          {isAboutComponent && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                              </svg>
                                              <span className="text-xs text-orange-600 font-medium">Compartido con About Us</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Botones de acción */}
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => handlePreview(component)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        Vista Previa
                                      </button>
                                      <button
                                        onClick={() => handleAddDirect(component.id)}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                          />
                                        </svg>
                                        Agregar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {components.map((component) => {
                              const isActive = activeComponents.some(active => active.id === component.id);
                              const isAboutComponent = aboutVisibleComponents.includes(component.id);

                              return (
                                <div
                                  key={component.id}
                                  className="group block w-full bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                                >
                                  {/* Fondo decorativo con gradiente sutil */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="flex items-center justify-between relative z-10">
                                    {/* Información del componente */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                                          {component.title.charAt(0)}
                                        </div>
                                        <div>
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {component.title}
                                          </h4>
                                          <p className="text-xs text-gray-500 font-medium">
                                            ID: {component.id}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            {isActive && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Activo
                                              </span>
                                            )}
                                            {isAboutComponent && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                                                Compartido con About Us
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Botones de acción */}
                                    <div className="flex-shrink-0 flex gap-2">
                                      <button
                                        onClick={() => handlePreview(component)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2 transition-all duration-200"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        Vista Previa
                                      </button>
                                      <button
                                        onClick={() => handleAddDirect(component.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                          />
                                        </svg>
                                        Agregar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-primary/30 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {filteredComponents.length} de {allComponents.length} componentes
                </div>
                <p className="text-sm text-gray-600">
                  Selecciona los componentes que deseas agregar a tu página Home
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de vista previa */}
      {previewComponent && (
        <ComponentPreview
          component={previewComponent}
          onClose={() => setPreviewComponent(null)}
          onAdd={handleAddFromPreview}
          onNavigate={navigateToComponent}
          currentIndex={currentComponentIndex}
          totalComponents={filteredComponents.length}
        />
      )}
    </>
  );
}

export default function HomeConfigManager({
  availableComponents,
  config,
  onConfigChange,
  onSave,
  onReset,
  loading = false,
  aboutVisibleComponents,
}: HomeConfigManagerProps) {
  const [activeComponents, setActiveComponents] = useState<ComponentConfig[]>(
    []
  );
  const [inactiveComponents, setInactiveComponents] = useState<
    ComponentConfig[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Usar el hook de categorías
  const { getCategoryIcon, getCategoryColor, getAllCategories } = useComponentCategories(availableComponents);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separar componentes activos e inactivos
  useEffect(() => {
    const active = availableComponents.filter((comp) =>
      config.visibleComponents.includes(comp.id)
    );
    const inactive = availableComponents.filter(
      (comp) => !config.visibleComponents.includes(comp.id)
    );

    // Ordenar activos según el orden de la configuración
    const orderedActive = config.order
      .map((id) => active.find((comp) => comp.id === id))
      .filter(Boolean) as ComponentConfig[];

    setActiveComponents(orderedActive);
    setInactiveComponents(inactive);
  }, [config, availableComponents]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const activeIndex = activeComponents.findIndex(
        (comp) => comp.id === active.id
      );
      const overIndex = activeComponents.findIndex(
        (comp) => comp.id === over.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        // Reordenar dentro de la lista activa
        const newActive = arrayMove(activeComponents, activeIndex, overIndex);
        setActiveComponents(newActive);

        const newOrder = newActive.map((comp) => comp.id);
        const newVisibleComponents = newOrder;

        onConfigChange({
          visibleComponents: newVisibleComponents,
          order: newOrder,
        });
      }
    }
  };

  const toggleComponent = (componentId: string, activate: boolean) => {
    if (activate) {
      // Activar componente
      const component = inactiveComponents.find(
        (comp) => comp.id === componentId
      );
      if (component) {
        const newInactive = inactiveComponents.filter(
          (comp) => comp.id !== componentId
        );
        const newActive = [...activeComponents, component];

        setInactiveComponents(newInactive);
        setActiveComponents(newActive);

        const newOrder = newActive.map((comp) => comp.id);
        const newVisibleComponents = newOrder;

        onConfigChange({
          visibleComponents: newVisibleComponents,
          order: newOrder,
        });
      }
    } else {
      // Desactivar componente
      const component = activeComponents.find(
        (comp) => comp.id === componentId
      );
      if (component) {
        const newActive = activeComponents.filter(
          (comp) => comp.id !== componentId
        );
        const newInactive = [...inactiveComponents, component];

        setActiveComponents(newActive);
        setInactiveComponents(newInactive);

        const newOrder = newActive.map((comp) => comp.id);
        const newVisibleComponents = newOrder;

        onConfigChange({
          visibleComponents: newVisibleComponents,
          order: newOrder,
        });
      }
    }
  };

  const moveComponent = (componentId: string, direction: "up" | "down") => {
    const currentIndex = activeComponents.findIndex(
      (comp) => comp.id === componentId
    );
    if (currentIndex === -1) return;

    const newActive = Array.from(activeComponents);

    if (direction === "up" && currentIndex > 0) {
      [newActive[currentIndex], newActive[currentIndex - 1]] = [
        newActive[currentIndex - 1],
        newActive[currentIndex],
      ];
    } else if (direction === "down" && currentIndex < newActive.length - 1) {
      [newActive[currentIndex], newActive[currentIndex + 1]] = [
        newActive[currentIndex + 1],
        newActive[currentIndex],
      ];
    } else {
      return;
    }

    setActiveComponents(newActive);

    const newOrder = newActive.map((comp) => comp.id);
    const newVisibleComponents = newOrder;

    onConfigChange({
      visibleComponents: newVisibleComponents,
      order: newOrder,
    });
  };

  const getActiveComponent = () => {
    if (!activeId) return null;
    return activeComponents.find((comp) => comp.id === activeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración del Home
          </h2>
          <p className="text-gray-600 mt-1">
            Arrastra y suelta para reordenar los componentes activos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={loading}
            className="action-button bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restaurar
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="action-button bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Componentes Activos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Componentes Activos
                <span className="rounded-full bg-primary text-white px-2 py-1 text-xs">
                  {activeComponents.length}
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Estos componentes se mostrarán en la página Home en el orden
                especificado
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Agregar Componentes
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="p-4 space-y-2 min-h-[200px] custom-scrollbar">
            <SortableContext
              items={activeComponents.map((comp) => comp.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeComponents.map((component, index) => {
                const isShared = aboutVisibleComponents?.includes(component.id) || false;
                return (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    index={index}
                    onMove={(direction) => moveComponent(component.id, direction)}
                    onToggle={(activate) =>
                      toggleComponent(component.id, activate)
                    }
                    totalItems={activeComponents.length}
                    isShared={isShared}
                    sharedWith="About Us"
                  />
                );
              })}
            </SortableContext>

            {activeComponents.length === 0 && (
              <div className="empty-state text-center py-8 text-gray-500 rounded-lg">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-medium">No hay componentes activos</p>
                <p className="text-sm">
                  Haz clic en &quot;Agregar Componentes&quot; para comenzar
                </p>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="component-card bg-white border border-gray-200 rounded-lg p-4 shadow-lg opacity-90">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getActiveComponent()?.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getActiveComponent()?.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal para componentes inactivos */}
      <InactiveComponentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inactiveComponents={inactiveComponents}
        onActivateComponent={(componentId) =>
          toggleComponent(componentId, true)
        }
        activeComponents={activeComponents}
        aboutVisibleComponents={aboutVisibleComponents}
      />
    </div>
  );
}
