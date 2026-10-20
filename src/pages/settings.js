// pages/settings.js
import Sidebar from "@/components/sidebar";
import Avatar from "@/components/common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";
import { useState } from "react";

import { FaKey, FaLock, FaBell, FaKeyboard, FaQuestionCircle } from "react-icons/fa";
import { MdChat, MdPersonSearch } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";

export default function SettingsPage() {
  const [{ userInfo }] = useStateProvider();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("Settings");
  const sectionDescriptions = {
    Privacy: "Privacy controls for blocked contacts and disappearing messages will be available here.",
    Chats: "Return to your chats and manage chat-related preferences.",
    Notifications: "Message and call notification preferences will be available here.",
    "Keyboard shortcuts": "Keyboard shortcuts will be listed here as they are added to Rextails.",
    Help: "Help and support information will be available here.",
  };

  return (
    <div className="settings-theme flex h-screen">
      {/* Sidebar with icons only */}
      <Sidebar navOpen={false} />

      {/* Settings Panels */}
      <div className="ml-16 flex w-full">
        {/* Left Settings Menu */}
        <div className="settings-menu-panel w-[320px] h-full border-r border-gray-300 p-5 overflow-y-auto">
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
              onSelect={setActiveSection}
            />
            <SettingItem
              icon={<MdChat />}
              label="Chats"
              desc="Theme, wallpaper, chat settings"
              onSelect={() => router.push("/")}
            />
            <SettingItem
              icon={<FaBell />}
              label="Notifications"
              desc="Message notifications"
              onSelect={setActiveSection}
            />
            <SettingItem
              icon={<FaKeyboard />}
              label="Keyboard shortcuts"
              desc="Quick actions"
              onSelect={setActiveSection}
            />
            <SettingItem
              icon={<FaQuestionCircle />}
              label="Help"
              desc="Help center, contact us, privacy policy"
              onSelect={setActiveSection}
            />
            <SettingItem
              icon={<MdPersonSearch />}
              label="Profile Lookup"
              desc="Batch lookup WhatsApp profiles"
              href="/whatsapp-profiles"
            />

            <button 
              onClick={() => router.push("/logout")}
              className="flex items-center space-x-3 text-red-500 hover:underline mt-6"
            >
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Right Settings View */}
        <div className="settings-content-panel flex-1 flex flex-col items-center justify-center text-center text-gray-600 px-8">
          <CiSettings size={50} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium">{activeSection}</h2>
          {activeSection !== "Settings" && (
            <p className="mt-3 max-w-md text-sm text-gray-400">
              {sectionDescriptions[activeSection] || "Manage your Rextails preferences here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for left menu items
function SettingItem({ icon, label, desc, href, onSelect }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : onSelect?.(label))}
      className="settings-nav-item hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-all w-full text-left"
      aria-label={`${label}: ${desc}`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-500">{icon}</div>
        <div>
          <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}