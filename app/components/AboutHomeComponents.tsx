"use client";

import React, { Suspense } from "react";
import { AboutConfig } from "@/app/utils/aboutConfig";
import Banner from "@/components/PIXELUP/Skeleton/Banner";
import { useDynamicComponents } from "@/hooks/useDynamicComponents";

interface ClientAboutComponentsProps {
  config: AboutConfig;
}

export default function ClientAboutComponents({
  config,
}: ClientAboutComponentsProps) {
  const { renderComponent, getComponentById } = useDynamicComponents({
    page: 'about',
    type: 'front'
  });

  const renderComponentWithProps = (componentId: string) => {
    const component = getComponentById(componentId);
    let props = component?.props || {};
    
    // Props específicas para componentes de About
    if (componentId === 'aboutUs') {
      props = {
        ...props,
        contentBlockId: process.env.NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK
      };
    }
    
    return (
      <Suspense
        key={componentId}
        fallback={<Banner />}
      >
        {renderComponent(componentId, props)}
      </Suspense>
    );
  };

  // Renderizar componentes en el orden especificado
  return (
    <>
      {config.order.map((componentId) => {
        if (config.visibleComponents.includes(componentId)) {
          return renderComponentWithProps(componentId);
        }
        return null;
      })}
    </>
  );
}
