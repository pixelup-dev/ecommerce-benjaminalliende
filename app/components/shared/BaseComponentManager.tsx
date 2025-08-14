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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useComponentCategories } from "@/hooks/useComponentCategories";

interface ComponentConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  frontComponent?: () => Promise<any>;
  backComponent?: () => Promise<any>;
  previewComponent?: () => Promise<any>; // Componente específico para vista previa
  showInHome: boolean;
  showInAbout: boolean;
  props?: Record<string, any>;
}

interface BaseComponentManagerProps {
  availableComponents: ComponentConfig[];
  config: any;
  onConfigChange: (config: any) => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
  sharedComponents?: string[]; // Componentes compartidos con otra página
  pageType: 'home' | 'about'; // Tipo de página para mostrar mensajes apropiados
}

// Componente de vista previa
function ComponentPreview({
  component,
  onClose,
  onAdd,
  onNavigate,
  currentIndex = 0,
  totalComponents = 0,
}: {
  component: ComponentConfig;
  onClose: () => void;
  onAdd: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
  totalComponents?: number;
}) {
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);
  const [componentSize, setComponentSize] = useState<{ width: number; height: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { getCategoryIcon } = useComponentCategories([component]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!onNavigate) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onNavigate('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNavigate('next');
          break;
        case 'Escape':
          event.preventDefault();
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onClose, isFullscreen]);

  // Función para medir el tamaño del componente
  const measureComponent = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setComponentSize({
      width: rect.width,
      height: rect.height
    });
  };

  // Mapeo de componentes a sus respectivos componentes de vista previa
  const getPreviewComponent = async (componentId: string) => {
    try {
      setLoading(true);

      // Buscar el componente en la configuración
      const componentConfig = component;
      
      // Priorizar previewComponent si está disponible, sino usar frontComponent como fallback
      const componentToLoad = componentConfig?.previewComponent || componentConfig?.frontComponent;
      
      if (componentToLoad) {
        const importedModule = await componentToLoad();
        const Component = importedModule.default || importedModule;
        setPreviewComponent(<Component {...componentConfig.props} />);
      } else {
        setPreviewComponent(
          <div className="text-center py-8 text-gray-500">
            <p>Vista previa no disponible para este componente</p>
          </div>
        );
      }
    } catch (error) {
      console.error("Error cargando vista previa:", error);
      setPreviewComponent(
        <div className="text-center py-8 text-red-500">
          <p>Error al cargar la vista previa</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPreviewComponent(component.id);
  }, [component.id]);

  // Calcular el tamaño óptimo del modal basado en el componente
  const getModalSize = () => {
    if (isFullscreen) {
      return {
        width: '95vw',
        height: '95vh',
        maxWidth: '95vw',
        maxHeight: '95vh',
      };
    }

    if (!componentSize) {
      // Tamaño por defecto si no se ha medido el componente
      return {
        width: '90vw',
        maxWidth: '1200px',
        height: '80vh',
        maxHeight: '800px'
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Margen mínimo del modal
    const margin = 80;
    const maxWidth = viewportWidth - margin;
    const maxHeight = viewportHeight - margin;
    
    // Calcular el tamaño óptimo manteniendo la proporción del componente
    let modalWidth = componentSize.width;
    let modalHeight = componentSize.height;
    
    // Si el componente es más ancho que el viewport disponible
    if (modalWidth > maxWidth) {
      const scale = maxWidth / modalWidth;
      modalWidth = maxWidth;
      modalHeight = componentSize.height * scale;
    }
    
    // Si el componente es más alto que el viewport disponible
    if (modalHeight > maxHeight) {
      const scale = maxHeight / modalHeight;
      modalHeight = maxHeight;
      modalWidth = Math.min(modalWidth * scale, maxWidth);
    }
    
    // Asegurar un tamaño mínimo
    const minWidth = 400;
    const minHeight = 300;
    
    return {
      width: `${Math.max(modalWidth, minWidth)}px`,
      height: `${Math.max(modalHeight, minHeight)}px`,
      maxWidth: `${maxWidth}px`,
      maxHeight: `${maxHeight}px`
    };
  };

  const modalSize = getModalSize();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-lg shadow-xl flex flex-col ${isFullscreen ? 'rounded-none' : ''}`}
        style={{
          width: modalSize.width,
          height: modalSize.height,
          maxWidth: modalSize.maxWidth,
          maxHeight: modalSize.maxHeight,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            {/* Información del componente */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {getCategoryIcon(component.category || "")}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {component.title}
                </h2>
                {component.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    {component.category} • ID: {component.id}
                  </p>
                )}
              </div>
            </div>
            
            {/* Navegación y botones agrupados en la derecha */}
            <div className="flex items-center gap-2">
              {/* Navegación */}
              {onNavigate && totalComponents > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onNavigate('prev')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                    title="Componente anterior (←)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500 min-w-[40px] text-center">
                    {currentIndex + 1} / {totalComponents}
                  </span>
                  <button
                    onClick={() => onNavigate('next')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                    title="Siguiente componente (→)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Botón vista completa */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                title={isFullscreen ? "Salir vista completa (F)" : "Vista completa (F)"}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              
              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                title="Cerrar (ESC)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Cargando vista previa...</p>
                </div>
              </div>
            ) : (
              <div 
                className="h-full w-full"
                ref={(el) => {
                  if (el && !componentSize && !isFullscreen) {
                    // Medir el componente después de que se renderice
                    setTimeout(() => measureComponent(el), 100);
                  }
                }}
              >
                {previewComponent}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Volver
            </button>
            <div className="flex gap-2">
              <button
                onClick={onAdd}
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
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
                Agregar Componente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Sortable para elementos activos
function SortableComponent({
  component,
  index,
  onMove,
  onToggle,
  totalItems = 0,
  isShared = false,
  sharedWith = '',
}: {
  component: ComponentConfig;
  index: number;
  onMove: (direction: "up" | "down") => void;
  onToggle: (activate: boolean) => void;
  totalItems?: number;
  isShared?: boolean;
  sharedWith?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { getCategoryIcon } = useComponentCategories([component]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`component-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
        isDragging ? "dragging" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center drag-handle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{component.title}</h4>
              {component.category && (
                <span className="category-badge flex items-center gap-1">
                  {getCategoryIcon(component.category)}
                  <span>{component.category}</span>
                </span>
              )}
              {isShared && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-orange-600 font-medium">Compartido con {sharedWith}</span>
                </div>
              )}
            </div>
            {component.description && (
              <p className="text-sm text-gray-600">{component.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="action-button p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 tooltip"
            data-tooltip="Mover arriba"
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
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === totalItems - 1}
            className="action-button p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 tooltip"
            data-tooltip="Mover abajo"
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => onToggle(false)}
            className="action-button p-1 text-red-400 hover:text-red-600 tooltip"
            data-tooltip="Desactivar componente"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export { ComponentPreview, SortableComponent };
export type { ComponentConfig, BaseComponentManagerProps }; 