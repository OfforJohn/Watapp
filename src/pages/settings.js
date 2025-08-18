// pages/settings.js
import Sidebar from "@/components/sidebar";
import Avatar from "@/components/common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";

import { FaKey, FaLock, FaBell, FaKeyboard, FaQuestionCircle } from "react-icons/fa";
import { MdChat } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";

export default function SettingsPage() {
  const [{ userInfo }] = useStateProvider();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {/* Sidebar with icons only */}
      <Sidebar navOpen={false} />

      {/* Settings Panels */}
      <div className="ml-16 flex w-full">
        {/* Left Settings Menu */}
        <div className="w-[320px] bg-white h-full border-r border-gray-300 p-5 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>

          {/* Profile */}
          <div className="flex items-center space-x-3 py-4 border-b border-gray-300 mb-4">
            <Avatar image={userInfo?.profileImage} />
            <div>
              <h3 className="font-medium text-gray-800">{userInfo?.name || "John"}</h3>
              <p className="text-sm text-gray-500">Hey there! I am using WhatsApp.</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            <SettingItem
              icon={<FaKey />}
              label="Account"
              desc="Security notifications, account info"
              href="/settings/account"
            />
            <SettingItem
              icon={<FaLock />}
              label="Privacy"
              desc="Blocked contacts, disappearing messages"
            
            />
            <SettingItem
              icon={<MdChat />}
              label="Chats"
              desc="Theme, wallpaper, chat settings"
            
            />
            <SettingItem
              icon={<FaBell />}
              label="Notifications"
              desc="Message notifications"

            />
            <SettingItem
              icon={<FaKeyboard />}
              label="Keyboard shortcuts"
              desc="Quick actions"
              
            />
            <SettingItem
              icon={<FaQuestionCircle />}
              label="Help"
              desc="Help center, contact us, privacy policy"
    
            />

            <button className="flex items-center space-x-3 text-red-500 hover:underline mt-6">
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Right Settings View */}
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600">
          <CiSettings size={50} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium">Settings</h2>
        </div>
      </div>
    </div>
  );
}

// Helper component for left menu items
function SettingItem({ icon, label, desc, href }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-all"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-500">{icon}</div>
        <div>
          <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}