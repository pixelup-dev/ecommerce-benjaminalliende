/* eslint-disable @next/next/no-head-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Stars from "@/components/Core/Products/Detail/Stars";
import Head from "next/head";
import toast from "react-hot-toast";
import axios from "axios";
import { getCookie } from "cookies-next";
import Destacados01 from "../../Destacados/Destacado01";
import { useReviewSettings } from "@/hooks/useReviewSettings";
import {
  fetchProductData,
  fetchStockData,
  fetchThumbnailData,
} from "@/app/utils/productApi";
import "react-quill/dist/quill.snow.css";

interface Variation {
  id: string;
  product: {
    id: string;
    description: any;
  };
  isBaseSku: boolean;
  mainImageUrl: string;
  description: string;
  attributes: { label: string; value: string }[];
  pricings: Array<{ unitPrice: number }>;
  offers?: {
    unitPrice: number;
    startDate: string;
    endDate: string;
  }[];
}

interface Thumbnail {
  id: string;
  imageUrl: string;
}

interface ProductDetail02Props {
  product: any;
}

const ProductDetail01: React.FC<ProductDetail02Props> = ({
  product: initialProduct,
}) => {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [stock, setStock] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | any>(
    null
  );
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [currentAttributes, setCurrentAttributes] = useState<{
    [key: string]: string[];
  }>({});
  const [currentPrices, setCurrentPrices] = useState<{
    [key: string]: number | null;
  }>({});
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [productName, setProductName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedVariationPrice, setSelectedVariationPrice] = useState<
    number | null
  >(null);
  const [attributeSelected, setAttributeSelected] = useState(false);
  const [disabledAttributes, setDisabledAttributes] = useState<{
    [key: string]: boolean[];
  }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [isBaseSku, setIsBaseSku] = useState(false);
  const [hasVariations, setHasVariations] = useState(Boolean);
  const [enabledForDelivery, setEnabledForDelivery] = useState(false);
  const [enabledForWithdrawal, setEnabledForWithdrawal] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null
  );
  const [isAddToCartDisabled, setIsAddToCartDisabled] = useState(false);
  const [reviewAverageScore, setReviewAverageScore] = useState<number | null>(
    null
  );
  const [totalReviews, setTotalReviews] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCartHandler } = useAPI();
  const { id } = useParams();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cuotasEnabled, setCuotasEnabled] = useState(false);
  const [numeroCuotas, setNumeroCuotas] = useState(0);
  const { isReviewEnabled } = useReviewSettings();

  const fetchStockForVariation = useCallback(
    async (productId: string, skuId: string) => {
      try {
        const data = await fetchStockData(productId, skuId);
        if (data.code === 0 && data.skuInventories.length > 0) {
          const totalStock = data.skuInventories.reduce(
            (acc: number, inventory: any) => acc + inventory.quantity,
            0
          );
          setStock(totalStock);
        } else {
          setStock(0);
        }
      } catch (error) {
        console.error("Error fetching stock:", error);
        setStock(0);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedVariation) {
      fetchStockForVariation(
        selectedVariation.product.id,
        selectedVariation.id
      );
    }
  }, [selectedVariation]);

  const fetchThumbnails = useCallback(
    async (productId: string, skuId: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const data = await response.json();
        if (data.code === 0) {
          const currentMainImage =
            mainImageUrl ||
            selectedVariation?.mainImageUrl ||
            initialProduct?.skus?.[0]?.mainImageUrl;

          if (currentMainImage) {
            const mainThumbnail = { id: "main", imageUrl: currentMainImage };
            const allThumbnails = [mainThumbnail, ...(data.skuImages || [])];
            setThumbnails(allThumbnails);
            if (!selectedThumbnail) {
              setSelectedThumbnail(currentMainImage);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener las miniaturas:", error);
      }
    },
    [mainImageUrl, selectedVariation, initialProduct?.skus, selectedThumbnail]
  );

  useEffect(() => {
    const resetToBaseProduct = async () => {
      if (!selectedVariation && initialProduct?.skus?.length > 0) {
        const baseSku = initialProduct.skus.find((sku: any) => sku.isBaseSku);
        if (baseSku) {
          // Primero reseteamos los estados de navegación
          setCurrentSlide(0);
          setSelectedThumbnail(baseSku.mainImageUrl);

          // Luego actualizamos los thumbnails
          await fetchThumbnails(baseSku.product.id, baseSku.id);
        }
      } else if (selectedVariation) {
        await fetchThumbnails(
          selectedVariation.product.id,
          selectedVariation.id
        );
      }
    };

    resetToBaseProduct();
  }, [selectedVariation, initialProduct?.skus]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setCurrentSlide(index);
    setSelectedThumbnail(thumbnails[index].imageUrl);
  };

  const [startX, setStartX] = useState(0);
  const [isTouching, setIsTouching] = useState(false);

  const moveSlide = (direction: any) => {
    const newIndex =
      (currentSlide + direction + thumbnails.length) % thumbnails.length;
    setCurrentSlide(newIndex);
    setSelectedThumbnail(thumbnails[newIndex].imageUrl); // Asegúrate de cambiar también la miniatura seleccionada
  };

  const handleTouchStart = (e: any) => {
    setStartX(e.touches[0].clientX);
    setIsTouching(true);
  };

  const handleTouchMove = (e: any) => {
    if (!isTouching) return;

    const touchX = e.touches[0].clientX;
    const touchDiff = startX - touchX;

    if (touchDiff > 50) {
      moveSlide(1); // Swipe left
      setIsTouching(false);
    } else if (touchDiff < -50) {
      moveSlide(-1); // Swipe right
      setIsTouching(false);
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  const renderMobileThumbnails = () => {
    return (
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto overflow-hidden aspect-square">
          <button
            className="lg:hidden absolute top-1/2 left-2 transform -translate-y-1/2 bg-[#4D4D4D] text-white p-3 z-10 rounded-full"
            onClick={() => moveSlide(-1)}
          >
            &#10094;
          </button>
          <div
            className="slider flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className="slide min-w-full box-border h-full"
              >
                <img
                  src={thumbnail.imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-contain"
                  style={{
                    borderRadius: "var(--radius)",
                  }}
                />
              </div>
            ))}
          </div>
          <button
            className="lg:hidden absolute top-1/2 right-2 transform -translate-y-1/2 bg-[#4D4D4D] text-white p-3 z-10 rounded-full"
            onClick={() => moveSlide(1)}
          >
            &#10095;
          </button>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          {thumbnails.map((thumbnail, index) => (
            <img
              key={thumbnail.id}
              src={thumbnail.imageUrl}
              alt="Miniatura"
              className={`object-cover cursor-pointer shadow-md ${
                index === currentSlide ? "border-2 border-primary" : ""
              }`}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius)",
              }}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Inicialización de datos del producto
  useEffect(() => {
    if (initialProduct?.code === 0 && initialProduct?.skus) {
      try {
        const variations = initialProduct.skus;
        setVariationsQuantity(variations.length);
        setHasVariations(variations.length > 1);

        const processedVariations = variations.map((variation: any) => ({
          ...variation,
          offers: variation.offers || [],
          attributes: variation.attributes || [],
          pricings: variation.pricings || [],
        }));

        setVariations(processedVariations);

        // Procesar precios - Versión corregida
        const pricesByVariation: { [key: string]: number | null } = {};
        variations.forEach((variation: any) => {
          if (variation.pricings && variation.pricings.length > 0) {
            pricesByVariation[variation.id] = variation.pricings[0].unitPrice;
          } else {
            pricesByVariation[variation.id] = null;
          }
        });

        // Establecer precios min/max
        const validPrices = Object.values(pricesByVariation).filter(
          (price): price is number =>
            price !== null && !isNaN(price) && price > 0
        );

        if (validPrices.length > 0) {
          const minPriceValue = Math.min(...validPrices);
          const maxPriceValue = Math.max(...validPrices);
          setMinPrice(minPriceValue.toString());
          setMaxPrice(maxPriceValue.toString());
        } else {
          setMinPrice("0");
          setMaxPrice("0");
        }

        setCurrentPrices(pricesByVariation);

        // Procesar atributos
        const attributesByVariation: { [key: string]: any[] } = {};
        variations.forEach((variation: any) => {
          if (variation.attributes) {
            attributesByVariation[variation.id] = variation.attributes;
          }
        });

        // Agrupar atributos únicos
        const groupedAttributes: { [key: string]: Set<string> } = {};
        Object.values(attributesByVariation).forEach((attrs) => {
          attrs.forEach((attr) => {
            if (!groupedAttributes[attr.label]) {
              groupedAttributes[attr.label] = new Set();
            }
            groupedAttributes[attr.label].add(attr.value);
          });
        });

        // Convertir a formato final y ordenar
        const sortedAttributes: { [key: string]: string[] } = {};
        Object.keys(groupedAttributes).forEach((key) => {
          sortedAttributes[key] = sortAttributes(
            key,
            Array.from(groupedAttributes[key])
          );
        });

        console.log("Processed attributes:", sortedAttributes); // Debug log
        setCurrentAttributes(sortedAttributes);

        // Primero establecemos los datos básicos
        const baseSku = variations.find((sku: any) => sku.isBaseSku);
        if (baseSku) {
          setMainImageUrl(baseSku.mainImageUrl);
          setProductName(baseSku.product.name);
          setEnabledForDelivery(baseSku.product.enabledForDelivery);
          setEnabledForWithdrawal(baseSku.product.enabledForWithdrawal);
          setDescription(baseSku.product.description);
          setReviewAverageScore(baseSku.product.reviewAverageScore);
          setTotalReviews(baseSku.product.totalReviews);

          if (baseSku.product.productTypes) {
            setCategories(
              baseSku.product.productTypes.map((type: any) => type.name)
            );
          }
        }

        // Procesar variaciones y atributos
        const processVariations = async () => {
          const pricesByVariation: { [key: string]: number | null } = {};

          // Obtener precios de manera segura
          if (variations.length > 0) {
            const variation = variations[0];
            if (variation.pricings && variation.pricings.length > 0) {
              pricesByVariation[variation.id] = variation.pricings[0].unitPrice;
            } else {
              pricesByVariation[variation.id] = null;
            }
          }

          // Actualizar estados
          setCurrentPrices(pricesByVariation);

          // Establecer precios min/max
          const validPrices = Object.values(pricesByVariation).filter(
            (price): price is number => price !== null && !isNaN(price)
          );
          if (validPrices.length > 0) {
            setMinPrice(Math.min(...validPrices).toString());
            setMaxPrice(Math.max(...validPrices).toString());
          }
        };

        processVariations().finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error processing initial product data:", error);
        setIsLoading(false);
      }
    }
  }, [initialProduct]);

  const customOrder = ["XS", "S", "M", "L", "XL", "XXL"];

  const sortAttributes = (attributeName: string, values: string[]) => {
    // Función auxiliar para extraer números de un rango
    const extractRange = (value: string) => {
      // Intenta encontrar números en formato "X-Y" o "X a Y"
      const numbers = value.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        return {
          start: parseInt(numbers[0]),
          end: parseInt(numbers[1])
        };
      }
      return null;
    };

    // Verifica si los valores son rangos
    const containsRanges = values.some(value => 
      value.includes('-') || value.toLowerCase().includes(' a ')
    );

    if (containsRanges) {
      return values.sort((a, b) => {
        const rangeA = extractRange(a);
        const rangeB = extractRange(b);
        
        if (rangeA && rangeB) {
          // Ordena por el número inicial del rango
          return rangeA.start - rangeB.start;
        }
        return a.localeCompare(b);
      });
    }

    // Si no son rangos, intenta convertir todos los valores a números
    const allValuesAreNumbers = values.every((value) => !isNaN(Number(value)));

    if (allValuesAreNumbers) {
      return values.sort((a, b) => Number(a) - Number(b));
    }

    if (
      attributeName.toLowerCase() === "talla" ||
      attributeName.toLowerCase() === "tallas" ||
      attributeName.toLowerCase() === "tamaño" ||
      attributeName.toLowerCase() === "tamaños"
    ) {
      const customOrder = ["XS", "S", "M", "L", "XL", "XXL"];
      return values.sort((a, b) => {
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return values.sort((a, b) => a.localeCompare(b));
  };
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  const [variationsQuantity, setVariationsQuantity] = useState(0);

  const groupAttributesByLabel = (attributesByVariation: {
    [key: string]: any[];
  }) => {
    const groupedAttributes: { [key: string]: Set<string> } = {};

    Object.values(attributesByVariation).forEach((attributes) => {
      attributes.forEach((attribute) => {
        if (!groupedAttributes[attribute.label]) {
          groupedAttributes[attribute.label] = new Set();
        }
        groupedAttributes[attribute.label].add(attribute.value);
      });
    });

    const result: { [key: string]: string[] } = {};
    Object.keys(groupedAttributes).forEach((key) => {
      result[key] = Array.from(groupedAttributes[key]);
    });

    return result;
  };

  const updateDisabledAttributes = useCallback(() => {
    const disabledAttrs: { [key: string]: boolean[] } = {};
    
    Object.keys(currentAttributes).forEach((attributeName) => {
      disabledAttrs[attributeName] = currentAttributes[attributeName].map((value) => {
        return !variations.some((variation) => {
          const attributesMatch = Object.keys(selectedAttributes).every((key) => {
            if (key === attributeName) {
              return true;
            }
            const attribute = variation.attributes.find((attr) => attr.label === key);
            return attribute && attribute.value === selectedAttributes[key];
          });

          const attribute = variation.attributes.find((attr) => attr.label === attributeName);
          return attributesMatch && attribute && attribute.value === value;
        });
      });
    });

    setDisabledAttributes(disabledAttrs);
  }, [currentAttributes, selectedAttributes, variations]);

  useEffect(() => {
    updateDisabledAttributes();
  }, [selectedAttributes, updateDisabledAttributes]);

  useEffect(() => {
    console.log("Selected attributes changed:", selectedAttributes);
    console.log("Current variations:", variations);

    const matchingVariation = variations.find((variation) => {
      const matches = Object.keys(selectedAttributes).every((key) => {
        const attribute = variation.attributes.find(
          (attr) => attr.label === key
        );
        const isMatch =
          attribute && attribute.value === selectedAttributes[key];
        console.log(`Checking attribute ${key}:`, { attribute, isMatch });
        return isMatch;
      });
      console.log("Variation matches:", matches);
      return matches;
    });

    console.log("Found matching variation:", matchingVariation);

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      // Actualizar el precio según la variación seleccionada
      if (matchingVariation.pricings && matchingVariation.pricings.length > 0) {
        console.log(
          "Setting price from pricings:",
          matchingVariation.pricings[0].unitPrice
        );
        setSelectedVariationPrice(matchingVariation.pricings[0].unitPrice);
      } else {
        console.log(
          "No pricings found, using currentPrices:",
          currentPrices[matchingVariation.id]
        );
        setSelectedVariationPrice(currentPrices[matchingVariation.id] || null);
      }

      if (matchingVariation.mainImageUrl) {
        setMainImageUrl(matchingVariation.mainImageUrl);
        setSelectedThumbnail(matchingVariation.mainImageUrl);
      }

      if (matchingVariation.isBaseSku) {
        setDescription(matchingVariation.product.description);
      } else {
        setDescription(
          matchingVariation.description || matchingVariation.product.description
        );
      }

      fetchThumbnails(matchingVariation.product.id, matchingVariation.id);
    } else {
      const baseSku = variations.find((v) => v.isBaseSku);
      if (baseSku) {
        setSelectedVariation(null);
        if (baseSku.pricings && baseSku.pricings.length > 0) {
          console.log("Setting base price:", baseSku.pricings[0].unitPrice);
          setSelectedVariationPrice(baseSku.pricings[0].unitPrice);
        } else {
          setSelectedVariationPrice(null);
        }
        setMainImageUrl(baseSku.mainImageUrl);
        setDescription(baseSku.product.description);
        setSelectedThumbnail(baseSku.mainImageUrl);
        fetchThumbnails(baseSku.product.id, baseSku.id);
      }
    }
  }, [selectedAttributes, variations]);

  const fetchAttributesForVariation = async (variationId: string) => {
    try {
      // Obtener el ID del producto base
      const baseSku = variations.find((sku: any) => sku.isBaseSku);
      const productId = baseSku?.product?.id || id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${variationId}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const responseData = await response.json();
      if (responseData.code === 0) {
        console.log(
          `Atributos obtenidos para variación ${variationId}:`,
          responseData.skuAttributes
        ); // Debug log
        return responseData.skuAttributes.map((skuAttribute: any) => ({
          value: skuAttribute.value,
          label: skuAttribute.attribute.name,
        }));
      }
    } catch (error) {
      console.error(
        `Error al obtener los atributos de la variación ${variationId}:`,
        error
      );
    }
    return null;
  };

  const fetchPriceForVariation = async (productId: string, skuId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const data = await response.json();
      if (data.code === 0) {
        const price =
          data.skuPricings.length > 0 ? data.skuPricings[0].unitPrice : null;
        return price;
      }
    } catch (error) {
      console.error("Error al obtener el precio de la variación:", error);
    }
    return null;
  };
  const calculateDiscount = (originalPrice: number, offerPrice: number) => {
    const discount = ((originalPrice - offerPrice) / originalPrice) * 100;
    return Math.floor(discount);
  };

  const discountPercentage =
    selectedVariation &&
    selectedVariationPrice !== null &&
    selectedVariation.offers?.length > 0
      ? calculateDiscount(
          selectedVariationPrice,
          selectedVariation.offers[0].unitPrice
        )
      : 0; // O cualquier valor por defecto que prefieras

  const fetchOffersForVariation = async (productId: string, skuId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const data = await response.json();
      if (data.code === 0) {
        const offers = data.sku.offers;
        if (offers.length > 0) {
          return offers[0];
        } else {
          const productResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          );
          const productData = await productResponse.json();
          if (productData.code === 0 && productData.offers.length > 0) {
            return productData.offers[0];
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener las ofertas de la variación:", error);
    }
    return null;
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    setSelectedAttributes((prevAttributes) => {
      const newAttributes = { ...prevAttributes };

      if (newAttributes[attribute] === value) {
        delete newAttributes[attribute];
        setCurrentSlide(0);
        const baseSku = initialProduct.skus.find((sku: any) => sku.isBaseSku);
        if (baseSku) {
          setSelectedThumbnail(baseSku.mainImageUrl);
          // Resetear el precio al precio base
          if (baseSku.pricings && baseSku.pricings.length > 0) {
            setSelectedVariationPrice(baseSku.pricings[0].unitPrice);
          } else {
            setSelectedVariationPrice(null);
          }
        }
      } else {
        // Reinicia solo los atributos relacionados de la misma categoría
        Object.keys(newAttributes).forEach((key) => {
          if (key === attribute) {
            delete newAttributes[key];
          }
        });
        // Asigna el nuevo valor al atributo seleccionado
        newAttributes[attribute] = value;
      }

      // Verifica si la nueva combinación es válida
      const matchingVariation = variations.find((variation) => {
        return Object.keys(newAttributes).every((key) => {
          const attribute = variation.attributes.find(
            (attr) => attr.label === key
          );
          return attribute && attribute.value === newAttributes[key];
        });
      });

      if (matchingVariation) {
        if (
          matchingVariation.pricings &&
          matchingVariation.pricings.length > 0
        ) {
          setSelectedVariationPrice(matchingVariation.pricings[0].unitPrice);
        } else {
          setSelectedVariationPrice(
            currentPrices[matchingVariation.id] || null
          );
        }
      } else {
        Object.keys(newAttributes).forEach((key) => {
          if (key !== attribute) {
            delete newAttributes[key];
          }
        });
      }

      setAttributeSelected(Object.keys(newAttributes).length > 0);
      return newAttributes;
    });
  };

  const handleAddToCart = () => {
    if (!areAllAttributesSelected() && hasVariations) {
      toast.error("Selecciona Variación para agregar al carrito.");
      return;
    }

    if (selectedVariation) {
      addToCartHandler(selectedVariation.id, quantity);
    } else if (!hasVariations) {
      // Si no hay variaciones, usar el ID del producto base
      const baseSku = variations.find((v) => v.isBaseSku);
      if (baseSku) {
        addToCartHandler(baseSku.id, quantity);
      } else {
        addToCartHandler(id as string, quantity);
      }
    } else {
      console.error("No se ha seleccionado una variación válida.");
    }
  };

  const areAllAttributesSelected = () => {
    if (!variations.length) return true;

    const requiredAttributes = Object.keys(currentAttributes);
    const selectedAttributesKeys = Object.keys(selectedAttributes);

    if (selectedAttributesKeys.length !== requiredAttributes.length) {
      return false;
    }

    const matchingVariation = variations.find((variation) => {
      return variation.attributes.every((attr) => {
        return selectedAttributes[attr.label] === attr.value;
      });
    });

    return !!matchingVariation;
  };

  const hasAttributes = () => {
    const attributeCount = Object.keys(currentAttributes).length;
    console.log("Current attributes count:", attributeCount); // Debug log
    return attributeCount > 0;
  };
  const IconosData = [
    "/img/iconos/hechoamano.png",
    "/img/iconos/plata950.png",
    "/img/iconos/unico.png",
    "/img/iconos/emprendedora.png",
    "/img/iconos/slowfashion.png",
    "/img/iconos/conamor.png",
  ];

  // Mover la lógica del useEffect fuera del condicional
  useEffect(() => {
    const fetchCuotasConfig = async () => {
      // Si no hay producto inicial, no hacer nada
      if (!initialProduct) return;

      try {
        const contentBlockId = process.env.NEXT_PUBLIC_CUOTAS_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        console.log("dataCOUTAS", response.data);
        if (response.data.contentBlock?.contentText) {
          const cuotasConfig = JSON.parse(response.data.contentBlock.contentText);
          setCuotasEnabled(cuotasConfig.enabled);
          setNumeroCuotas(cuotasConfig.enabled ? parseInt(cuotasConfig.installments) : 0);
        }
      } catch (error) {
        console.error("Error al obtener configuración de cuotas:", error);
        setCuotasEnabled(false);
        setNumeroCuotas(0);
      }
    };

    fetchCuotasConfig();
  }, [initialProduct]); // Agregar initialProduct como dependencia

  // Modificar el renderizado condicional
  if (!initialProduct) {
    return <div>Cargando...</div>;
  }

  // Modificar la función renderPrice para incluir la lógica de cuotas
  const renderPrice = () => {
    // Para variación seleccionada
    if (selectedVariation) {
      const normalPrice = selectedVariation.pricings?.[0]?.unitPrice;
      const offerPrice = selectedVariation.offers?.[0]?.unitPrice;

      // Calcular el precio por cuota solo si las cuotas están habilitadas
      const precioBase = offerPrice || normalPrice;
      const precioPorCuota = precioBase && cuotasEnabled ? Math.ceil(precioBase / numeroCuotas) : 0;

      // Si tiene oferta, mostrar ambos precios
      if (offerPrice) {
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="font-bold text-primary text-3xl line-through mr-2">
                ${normalPrice.toLocaleString("es-CL")}
              </span>
              <span className="text-white text-xl font-semibold bg-primary h-8 px-2 rounded">
                Dcto. {calculateDiscount(normalPrice, offerPrice)}%
              </span>
            </div>
            <span className="font-bold text-red-700 text-3xl mr-2">
              ${offerPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés de ${precioPorCuota.toLocaleString("es-CL")}
                </span>
              </>
            )}
          </div>
        );
      }

      // Si no tiene oferta, mostrar solo el precio normal
      if (normalPrice) {
        return (
          <div className="flex flex-col">
            <span className="font-bold text-primary text-3xl">
              ${normalPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés de ${precioPorCuota.toLocaleString("es-CL")}
                </span>
              </>
            )}
          </div>
        );
      }
    }

    // Para productos con variaciones sin selección específica
    if (variations.length > 1) {
      const normalPrices = variations
        .map((v) => v.pricings?.[0]?.unitPrice)
        .filter((p): p is number => p !== undefined && p > 0);

      const offerPrices = variations
        .map((v) => v.offers?.[0]?.unitPrice)
        .filter((p): p is number => p !== undefined && p > 0);

      // Si hay ofertas, mostrar ambos rangos de precios
      if (offerPrices.length > 0) {
        const minNormalPrice = Math.min(...normalPrices);
        const maxNormalPrice = Math.max(...normalPrices);
        const minOfferPrice = Math.min(...offerPrices);
        const maxOfferPrice = Math.max(...offerPrices);

        // Calcular el descuento más alto
        const maxDiscount = Math.max(
          ...variations
            .filter(v => v.pricings?.[0]?.unitPrice && v.offers?.[0]?.unitPrice)
            .map(v => calculateDiscount(v.pricings[0].unitPrice, v.offers![0].unitPrice))
        );

        // Calcular cuotas para el precio mínimo
        const minPrecioPorCuota = cuotasEnabled ? Math.ceil(minOfferPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="font-bold text-primary text-3xl line-through">
                {minNormalPrice === maxNormalPrice
                  ? `$${minNormalPrice.toLocaleString("es-CL")}`
                  : `$${minNormalPrice.toLocaleString("es-CL")} - $${maxNormalPrice.toLocaleString("es-CL")}`}
              </span>
              <span className="text-white text-xl font-semibold bg-primary h-8 px-2 rounded">
                Dcto. {maxDiscount}%
              </span>
            </div>
            <span className="font-bold text-red-700 text-3xl">
              {minOfferPrice === maxOfferPrice
                ? `$${minOfferPrice.toLocaleString("es-CL")}`
                : `$${minOfferPrice.toLocaleString("es-CL")} - $${maxOfferPrice.toLocaleString("es-CL")}`}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés desde ${minPrecioPorCuota.toLocaleString("es-CL")}
                </span>
              </>
            )}
          </div>
        );
      }

      // Si no hay ofertas, mostrar rango de precios normal
      if (normalPrices.length > 0) {
        const minPrice = Math.min(...normalPrices);
        const maxPrice = Math.max(...normalPrices);
        const minPrecioPorCuota = cuotasEnabled ? Math.ceil(minPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <span className="font-bold text-primary text-3xl">
              {minPrice === maxPrice
                ? `$${minPrice.toLocaleString("es-CL")}`
                : `$${minPrice.toLocaleString("es-CL")} - $${maxPrice.toLocaleString("es-CL")}`}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés desde ${minPrecioPorCuota.toLocaleString("es-CL")}
                </span>
              </>
            )}
          </div>
        );
      }
    }

    return "Precio no disponible";
  };

  return (
    <>
      <div className="max-w-7xl mx-auto  sm:px-2 lg:px-8 mt-6 md:mt-16">
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 animate-pulse pb-32">
            <div className="flex flex-col md:flex-row -mx-4">
              <div className="md:flex-1 px-4">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col justify-center items-center space-y-2 mr-4">
                    <div className="flex flex-col gap-4 justify-start items-center">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="w-[500px] h-[500px] bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="md:flex-1 px-4 ml-4 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-10 w-10 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row ">
            <div className="md:flex-1 px-4">
              <div className="md:hidden">
                <h1 className="mb-2 leading-tight tracking-tight font-bold text-gray-800 text-2xl md:text-3xl">
                  {productName}
                </h1>
                <p className="text-gray-500 text-sm flex gap-3">
                  Categoría: {categories.join(", ")}
                  {isReviewEnabled && reviewAverageScore !== null && totalReviews !== null && (
                    <span className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < reviewAverageScore
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885 a1 1 0 00.95-.69L9.049.775z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-gray-600">
                        {reviewAverageScore} ({totalReviews})
                      </span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-row items-start justify-center">
                <div className="hidden md:flex md:flex-col gap-4 mr-4 justify-center h-[500px]">
                  {thumbnails.map((thumbnail, index) => (
                    <img
                      key={thumbnail.id}
                      src={thumbnail.imageUrl}
                      alt="Miniatura"
                      className={`object-cover cursor-pointer shadow-md ${
                        selectedThumbnail === thumbnail.imageUrl
                          ? "border-2 border-primary"
                          : ""
                      }`}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "var(--radius)",
                      }}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>

                <div
                  className="hidden md:block w-full md:w-[500px] md:h-[500px] bg-gray-100 flex items-center justify-center shadow-md"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <img
                    src={selectedThumbnail || mainImageUrl}
                    alt="Producto"
                    className="object-cover max-w-full h-auto md:h-full md:w-full rounded-lg"
                  />
                </div>
              </div>
              <div className="md:hidden mt-4">{renderMobileThumbnails()}</div>
            </div>

            <div className="md:flex-1 px-4 ml-4 md:ml-24 lg:ml-4 mt-2 md:mt-8">
              <div className="hidden md:block">
                <h1 className="mb-2 leading-tight tracking-tight font-bold text-gray-800 text-2xl md:text-3xl">
                  {productName}
                </h1>

                <p className="text-gray-500 text-sm flex gap-3">
                  Categoría: {categories.join(", ")}
                  {isReviewEnabled && reviewAverageScore !== null && totalReviews !== null && (
                    <span className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < reviewAverageScore
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885 a1 1 0 00.95-.69L9.049.775z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-gray-600">
                        {Math.floor(reviewAverageScore * 10) / 10} (
                        {totalReviews})
                      </span>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-4 my-4">
                <div className="rounded-lg flex py-2 pr-3">
                  <div className="font-bold text-primary text-3xl">
                    {renderPrice()}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Acerca del producto
                </h3>
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: description }} />
              </div>

              {/* Sección de variaciones */}
              {hasAttributes() && (
                <div className="mt-4 border-t border-gray-100">
                  <div className="flex flex-col space-y-4 mt-2">
                    {Object.entries(currentAttributes).map(
                      ([attributeName, attributeValues]) => (
                        <div key={attributeName}>
                          <h4 className="text-primary font-semibold">
                            {capitalizeFirstLetter(attributeName)}:
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {attributeValues.map((value, index) => {
                              const isSelected =
                                selectedAttributes[attributeName] === value;
                              const isDisabled = disabledAttributes[attributeName]?.[index];

                              return (
                                <button
                                  key={value}
                                  onClick={() =>
                                    handleAttributeChange(attributeName, value)
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary text-white"
                                      : isDisabled
                                      ? "border-gray-300 bg-gray-100 text-gray-400 border-2 border-dashed "
                                      : "border-gray-200 hover:border-primary"
                                  }`}
                            /*       disabled={isDisabled} */
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Sección de delivery y retiro */}
              <div className="mt-10 flex flex-col md:flex-row md:items-start">
                <div className="flex flex-col w-full">
                  <p>
                    {enabledForDelivery ? (
                      <div className="flex mb-2">
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                            />
                          </svg>
                        </span>
                        <small className="px-2 text-black self-center">
                          Disponible para Delivery
                        </small>
                      </div>
                    ) : (
                      <div className="flex">
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                            />
                          </svg>
                        </span>
                        <small className="px-2 text-red-800 self-center">
                          Delivery No Disponible
                        </small>
                      </div>
                    )}
                  </p>
                  <p>
                    {enabledForWithdrawal ? (
                      <div className="flex mb-2">
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                            />
                          </svg>
                        </span>
                        <small className="px-2 text-black self-center">
                          Disponible para Retiro
                        </small>
                      </div>
                    ) : (
                      <div className="flex">
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                            />
                          </svg>
                        </span>
                        <small className="px-2 text-red-800 self-center">
                          Retiro No Disponible
                        </small>
                      </div>
                    )}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 w-full flex justify-start">
                  <img
                    src="/img/pixelup/wplus.svg"
                    className="h-10 px-2"
                    alt="LogoWebpay"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 py-4 items-center mt-4">
                {variationsQuantity <= 1 && (stock === 0 || stock === null) ? (
                  <span className="text-red-600 font-bold">
                    No hay existencias
                  </span>
                ) : (
                  <div className="w-full flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="text-[0.5rem] uppercase text-gray-400 tracking-wide font-semibold">
                        Cantidad
                      </div>
                      <div className="relative w-[80px]">
                        <select
                          onChange={(e) =>
                            setQuantity(parseInt(e.target.value))
                          }
                          className="cursor-pointer w-full appearance-none rounded-xl border border-gray-200 h-8 flex items-center justify-center text-center text-base"
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <option
                              className="text-center"
                              key={i}
                            >
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-14 px-6 py-2 text-[0.8rem] md:text-md font-semibold rounded-xl bg-primary text-white hover:bg-secondary hover:text-primary"
                    >
                      {hasVariations &&
                      (!attributeSelected || !areAllAttributesSelected())
                        ? "Agregar al Carrito"
                        : "Agregar al Carrito"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Destacados01 text="TE PUEDE GUSTAR" />
        {isReviewEnabled && (
          <Stars
            reviewAverageScore={reviewAverageScore}
            totalReviews={totalReviews}
            productId={selectedVariation?.product?.id || initialProduct?.skus?.[0]?.product?.id}
          />
        )}
      </div>
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-4xl"
            >
              &times;
            </button>
            <img
              src="/img/Tabladetallas/TabladeTallas.webp"
              alt="Tabla de Tallas"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: "80vw", maxHeight: "80vh" }}
            />
          </div>
        </div>
      )}
      {showPaymentModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Métodos de Pago</h3>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Tarjetas de crédito</h4>
                  <p className="text-sm text-gray-600 mb-2">Acreditación instantánea.</p>
                  <p className="text-sm text-green-500 font-medium mb-2">
                    Paga en {numeroCuotas} cuotas sin interés con estas tarjetas
                  </p>
                  <p className="text-sm text-gray-600 mb-3">Con todos los bancos.</p>
                  <div className="flex gap-4">
                    <img 
                      src="/images/Tarjetas/visa.png" 
                      alt="Visa" 
                      className="h-10" 
                    />
                    <img src="/images/Tarjetas/mastercard.png" alt="Mastercard" className="h-10" />
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Tarjetas de débito</h4>
                  <p className="text-sm text-gray-600">Acreditación instantánea.</p>
                  <div className="flex gap-4 mt-2">
                  <img 
                      src="/images/Tarjetas/visa.png" 
                      alt="Visa" 
                      className="h-10" 
                    />
                    <img src="/images/Tarjetas/mastercard.png" alt="Mastercard" className="h-10" />
                    <img src="/images/Tarjetas/redcompra.webp" alt="Webpay" className="h-10" />

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail01;
