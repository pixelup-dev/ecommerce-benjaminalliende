/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React from "react";

function AsideTotal() {
  return (
    <div className="overflow-y-auto lg:h-[calc(100vh-11rem)] lg:sticky lg:top-0 shadow-sm ">
      <div className="bg-gray-100">
        <div className="relative h-full">
          <div className="p-8 lg:overflow-auto max-lg:mb-8">
            <h2 className="text-2xl font-extrabold text-[#333]">
              Order Summary
            </h2>
            <div className="space-y-6 mt-10">
              <div className="grid sm:grid-cols-2 items-start gap-6">
                <div className="max-w-[190px] px-4 py-6 shrink-0 bg-gray-200 rounded-md">
                  <img
                    src="https://readymadeui.com/images/product10.webp"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base text-[#333]">
                    Naruto: Split Sneakers
                  </h3>
                  <ul className="text-xs text-[#333] space-y-2 mt-2">
                    <li className="flex flex-wrap gap-4">
                      Size <span className="ml-auto">37</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Quantity <span className="ml-auto">2</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Total Price <span className="ml-auto">$40</span>
                    </li>
                  </ul>
                </div>
                <div className="max-w-[190px] px-4 py-6 shrink-0 bg-gray-200 rounded-md">
                  <img
                    src="https://readymadeui.com/images/product10.webp"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base text-[#333]">
                    Naruto: Split Sneakers
                  </h3>
                  <ul className="text-xs text-[#333] space-y-2 mt-2">
                    <li className="flex flex-wrap gap-4">
                      Size <span className="ml-auto">37</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Quantity <span className="ml-auto">2</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Total Price <span className="ml-auto">$40</span>
                    </li>
                  </ul>
                </div>
                <div className="max-w-[190px] px-4 py-6 shrink-0 bg-gray-200 rounded-md">
                  <img
                    src="https://readymadeui.com/images/product10.webp"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base text-[#333]">
                    Naruto: Split Sneakers
                  </h3>
                  <ul className="text-xs text-[#333] space-y-2 mt-2">
                    <li className="flex flex-wrap gap-4">
                      Size <span className="ml-auto">37</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Quantity <span className="ml-auto">2</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Total Price <span className="ml-auto">$40</span>
                    </li>
                  </ul>
                </div>
                <div className="max-w-[190px] px-4 py-6 shrink-0 bg-gray-200 rounded-md">
                  <img
                    src="https://readymadeui.com/images/product10.webp"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base text-[#333]">
                    Naruto: Split Sneakers
                  </h3>
                  <ul className="text-xs text-[#333] space-y-2 mt-2">
                    <li className="flex flex-wrap gap-4">
                      Size <span className="ml-auto">37</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Quantity <span className="ml-auto">2</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Total Price <span className="ml-auto">$40</span>
                    </li>
                  </ul>
                </div>
                <div className="max-w-[190px] px-4 py-6 shrink-0 bg-gray-200 rounded-md">
                  <img
                    src="https://readymadeui.com/images/product10.webp"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base text-[#333]">
                    Naruto: Split Sneakers
                  </h3>
                  <ul className="text-xs text-[#333] space-y-2 mt-2">
                    <li className="flex flex-wrap gap-4">
                      Size <span className="ml-auto">37</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Quantity <span className="ml-auto">2</span>
                    </li>
                    <li className="flex flex-wrap gap-4">
                      Total Price <span className="ml-auto">$40</span>
                    </li>
                  </ul>
                </div>
                {/* Otros productos... */}
              </div>
            </div>
          </div>
          <div className="fixed right-0 bottom-0 bg-secondary w-full p-4">
            <h4 className="flex flex-wrap gap-4 text-xl text-white font-bold ">
              Total <span className="ml-auto">$240.00</span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsideTotal;
