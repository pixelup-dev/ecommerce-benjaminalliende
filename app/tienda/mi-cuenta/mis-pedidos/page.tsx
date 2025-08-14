/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import OrderCard from "./OrderCard";

export default function Page() {
  return (
    <div className="py-24 md:min-h-screen">
      <OrderCard />
    </div>
  );
}
