"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type NavbarContextType = {
  productTypes: any[];
  collections: any[];
  loading: boolean;
};

const NavbarContext = createContext<NavbarContextType>({
  productTypes: [],
  collections: [],
  loading: true,
});

// Crear un store global fuera del componente para mantener los datos
let globalStore = {
  productTypes: [],
  collections: [],
  isInitialized: false,
};

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    productTypes: globalStore.productTypes,
    collections: globalStore.collections,
    loading: !globalStore.isInitialized,
  });

  useEffect(() => {
    // Solo cargar datos si no están inicializados
    if (!globalStore.isInitialized) {
      const loadNavbarData = async () => {
        try {
          const [productTypesRes, collectionsRes] = await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/product-types?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=50`
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
            ),
          ]);

          const [productTypesData, collectionsData] = await Promise.all([
            productTypesRes.json(),
            collectionsRes.json(),
          ]);

          if (productTypesData.code === 0) {
            globalStore.productTypes = productTypesData.productTypes;
          }
          if (collectionsData.code === 0) {
            globalStore.collections = collectionsData.collections;
          }

          globalStore.isInitialized = true;

          setState({
            productTypes: globalStore.productTypes,
            collections: globalStore.collections,
            loading: false,
          });
        } catch (error) {
          console.error("Error loading navbar data:", error);
          setState((prev) => ({ ...prev, loading: false }));
        }
      };

      loadNavbarData();
    }
  }, []);

  return (
    <NavbarContext.Provider value={state}>{children}</NavbarContext.Provider>
  );
}

export const useNavbar = () => useContext(NavbarContext);
