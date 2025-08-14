"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface ReviewSettings {
  enabled: boolean;
  updatedAt?: string;
}

export const useReviewSettings = () => {
  const [isReviewEnabled, setIsReviewEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewSettings = async () => {
      try {
        setLoading(true);
        const contentBlockId = process.env.NEXT_PUBLIC_REVIEWSPRODUCTOS_CONTENTBLOCK || "REVIEWSPRODUCTOS";
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data.contentBlock?.contentText) {
          const reviewConfig: ReviewSettings = JSON.parse(response.data.contentBlock.contentText);
          setIsReviewEnabled(reviewConfig.enabled);
        } else {
          // Si no existe la configuración, usar valor por defecto (deshabilitado)
          setIsReviewEnabled(false);
        }
      } catch (error) {
        console.error("Error cargando configuración de reviews:", error);
        // En caso de error, asumir que está deshabilitado por defecto
        setIsReviewEnabled(false);
        setError("Error al cargar configuración de reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSettings();
  }, []);

  return {
    isReviewEnabled,
    loading,
    error
  };
}; 