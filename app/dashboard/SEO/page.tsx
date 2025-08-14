import React from "react";
import type { Metadata } from "next";
import SEO from "./SEO";

export const metadata: Metadata = {
  title: "SEO",
  description: "SEO",
};

function SEOPage() {
  return(
<section className="gap-4 flex flex-col py-10 mx-10">
    <div
    className="rounded-sm border w-full border-stroke bg-white py-6 px-8 shadow-default dark:border-black dark:bg-black mt-4"
    style={{ borderRadius: "var(--radius)" }}
  >
    <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 ">
      <div>SEO</div>
    </div>
    <SEO />
  </div>
  </section>
  )




}

export default SEOPage;
