import Image from "next/image";
import React from "react";
import vn from "../public/images/vn.png";
import { Bell } from "lucide-react";
import admin from "../public/images/admin.jpg";
const Header = () => {
  return (
    <header className="bg-[#1e1e1e] shadow-lg border-b border-[#1f1f1f] mx-4 sm:mx-6 lg:mx-8 mt-4 mb-2 rounded-lg">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100">
          Bảng điều khiển
        </h1>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Image
            src={vn}
            alt="country-flag"
            width={25}
            height={18}
            className="rounded-full shadow-md cursor-pointer"
          />

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src={admin}
              alt="admin"
              width={35}
              height={35}
              className="rounded-full border border-gray-600"
            />
            <span className="hidden sm:block text-gray-100 font-medium">
              DAT VO
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
