// components/Sidebar.js
import React, { useState } from "react";
import Avatar from "./common/Avatar";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { FaRegCircle } from "react-icons/fa";
import { BsChatLeftText, BsChatText } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { IoIosPeople } from "react-icons/io";
import { TbChartDonut3 } from "react-icons/tb";

export default function Sidebar({ navOpen = true }) {
  const [{ userInfo }] = useStateProvider();
  const router = useRouter();

  return (
    <div
      className={`flex flex-col justify-between items-center transition-all duration-300 bg-[#202c33] h-screen ${
        navOpen ? "w-64" : "w-16"
      } fixed z-30`}
    >
      {/* Top Icons */}
      <div className="mt-4 flex flex-col items-center space-y-4 w-full">
        <button 
        
          onClick={() => router.push("/")}
        className="text-white p-2">
          
          <BsChatLeftText size={26} />
        </button>

        <button className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400">
          <TbChartDonut3 size={28} className="text-gray-300" />
          {navOpen && <span>Chats</span>}
        </button>

        <button className="flex items-center w-full space-x-3 px-5 py-2 text-white hover:text-emerald-400">
          <BsChatText size={23} className="text-gray-300" />
          {navOpen && <span>Bots</span>}
        </button>

        <button
          className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400"
        >
          <IoIosPeople size={29} className="text-gray-300" />
          {navOpen && <span>Contacts</span>}
        </button>

        <hr className="border-t border-gray-500 my-2 w-11" />

        <button className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400">
          <FaRegCircle size={24} className="text-indigo-500" />
          {navOpen && <span>Status</span>}
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-3 mb-6 w-full">
        <hr className="border-t border-gray-500 w-11" />
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400"
        >
          <CiSettings size={30} />
          {navOpen && <span>Settings</span>}
        </button>

        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400 -ml-2">
          <Avatar type="sm" image={userInfo?.profileImage} />
          {navOpen && <span className="whitespace-nowrap">Profile</span>}
        </button>
      </div>
    </div>
  );
}
