"use client";
import { createContext, useContext, useState } from "react";

interface RevalidationContextType {
  shouldRevalidate: boolean;
  setShouldRevalidate: (value: boolean) => void;
  triggerRevalidation: (tag?: string | string[]) => Promise<void>;
}

const RevalidationContext = createContext<RevalidationContextType | undefined>(
  undefined
);

export function RevalidationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shouldRevalidate, setShouldRevalidate] = useState(false);

  const triggerRevalidation = async (tag?: string | string[]) => {
    try {
      if (tag) {
        const tags = Array.isArray(tag) ? tag : [tag];
        await Promise.all(
          tags.map((t) =>
            fetch(`/api/revalidate?tag=${t}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            })
          )
        );
      } else {
        // Revalidar tags por defecto
        await Promise.all([
          fetch(`/api/revalidate?tag=products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`/api/revalidate?tag=collections`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);
      }

      setShouldRevalidate(true);
      setTimeout(() => setShouldRevalidate(false), 1000);
    } catch (error) {
      console.error("Error en la revalidación:", error);
    }
  };

  return (
    <RevalidationContext.Provider
      value={{ shouldRevalidate, setShouldRevalidate, triggerRevalidation }}
    >
      {children}
    </RevalidationContext.Provider>
  );
}

export function useRevalidation() {
  const context = useContext(RevalidationContext);
  if (context === undefined) {
    throw new Error(
      "useRevalidation debe usarse dentro de un RevalidationProvider"
    );
  }
  return context;
}
