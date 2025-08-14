"use client";

import React, { useState, useEffect } from "react";
import CreateCategory from "@/components/Core/Products/Category/CreateCategory";
import EditCategory from "@/components/Core/Products/Category/EditCategory";

interface TabsProps {
  handleCloseModal: any;
  fetchData: any;
}
const Tabs: React.FC<TabsProps> = ({ handleCloseModal, fetchData }) => {
  const [activeTab, setActiveTab] = useState("create");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const switchToCreateTab = () => {
    setActiveTab("create");
  };

  return (
    <div className="flex items-center lg:pr-28 justify-end">
      <div className="mt-[10vh] w-full lg:w-[70%]">
        <div className="flex  w-full  bg-white my-4 p-4 rounded">
          <button
            className={`flex-1 p-4 rounded ${
              activeTab === "create" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleTabChange("create")}
          >
            Crear Categoría
          </button>
          <button
            className={`flex-1 p-4 rounded-xl ${
              activeTab === "edit" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleTabChange("edit")}
          >
              Editar / Borrar Categoría
          </button>
        </div>
        <div className=" bg-white rounded ">
          {activeTab === "create" && (
            <div>
              <CreateCategory
                handleCloseModal={handleCloseModal}
                fetchData={fetchData}
              />
            </div>
          )}
          {activeTab === "edit" && (
            <EditCategory
              handleCloseModal={handleCloseModal}
              fetchData={fetchData}
              switchToCreateTab={switchToCreateTab}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
