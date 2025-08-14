import React, { useEffect, useState } from "react";
import axios from "axios";

interface StarsProps {
  reviewAverageScore: number | null;
  totalReviews: number | null;
  productId: string;
}

const Stars = ({ reviewAverageScore, totalReviews, productId }: StarsProps) => {
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/reviews`,
        {
          params: {
            siteId: process.env.NEXT_PUBLIC_API_URL_SITEID || "",
            pageNumber: 1,
            pageSize: 50,
          },
        }
      );
      console.log("Reviews fetched:", response.data.productReviews);
      setReviews(response.data.productReviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Calcular la distribución de calificaciones
  const ratingDistribution = [0, 0, 0, 0, 0];
  safeReviews.forEach((review) => {
    if (review.score >= 1 && review.score <= 5) {
      ratingDistribution[review.score - 1] += 1;
    }
  });

  return (
    <section>
      <section className="py-24 relative">
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-6 mx-auto">
          <div className="">
            <h2 className="font-manrope font-bold text-3xl sm:text-4xl leading-10 text-black mb-8 text-center">
              Opiniones de nuestros clientes
            </h2>
            <div className="flex w-full mb-11">
              <div className="w-full min-h-[230px]">
                <div
                  className="grid grid-cols-1 md:grid-cols-2 h-full bg-white border  shadow-xl w-full"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center px-6">
                    <div className="flex flex-col sm:flex-row items-center max-lg:justify-center w-full h-full">
                      <div className="sm:pr-3 md:border-r border-gray-200 flex items-center justify-center flex-col min-w-[300px] w-full">
                        <h2 className="mt-4 md:mt-0 font-manrope font-bold text-5xl text-black text-center mb-4">
                          {reviewAverageScore ? Math.floor(reviewAverageScore * 10) / 10 : 0}
                        </h2>

                        <div className="flex items-center gap-3 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-8 h-8 ${
                                reviewAverageScore && i < reviewAverageScore
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885a1 1 0 00.95-.69L9.049.775z" />
                            </svg>
                          ))}
                        </div>
                        <p className="font-normal text-lg leading-8 text-gray-400">
                          {totalReviews || 0} Calificaciones
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex items-center">
                    <div className="flex flex-col justify-center w-full h-full p-4 rounded-3xl">
                      <h3 className="font-manrope font-semibold text-lg text-black mb-2">
                        Distribución de Calificaciones
                      </h3>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className="flex items-center w-full mb-2"
                        >
                          <div className="w-8 text-center">
                            <p className="font-medium text-lg py-[1px] text-black">
                              {rating}
                            </p>
                          </div>

                          <svg
                            className="w-6 h-6 text-yellow-500 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885a1 1 0 00.95-.69L9.049.775z" />
                          </svg>

                          <div className="h-2 w-full rounded-[30px] bg-gray-200 ml-5 mr-3 relative">
                            <span
                              className="h-full rounded-[30px] bg-primary absolute top-0 left-0"
                              style={{
                                width: `${
                                  (ratingDistribution[rating - 1] /
                                    (totalReviews || 0)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <p className="font-medium text-lg py-[1px] text-black">
                            {ratingDistribution[rating - 1]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pb-8 border-b border-gray-200 px-4">
              <h4 className="font-manrope font-semibold text-3xl leading-10 text-black mb-6">
                Reseñas
              </h4>
              {safeReviews.length > 0 ? (
                safeReviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="flex flex-col bg-gray-100 p-6 rounded mb-4"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 30 30"
                          fill="none"
                          className={`${
                            i < review.score
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          <path
                            d="M14.1033 2.56698C14.4701 1.82374 15.5299 1.82374 15.8967 2.56699L19.1757 9.21093C19.3214 9.50607 19.6029 9.71064 19.9287 9.75797L27.2607 10.8234C28.0809 10.9426 28.4084 11.9505 27.8149 12.5291L22.5094 17.7007C22.2737 17.9304 22.1662 18.2614 22.2218 18.5858L23.4743 25.8882C23.6144 26.7051 22.7569 27.3281 22.0233 26.9424L15.4653 23.4946C15.174 23.3415 14.826 23.3415 14.5347 23.4946L7.9767 26.9424C7.24307 27.3281 6.38563 26.7051 6.52574 25.8882L7.7782 18.5858C7.83384 18.2614 7.72629 17.9304 7.49061 17.7007L2.1851 12.5291C1.59159 11.9505 1.91909 10.9426 2.73931 10.8234L10.0713 9.75797C10.3971 9.71064 10.6786 9.50607 10.8243 9.21093L14.1033 2.56698Z"
                            fill="currentColor"
                          />
                        </svg>
                      ))}
                      <div className="flex items-center gap-3">
                        <h6 className="font-semibold text-lg leading-8 text-black">
                          @{review.customerName}
                        </h6>
                        <p className="font-medium text-base leading-7 text-gray-400">
                          {new Date(review.creationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-normal text-lg leading-8 text-gray-500">
                      {review.comments}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-normal text-lg leading-8 text-gray-500">
                  No existen reseñas del producto.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Stars;
