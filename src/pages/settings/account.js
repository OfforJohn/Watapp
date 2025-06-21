import Sidebar from "@/components/sidebar";
import Avatar from "@/components/common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";
import BotRepliesSettings from "./BotRepliesSettings"; // ✅ Import the bot replies component

import { FiLogOut } from "react-icons/fi";

export default function AccountSettings() {
  const [{ userInfo }] = useStateProvider();

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {/* Sidebar icons */}
      <Sidebar navOpen={false} />

      {/* Full settings layout */}
      <div className="ml-16 flex w-full">
        {/* Left menu */}
        <div className="w-[320px] bg-white h-full border-r border-gray-300 p-5 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 py-4 border-b border-gray-300 mb-4">
            <Avatar image={userInfo?.profileImage} />
            <div>
              <h3 className="font-medium text-gray-800">{userInfo?.name || "John"}</h3>
              <p className="text-sm text-gray-500">Hey there! I am using WhatsApp.</p>
            </div>
          </div>

          {/* Settings Nav */}
          <div className="space-y-4">
            <SettingItem label="Account" href="/settings/account" active />
            <button className="flex items-center space-x-3 text-red-500 hover:underline mt-6">
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Right side content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h1>

          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-800 mt-1">{userInfo?.email || "+234 123 456 7890"}</p>
            </div>

          
           
          </div>

          {/* ✅ Bot Replies Section */}
          <BotRepliesSettings />
        </div>
      </div>
    </div>
  );
}

function SettingItem({ label, href, active = false }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(href)}
      className={`rounded-lg p-3 cursor-pointer transition-all ${
        active ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100"
      }`}
    >
      <h4 className="text-sm font-semibold">{label}</h4>
    </div>
  );
}
