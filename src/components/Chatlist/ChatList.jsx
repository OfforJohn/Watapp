import React, { useEffect, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import ContactsList from "./ContactsList";
import { useStateProvider } from "@/context/StateContext";
import Avatar from "../common/Avatar";
import { BsChatDots } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { LuCircleDotDashed } from "react-icons/lu";

export default function ChatList() {
  const [pageType, setPageType] = useState("default");

  const [{ userInfo }, dispatch] = useStateProvider();
  const [{ contactsPage }] = useStateProvider();
  const [navOpen, setNavOpen] = useState(false);
  const [{ totalUnreadMessages }] = useStateProvider();

  useEffect(() => {
    if (contactsPage) {
      setPageType("all-contacts");
    } else {
      setPageType("default");
    }
  }, [contactsPage]);

  const toggleNav = () => {
    setNavOpen((prev) => !prev);
  };

 return (
  <div className="bg-[#202c33] flex h-screen overflow-hidden relative">
    {/* Sidebar Navigation */}
    <div
      className={`fixed inset-y-0 left-0 bg-[#202c33] transform transition-transform duration-300 ease-in-out ${
        navOpen ? "translate-x-[-30%]" : "-translate-x-[80%]"
      } w-64 z-30`}
    ></div>

    {/* Persistent Hamburger Button */}
    <button
      onClick={toggleNav}
      className="fixed top-4 left-2 z-40 p-2 text-xl text-white rounded focus:outline-none"
    >
      ☰
    </button>

    {/* Sidebar Content */}
    <div className="fixed top-16 left-2 z-40 flex flex-col justify-between h-[calc(100vh-4rem)] text-white w-64">
      {/* Top Navigation Buttons */}
      <div className="flex flex-col space-y-4">
        <button
          className="flex items-center space-x-2 p-2 hover:text-emerald-400"
          onClick={() => setPageType("default")}
        >
          <BsChatDots size={20} />
          {navOpen && <span className="whitespace-nowrap">Chats</span>}
        </button>

        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400">
          <LuCircleDotDashed size={24} className="text-blue-500" />
          {navOpen && <span className="whitespace-nowrap">Bots</span>}
        </button>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex flex-col space-y-2 mb-4">
        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400">
          <CiSettings size={33} />
          {navOpen && <span className="whitespace-nowrap">Settings</span>}
        </button>

        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400">
          <Avatar type="sm" image={userInfo?.profileImage} />
          {navOpen && <span className="whitespace-nowrap">Profile</span>}
        </button>
      </div>
    </div>

    {/* Main Content Scrollable */}
    <div className="flex-1 flex flex-col bg-panel-header-background overflow-y-auto h-full pl-14">
      {/* Header (optional if needed) */}
      <div className="flex items-center p-2 shadow-md bg-panel-header-background sticky top-0 z-10"></div>

      {/* Scrollable Body */}
      {pageType === "default" && (
        <>
          <ChatListHeader />
          <SearchBar />
          <List />
        </>
      )}

      {pageType === "all-contacts" && <ContactsList />}
    </div>
  </div>
);

}