import React from "react";
import Link from "next/link";

const Breadcrumbs = () => {
  return (
    <nav className="flex py-4 text-gray-600">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="hover:text-gray-900"
          >
            Inicio
          </Link>
        </li>
        <li className="flex items-center space-x-2">
          <span>/</span>
          <Link
            href="/tienda"
            className="hover:text-gray-900"
          >
            Tienda
          </Link>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
