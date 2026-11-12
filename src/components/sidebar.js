// components/Sidebar.js
import React, { useEffect, useState } from "react";
import Avatar from "./common/Avatar";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { BsChatLeftText } from "react-icons/bs";
import { FiArchive, FiPhone, FiSettings, FiStar, FiUsers } from "react-icons/fi";
import { MdPersonSearch } from "react-icons/md";
import { TbChartDonut3 } from "react-icons/tb";
import { reducerCases } from "@/context/constants";

export default function Sidebar({ navOpen = true }) {
  const [{ userInfo, contactsPage }, dispatch] = useStateProvider();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("chats");

  const openSection = (section) => {
    setActiveSection(section);
    router.push(section === "chats" ? "/" : `/?section=${section}`);
  };

  useEffect(() => {
    const querySection = router.query.section;
    if (router.pathname === "/settings/account") {
      setActiveSection("profile");
    } else if (router.pathname === "/settings") {
      setActiveSection("settings");
    } else if (router.pathname === "/whatsapp-profiles") {
      setActiveSection("profiles");
    } else {
      setActiveSection(querySection ? String(querySection) : "chats");
    }
  }, [router.pathname, router.query.section]);

  return (
    <div
      className={`settings-icon-rail flex flex-col justify-between items-center transition-all duration-300 bg-[#0e1210] h-screen ${
        navOpen ? "w-64" : "w-16"
      } fixed z-30`}
    >
      {/* Top Icons */}
      <div className="mt-4 flex flex-col items-center space-y-4 w-full">
        <button onClick={() => openSection("chats")} className={`chat-rail-button text-white p-2 ${activeSection === "chats" ? "chat-rail-selected" : ""}`} title="Chats" aria-label="Chats">
          <BsChatLeftText size={26} />
        </button>

        <button onClick={() => openSection("calls")} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${activeSection === "calls" ? "chat-rail-selected" : ""}`} title="Calls" aria-label="Calls">
          <FiPhone size={25} className="text-gray-300" />
        </button>

        <button onClick={() => openSection("status")} className={`chat-rail-button flex items-center w-full space-x-3 px-5 py-2 text-white hover:text-emerald-400 ${activeSection === "status" ? "chat-rail-selected" : ""}`} title="Status" aria-label="Status">
          <TbChartDonut3 size={25} className="text-gray-300" />
        </button>

        <button onClick={() => openSection("favorites")} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${activeSection === "favorites" ? "chat-rail-selected" : ""}`} title="Favorites" aria-label="Favorites">
          <FiStar size={26} className="text-gray-300" />
        </button>

        <button onClick={() => { if (!contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE }); router.push("/"); }} className="chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400" title="Contacts" aria-label="Contacts">
          <FiUsers size={25} className="text-gray-300" />
        </button>

        <button onClick={() => openSection("archive")} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${activeSection === "archive" ? "chat-rail-selected" : ""}`} title="Archived chats" aria-label="Archived chats">
          <FiArchive size={25} className="text-gray-300" />
        </button>

        <button
          onClick={() => router.push("/whatsapp-profiles")}
          className={`chat-rail-button ${activeSection === "profiles" ? "chat-rail-selected" : ""}`}
          title="Profile Lookup"
          aria-label="Profile Lookup"
        >
          <MdPersonSearch size={27} className="text-gray-300" />
          {navOpen && <span>Profile Lookup</span>}
        </button>

        <hr className="border-t border-gray-500 my-2 w-11" />

      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-3 mb-6 w-full">
        <hr className="border-t border-gray-500 w-11" />
        <button
          onClick={() => router.push("/settings")}
          className={`chat-rail-button ${activeSection === "settings" ? "chat-rail-selected" : ""}`}
          title="Settings"
          aria-label="Settings"
        >
          <FiSettings size={27} />
        </button>

        <button
          onClick={() => router.push("/settings/account")}
          className={`chat-rail-button chat-rail-profile ${activeSection === "profile" ? "chat-rail-selected" : ""}`}
          title="Profile"
          aria-label="Profile"
        >
          <Avatar
            type="sm"
            image={userInfo?.profileImage || "/default_avatar.png"}
          />
          {navOpen && <span className="whitespace-nowrap">Profile</span>}
        </button>
      </div>
    </div>
  );
}
