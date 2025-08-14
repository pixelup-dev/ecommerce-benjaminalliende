/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type ProductCardProps = {
  key: any;
  product: any;
  addToCartHandler: (skuId: string, quantity: number) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  addToCartHandler,
  product,
}) => {
  const renderPrice = () => {
    if (product.hasVariations && product.pricingRanges) {
      const { minimumAmount, maximumAmount } = product.pricingRanges[0];
      return (
        <span className="">
          ${maximumAmount.toLocaleString("es-CL")} - $
          {minimumAmount.toLocaleString("es-CL")}
        </span>
      );
    }
    if (product.pricings) {
      return (
        <span className="">
          ${product.pricings[0].amount.toLocaleString("es-CL")}
        </span>
      );
    }
    return null;
  };

  const handleButtonClick = () => {
    if (product.hasVariations) {
      window.location.href = `/tienda/productos/${product.id}`;
    } else {
      addToCartHandler(product.skuId, 1);
    }
  };

  return (
    <div
      className="w-72 bg-white shadow-md duration-500 hover:scale-105 hover:shadow-xl"
      style={{ borderRadius: "var(--radius)" }}
    >
      <div
        className="group block overflow-hidden shadow-sm"
        style={{ borderRadius: "var(--radius)" }}
      >
        <Link href={`/tienda/productos/${product.id}`}>
          <img
            src={product.previewImageUrl}
            alt={product.name}
            className="h-80 w-72 object-cover rounded-t-xl"
          />
        </Link>
        <div className="px-4 py-3 w-72">
          {product.productTypes
            .slice(0, 1) /* PARA VER SOLO UNA CATEGORIA */
            .map((productType: any, index: any) => (
              <span
                key={index}
                className="text-gray-400 mr-3 uppercase text-sm text-primary"
                style={{ borderRadius: "var(--radius)" }}
              >
                {productType.name} {/* categoria */}
              </span>
            ))}
          <Link href={`/tienda/productos/${product.id}`}>
            <p className="text-[18px] font-bold text-black truncate block capitalize ">
              {product.name}
            </p>
          </Link>
          <div className="flex items-center text-black ">
            <span className="text-gray-600 text-[19px] ">{renderPrice()}</span>
            <div className="ml-auto">
              {product.hasVariations ? (
                <Link
                  href={`/tienda/productos/${product.id}`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div
                    className="text-primary hover:text-secondary hover:bg-primary"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                </Link>
              ) : (
                <button
                  style={{ borderRadius: "var(--radius)" }}
                  onClick={() => addToCartHandler(product.skuId, 1)}
                >
                  <div
                    className="text-primary hover:text-secondary hover:bg-primary"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-8 p-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
