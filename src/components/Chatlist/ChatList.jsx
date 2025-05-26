import React, { useEffect, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import ContactsList from "./ContactsList";
import { useStateProvider } from "@/context/StateContext";
import Avatar from "../common/Avatar";
import { FaRegCircle } from "react-icons/fa";
import { BsChatLeftText } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { IoIosPeople } from "react-icons/io";
import { LuCircleDotDashed } from "react-icons/lu";
import { TbChartDonut3 } from "react-icons/tb";
import { BsChatText } from "react-icons/bs";

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
     // onClick={toggleNav}
      className="fixed top-4 left-2 z-40 p-2 text-xl text-white rounded focus:outline-none"
        onClick={() => setPageType("default")}
    >
      <BsChatLeftText size={25} className="text-white" />


    </button>

    {/* Sidebar Content */}
    <div className="fixed top-16 left-2 z-40 flex flex-col justify-between h-[calc(100vh-4rem)] text-white w-64">
      {/* Top Navigation Buttons */}
      <div className="flex flex-col space-y-4">
       

          <button
          className="flex items-center space-x-2 p-2 hover:text-emerald-400"
          
        >
         <TbChartDonut3 size={24} className="text-gray-300" />

          {navOpen && <span className="whitespace-nowrap">Chats</span>}
        </button>
          <button className="flex items-center space-x-2 p-2 hover:text-emerald-400">
    <BsChatText  size={24}className="text-gray-300"/>
          {navOpen && <span className="whitespace-nowrap">Bots</span>}
        </button>

         <button
          className="flex items-center space-x-2 p-2 hover:text-emerald-400"
          onClick={() => setPageType("default")}
        >
          <IoIosPeople size={30}  className="text-gray-300"/>
          {navOpen && <span className="whitespace-nowrap">Chats</span>}
        </button>

           <hr className="border-t border-gray-500 my-2 w-11" />

        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400">
      <FaRegCircle
  size={24}
  className="text-indigo-500  hover:text-purple-500 transition-colors duration-300"
/>
          {navOpen && <span className="whitespace-nowrap">Bots</span>}
        </button>
     
       
      </div>


      

      {/* Bottom Navigation Buttons */}
      <div className="flex flex-col space-y-2 mb-4">
        
           <hr className="border-t border-gray-500 my-2 w-11" />
        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400 -ml-1">
          <CiSettings size={33} />
          {navOpen && <span className="whitespace-nowrap">Settings</span>}
        </button>

        <button className="flex items-center space-x-2 p-2 hover:text-emerald-400 -ml-2">
          <Avatar type="sm" image={userInfo?.profileImage} />
          {navOpen && <span className="whitespace-nowrap">Profile</span>}
        </button>
      </div>
    </div>

    {/* Main Content */}
      <div className="flex-1 flex flex-col bg-panel-header-background">
        <div className="flex items-center p-2 shadow-md bg-panel-header-background"></div>

       {pageType === "default" && (
  <div className="pl-14 flex flex-col h-full">
    <ChatListHeader />
    <SearchBar />
    <div className="overflow-y-auto flex-1 pr-2">
      <List />
    </div>
  </div>
)}


        {pageType === "all-contacts" && <ContactsList />}
      </div>
  </div>
);

}