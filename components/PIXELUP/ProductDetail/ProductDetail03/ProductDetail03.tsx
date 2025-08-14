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

interface ProductDetail03Props {
  product: any;
}

const ProductDetail03: React.FC<ProductDetail03Props> = ({
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
    const fetchCuotasConfig = async () => {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_CUOTAS_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
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
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      if (selectedVariation) {
        await fetchStockForVariation(
          selectedVariation.product.id,
          selectedVariation.id
        );
      }
    };

    fetchStockData();
  }, [selectedVariation, fetchStockForVariation]);

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
      const baseSku = initialProduct?.skus?.find((sku: any) => sku.isBaseSku);
      
      if (!selectedVariation && baseSku) {
        setCurrentSlide(0);
        setSelectedThumbnail(baseSku.mainImageUrl);
        await fetchThumbnails(baseSku.product.id, baseSku.id);
      } else if (selectedVariation) {
        await fetchThumbnails(
          selectedVariation.product.id,
          selectedVariation.id
        );
      }
    };

    resetToBaseProduct();
  }, [selectedVariation, initialProduct?.skus, fetchThumbnails]);

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

  const renderThumbnails = () => {
    return (
      <>
        {/* Carrusel deslizable solo para pantallas pequeñas */}
        <div className="container mx-auto">
          <div className="relative max-w-4xl mx-auto overflow-hidden">
            <button
              className="lg:hidden absolute top-1/2 left-0 transform -translate-y-1/2 bg-[#4D4D4D] text-white p-2 z-10"
              onClick={() => moveSlide(-1)}
            >
              &#10094;
            </button>
            <div
              className="slider flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="slide min-w-full box-border"
                >
                  <img
                    src={thumbnail.imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full"
                    style={{
                      borderRadius: "var(--radius)",
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              className="lg:hidden absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#4D4D4D] text-white p-2 z-10"
              onClick={() => moveSlide(1)}
            >
              &#10095;
            </button>
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
                    width: "18%",
                    height: "auto",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Visualización original para pantallas más grandes */}
        {/*         <div className="hidden md:flex md:flex-col gap-4 justify-center items-center md:items-start mt-4 md:mt-0 md:mr-4">
          {thumbnails.map((thumbnail, index) => (
            <img
              key={thumbnail.id}
              src={thumbnail.imageUrl}
              alt="Miniatura"
              className={`object-cover cursor-pointer shadow-md ${
                selectedThumbnail === thumbnail.imageUrl
                  ? "border-2 border-blue-500"
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
        </div> */}
      </>
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
    // Intentamos convertir todos los valores a números primero.
    const allValuesAreNumbers = values.every((value) => !isNaN(Number(value)));

    if (allValuesAreNumbers) {
      // Ordena todos los valores como números si todos son numéricos.
      return values.sort((a, b) => Number(a) - Number(b));
    }

    // Si no todos son números, aplicamos el orden personalizado o alfabético.
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

    // Ordena lexicográficamente si no es un atributo de talla.
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
      disabledAttrs[attributeName] = currentAttributes[attributeName].map(
        (value) => {
          return !variations.some((variation) => {
            const attributesMatch = Object.keys(selectedAttributes).every(
              (key) => {
                if (key === attributeName) {
                  return true;
                }
                const attribute = variation.attributes.find(
                  (attr) => attr.label === key
                );
                return attribute && attribute.value === selectedAttributes[key];
              }
            );

            const attribute = variation.attributes.find(
              (attr) => attr.label === attributeName
            );
            return attributesMatch && attribute && attribute.value === value;
          });
        }
      );
    });

    setDisabledAttributes(disabledAttrs);
  }, [currentAttributes, selectedAttributes, variations]);

  useEffect(() => {
    updateDisabledAttributes();
  }, [selectedAttributes, updateDisabledAttributes]);

  useEffect(() => {
    const updateVariationAndPrice = () => {
      const matchingVariation = variations.find((variation) => {
        return Object.keys(selectedAttributes).every((key) => {
          const attribute = variation.attributes.find(
            (attr) => attr.label === key
          );
          return attribute && attribute.value === selectedAttributes[key];
        });
      });

      if (matchingVariation) {
        setSelectedVariation(matchingVariation);
        if (matchingVariation.pricings && matchingVariation.pricings.length > 0) {
          setSelectedVariationPrice(matchingVariation.pricings[0].unitPrice);
        } else {
          setSelectedVariationPrice(currentPrices[matchingVariation.id] || null);
        }

        setMainImageUrl(matchingVariation.mainImageUrl);
        setSelectedThumbnail(matchingVariation.mainImageUrl);
        setDescription(
          matchingVariation.isBaseSku 
            ? matchingVariation.product.description 
            : matchingVariation.description || matchingVariation.product.description
        );
      } else {
        const baseSku = variations.find((v) => v.isBaseSku);
        if (baseSku) {
          setSelectedVariation(null);
          setSelectedVariationPrice(
            baseSku.pricings?.[0]?.unitPrice || null
          );
          setMainImageUrl(baseSku.mainImageUrl);
          setDescription(baseSku.product.description);
          setSelectedThumbnail(baseSku.mainImageUrl);
        }
      }
    };

    updateVariationAndPrice();
  }, [selectedAttributes, variations, currentPrices]);

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
  // Modificar la renderización para mostrar el skeleton solo cuando sea necesario
  if (!initialProduct) {
    return <div>Cargando...</div>;
  }

  const renderPrice = () => {
    // Para variación seleccionada con oferta
    if (selectedVariation) {
      if (selectedVariation.offers?.length > 0) {
        const normalPrice = selectedVariationPrice;
        const offerPrice = selectedVariation.offers[0].unitPrice;
        const precioPorCuota = offerPrice && cuotasEnabled ? Math.ceil(offerPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <div className="rounded-lg flex py-2 px-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-gray-500 line-through">
                    ${normalPrice?.toLocaleString('es-CL')}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded h-fit">
                    {discountPercentage}% Dcto.
                  </span>
                </div>
                <span className="text-2xl font-medium text-red-600">
                  ${offerPrice.toLocaleString('es-CL')}
                </span>
                {cuotasEnabled && numeroCuotas > 0 && (
                  <>
                    <span className="text-sm text-green-500 mt-1 font-medium">
                      En {numeroCuotas} cuotas sin interés de ${precioPorCuota.toLocaleString("es-CL")}
                    </span>
{/*                     <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="text-sm font-light text-blue-800 hover:text-blue-600 hover:underline mt-4 text-left"
                    >
                      Ver métodos de pago
                    </button> */}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Si no tiene oferta, mostrar solo el precio normal
      if (selectedVariationPrice) {
        const precioPorCuota = cuotasEnabled ? Math.ceil(selectedVariationPrice / numeroCuotas) : 0;
        return (
          <div className="flex flex-col">
            <span className="text-2xl">
              ${selectedVariationPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés de ${precioPorCuota.toLocaleString("es-CL")}
                </span>
{/*                 <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="text-sm font-light text-blue-800 hover:text-blue-600 hover:underline mt-4 text-left"
                >
                  Ver métodos de pago
                </button> */}
              </>
            )}
          </div>
        );
      }
    }

    // Para productos con variaciones y ofertas (cuando no hay variación seleccionada)
    if (variations.length > 1) {
      // Obtener todos los precios normales y de oferta válidos
      const normalPrices = variations
        .map(v => v.pricings?.[0]?.unitPrice)
        .filter((p): p is number => p !== undefined && p > 0);
      
      const offerPrices = variations
        .map(v => v.offers?.[0]?.unitPrice)
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
            .filter(v => v.offers?.[0]?.unitPrice && v.pricings?.[0]?.unitPrice)
            .map(v => calculateDiscount(v.pricings[0].unitPrice, v.offers![0].unitPrice))
        );

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-gray-500 line-through">
                {minNormalPrice === maxNormalPrice
                  ? `$${minNormalPrice.toLocaleString("es-CL")}`
                  : `$${minNormalPrice.toLocaleString("es-CL")} - $${maxNormalPrice.toLocaleString("es-CL")}`
                }
              </span>
              <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded h-fit">
                {maxDiscount}% Dcto.
              </span>
            </div>
            <span className="text-2xl font-medium text-red-600">
              {minOfferPrice === maxOfferPrice
                ? `$${minOfferPrice.toLocaleString("es-CL")}`
                : `$${minOfferPrice.toLocaleString("es-CL")} - $${maxOfferPrice.toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés desde ${Math.ceil(minOfferPrice / numeroCuotas).toLocaleString("es-CL")}
                </span>
{/*                 <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="text-sm font-light text-blue-800 hover:text-blue-600 hover:underline mt-4 text-left"
                >
                  Ver métodos de pago
                </button> */}
              </>
            )}
          </div>
        );
      }

      // Si no hay ofertas, mostrar rango de precios normal
      if (normalPrices.length > 0) {
        const minPrice = Math.min(...normalPrices);
        const maxPrice = Math.max(...normalPrices);
        const precioPorCuota = cuotasEnabled ? Math.ceil(minPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <span className="text-2xl">
              {minPrice === maxPrice
                ? `$${minPrice.toLocaleString("es-CL")}`
                : `$${minPrice.toLocaleString("es-CL")} - $${maxPrice.toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <>
                <span className="text-sm text-green-500 mt-1 font-medium">
                  En {numeroCuotas} cuotas sin interés desde ${precioPorCuota.toLocaleString("es-CL")}
                </span>
{/*                 <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="text-sm font-light text-blue-800 hover:text-blue-600 hover:underline mt-4 text-left"
                >
                  Ver métodos de pago
                </button> */}
              </>
            )}
          </div>
        );
      }
    }

    // Para precio base sin variaciones
    if (minPrice && maxPrice && !isNaN(parseFloat(minPrice)) && !isNaN(parseFloat(maxPrice))) {
      const minPriceNum = parseFloat(minPrice);
      const maxPriceNum = parseFloat(maxPrice);
      const precioPorCuota = cuotasEnabled ? Math.ceil(minPriceNum / numeroCuotas) : 0;

      return (
        <div className="flex flex-col">
          <span className="text-2xl">
            {minPriceNum === maxPriceNum
              ? `$${minPriceNum.toLocaleString("es-CL")}`
              : `$${minPriceNum.toLocaleString("es-CL")} - $${maxPriceNum.toLocaleString("es-CL")}`
            }
          </span>
          {cuotasEnabled && numeroCuotas > 0 && (
            <>
              <span className="text-sm text-green-500 mt-1 font-medium">
                En {numeroCuotas} cuotas sin interés desde ${precioPorCuota.toLocaleString("es-CL")}
              </span>
{/*               <button 
                onClick={() => setShowPaymentModal(true)}
                className="text-sm font-light text-blue-800 hover:text-blue-600 hover:underline mt-4 text-left"
              >
                Ver métodos de pago
              </button> */}
            </>
          )}
        </div>
      );
    }

    return "Precio no disponible";
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid principal del producto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda - Imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square w-full">
              <img
                src={selectedThumbnail || mainImageUrl}
                alt={productName}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            {/* Grid de 4 imágenes */}
            <div className="grid grid-cols-2 gap-4">
              {thumbnails
                .filter(thumbnail => thumbnail.imageUrl !== selectedThumbnail)
                .slice(0, 4)
                .map((thumbnail) => (
                  <div 
                    key={thumbnail.id}
                    className={`aspect-square cursor-pointer rounded-lg overflow-hidden ${
                      selectedThumbnail === thumbnail.imageUrl ? 'ring-2 ring-blue-600' : ''
                    }`}
                    onClick={() => setSelectedThumbnail(thumbnail.imageUrl)}
                  >
                    <img
                      src={thumbnail.imageUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* Columna derecha - Información con sticky positioning */}
          <div className="relative">
            <div className="sticky top-4 space-y-6">
              {/* Título y precio */}
              <div>
                <h1 className="text-2xl font-medium mb-2">{productName}</h1>
                {reviewAverageScore && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(reviewAverageScore) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-gray-600">
                        {reviewAverageScore} ({totalReviews})
                      </span>
                  </div>
                )}


                
                <div className="flex items-center gap-2">
                  {renderPrice()}
                </div>
              </div>

              {/* Selectores de color y talla */}
              {Object.entries(currentAttributes).map(([attributeName, values]) => (
                <div key={attributeName}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{capitalizeFirstLetter(attributeName)}</span>
                    {attributeName.toLowerCase().includes('talla') && (
                      <button className="text-sm text-blue-600" onClick={() => setShowModal(true)}>
                        Ver guía de tallas
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {values.map((value, index) => {
                      const isDisabled = disabledAttributes[attributeName]?.[index] || false;
                      return (
                        <button
                          key={value}
                          onClick={() => handleAttributeChange(attributeName, value)}
                          className={`px-3 py-1 min-w-[48px] h-12 flex items-center justify-center border rounded-lg ${
                            selectedAttributes[attributeName] === value
                              ? 'border-black bg-black text-white'
                              : isDisabled
                              ? ' bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Botón de agregar al carrito */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-secondary py-4 rounded-lg font-medium hover:bg-secondary hover:text-primary"
              >
                {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
              </button>

              {/* Descripción */}
              <div className="border-t pt-6">
                <h2 className="font-medium mb-4">Descripción</h2>
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: description }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sección "Te puede gustar" */}
        <div className="mt-16">
          <Destacados01 text="TE PUEDE GUSTAR" />
          {isReviewEnabled && (
            <Stars
              reviewAverageScore={reviewAverageScore}
              totalReviews={totalReviews}
              productId={selectedVariation?.product?.id || initialProduct?.skus?.[0]?.product?.id}
            />
          )}
        </div>

      </div>

      {/* Modal de guía de tallas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Guía de tallas</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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
            {/* Aquí puedes agregar el contenido de tu guía de tallas */}
            <div className="prose">
              <p>Contenido de la guía de tallas...</p>
            </div>
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

export default ProductDetail03;