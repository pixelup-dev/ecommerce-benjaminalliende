"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAPI } from "@/app/Context/ProductTypeContext";
import axios from "axios";
import CreateCategory from "@/components/Core/Products/Category/CreateCategory";
import EditCategory from "@/components/Core/Products/Category/EditCategory";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";

const CategoriasPage: React.FC = () => {
  const { productType, setProductType } = useAPI();
  const [activeTab, setActiveTab] = useState("create");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const fetchProducTypes = async () => {
    try {
      const token = getCookie("AdminTokenAuth");

      const PageNumber = 1;
      const PageSize = 100;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?pageNumber=${PageNumber}&pageSize=${PageSize}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        productTypeResponse.data.productTypes,
        "productTypeResponse.data.productTypes"
      );
      setProductType(productTypeResponse.data.productTypes);
    } catch (error) {
      console.error("Error al obtener los tipos de producto: er2", error);
    }
  };

  useEffect(() => {
    fetchProducTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <title>Categorías</title>
      <Breadcrumb pageName="Categorías" />
      <div className="w-full">
        <div className="flex flex-col sm:flex-row mb-6 gap-4">
          <button
            className={`flex-1 p-4 rounded-xl bg-gray-200 text-primary shadow-md transition-all duration-300 ${
              activeTab === "create" ? "bg-primary text-white" : ""
            }`}
            onClick={() => handleTabChange("create")}
          >
            Crear Categoría
          </button>
          <button
            className={`flex-1 p-4 rounded-xl bg-gray-200 text-primary shadow-md transition-all duration-300 ${
              activeTab === "edit" ? "bg-primary text-white" : ""
            }`}
            onClick={() => handleTabChange("edit")}
          >
              Editar / Borrar Categoría
          </button>
        </div>
          {activeTab === "create" && (
            <div>
              <CreateCategory
                handleCloseModal={null}
                fetchData={fetchProducTypes}
              />
            </div>
          )}
          {activeTab === "edit" && (
            <EditCategory
              handleCloseModal={null}
              fetchData={fetchProducTypes}
              switchToCreateTab={null}
            />
          )}
      </div>
    </div>
  );
};

export default CategoriasPage;
