"use client";
import React, { useState } from "react";

function TabExtra({
  setFormData,
  formData,
}: {
  setFormData: any;
  formData: any;
}) {
  const [activeTab, setActiveTab] = useState(1);

  const handleInputMeasuresChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      measures: {
        ...prevFormData.measures,
        [name]: parseFloat(value) || null,
      },
    }));
  };
  return (
    <section className="flex mt-4">
      {/* Menú a la izquierda */}
      <div className="w-1/4 ">
        <ul>
          <li
            style={{ borderRadius: 'var(--radius)' }}
            className={`shadow p-4 mb-1 border border-dark/30 cursor-pointer ${
              activeTab === 1 ? "bg-primary text-secondary" : "text-primary"
            }`}
            onClick={() => setActiveTab(1)}
          >
            <div className="flex gap-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  />
                </svg>
              </span>
              <span className="hidden md:inline-block">Envío/Retiro</span>
            </div>
          </li>
          <li
          style={{ borderRadius: 'var(--radius)' }}
            className={`shadow p-4 mb-1 mt-2 border border-dark/30 cursor-pointer ${
              activeTab === 2 ? "bg-primary text-secondary" : "text-primary"
            }`}
            onClick={() => setActiveTab(2)}
          >
            <div className="flex gap-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  />
                </svg>
              </span>
              <span className="hidden md:inline-block">
                Productos Relacionados
              </span>
            </div>
          </li>
          <li
          style={{ borderRadius: 'var(--radius)' }}
            className={`shadow mt-2  p-4 border border-dark/30 cursor-pointer ${
              activeTab === 3 ? "bg-primary text-secondary" : "text-primary"
            }`}
            onClick={() => setActiveTab(3)}
          >
            <div className="flex gap-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  />
                </svg>
              </span>
              <span className="hidden md:inline-block">SEO</span>
            </div>
          </li>
        </ul>
      </div>
      {/* Contenido a la derecha */}
      <div className="shadow w-3/4 bg-white border border-dark/30 ml-2" style={{ borderRadius: 'var(--radius)' }}>
        <div className={activeTab === 1 ? "p-4" : "p-4 hidden"}>
          <div className="my-2 space-x-4">
            <h3 className="text-md font-bold uppercase mb-2">
              Disponible para:
            </h3>
            <label htmlFor="enabledForDelivery">Delivery</label>
            <input
              type="checkbox"
              id="enabledForDelivery"
              name="enabledForDelivery"
              checked={formData.enabledForDelivery}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.checked,
                })
              }
            />
            <label htmlFor="enabledForWithdrawal">Retiro</label>
            <input
              type="checkbox"
              id="enabledForWithdrawal"
              name="enabledForWithdrawal"
              checked={formData.enabledForWithdrawal}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [event.target.name]: event.target.checked,
                })
              }
            />
          </div>
          <hr className="my-4" />
          <label>
            Largo <span className="text-xs"> Medida en cm.</span>
          </label>
          <input
            type="number"
            className="shadow py-3 block mb-2 p-2.5 mt-2 w-full text-sm text-dark bg-white border border-dark/30 focus:ring-primary focus:border-primary"
            style={{ borderRadius: 'var(--radius)' }}
            id="length"
            name="length"
            value={formData.measures.length || ""}
            onChange={(event) => handleInputMeasuresChange(event)}
          />
          <label>
            Ancho <span className="text-xs"> Medida en cm.</span>
          </label>
          <input
            type="number"
            className="shadow py-3 block mb-2 p-2.5 mt-2 w-full text-sm text-dark bg-white border border-dark/30 focus:ring-primary focus:border-primary"
            style={{ borderRadius: 'var(--radius)' }}            
            id="width"
            name="width"
            value={formData.measures.width || ""}
            onChange={(event) => handleInputMeasuresChange(event)}
          />
          <label>
            Altura <span className="text-xs"> Medida en cm.</span>
          </label>
          <input
            type="number"
            className="shadow py-3 block mb-2 p-2.5 mt-2 w-full text-sm text-dark bg-white border border-dark/30 focus:ring-primary focus:border-primary"
            style={{ borderRadius: 'var(--radius)' }}            
            id="height"
            name="height"
            value={formData.measures.height || ""}
            onChange={(event) => handleInputMeasuresChange(event)}
          />
          <label>
            Peso <span className="text-xs">Kg / ej. 0.5kg</span>
          </label>
          <input
            type="number"
            className="shadow py-3 block mb-2 p-2.5 mt-2 w-full text-sm text-dark bg-white border border-dark/30 focus:ring-primary focus:border-primary"
            style={{ borderRadius: 'var(--radius)' }}            
            id="weight"
            name="weight"
            value={formData.measures.weight || ""}
            onChange={(event) => handleInputMeasuresChange(event)}
          />
        </div>
        <div className={activeTab === 2 ? "p-4" : "p-4 hidden"}>
          * BUSCADOR DE PRODUCTOS * PROXIMAMENTE
        </div>
        <div className={activeTab === 3 ? "p-4" : "p-4 hidden"}>
          * SEO * PROXIMAMENTE
        </div>
      </div>
    </section>
  );
}

export default TabExtra;
