"use client";
import React, { useState, useRef } from "react";
import BannerTienda01BO from "@/components/PIXELUP/BannerTienda/BannerTienda01/BannerTienda01BO";

export default function BannerTienda() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };

      if (newState[sectionId] && sectionRefs.current[sectionId]) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }

      return newState;
    });
  };

  return (
    <section className="gap-4 flex flex-col py-10 mx-4">
      <title>Content block - Tienda</title>
      {[
        { id: "bannerTienda", title: "Banner Tienda", component: <BannerTienda01BO /> },
      ].map((section) => (
        <div
          key={section.id}
          ref={(el) => (sectionRefs.current[section.id] = el)}
          className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div
            className="text-sm flex gap-2 font-medium border-b p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                <div>{section.title}</div>
              </div>
              {openSections[section.id] ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 15.75 7.5-7.5 7.5 7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              )}
            </div>
          </div>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              openSections[section.id] ? "py-6 px-8" : "h-0 py-0 px-8"
            }`}
          >
            {section.component}
          </div>
        </div>
      ))}
    </section>
  );
}

