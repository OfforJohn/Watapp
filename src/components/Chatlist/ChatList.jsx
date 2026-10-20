import React, { useEffect, useRef, useState } from "react";
import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";
import ContactsList from "./ContactsList";
import ChatSidebarView from "./ChatSidebarView";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Avatar from "../common/Avatar";
import { useRouter } from "next/router";

import { BsChatLeftText } from "react-icons/bs";
import { FiArchive, FiPhone, FiPlus, FiSettings, FiStar, FiX } from "react-icons/fi";
import { TbChartDonut3 } from "react-icons/tb";

export default function ChatList() {
  const [pageType, setPageType] = useState("default");
  const [navOpen, setNavOpen] = useState(false);
  const [section, setSection] = useState("chats");
  const [filter, setFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [archivedIds, setArchivedIds] = useState([]);
  const [savedSidebarStateLoaded, setSavedSidebarStateLoaded] = useState(false);
  const [{ userInfo, contactsPage }, dispatch] = useStateProvider();
  const router = useRouter();

  useEffect(() => {
    setPageType(contactsPage ? "all-contacts" : "default");
  }, [contactsPage]);

  useEffect(() => {
    try {
      setFavoriteIds(JSON.parse(localStorage.getItem("rextailsFavoriteChatIds") || "[]"));
      setArchivedIds(JSON.parse(localStorage.getItem("rextailsArchivedChatIds") || "[]"));
    } catch {
      setFavoriteIds([]);
      setArchivedIds([]);
    }
    setSavedSidebarStateLoaded(true);
  }, []);

  useEffect(() => {
    if (!savedSidebarStateLoaded) return;
    localStorage.setItem("rextailsFavoriteChatIds", JSON.stringify(favoriteIds));
    localStorage.setItem("rextailsArchivedChatIds", JSON.stringify(archivedIds));
  }, [archivedIds, favoriteIds, savedSidebarStateLoaded]);

  const openSection = (nextSection) => {
    if (contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
    setSection(nextSection);
    setFilter("all");
    setPageType("default");
  };

  const goHome = () => {
    if (contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
    setSection("chats");
    setFilter("all");
    setPageType("default");
    if (router.asPath !== "/") {
      router.push("/", undefined, { shallow: true });
    }
  };

  const toggleId = (setter, current, id) => {
    const key = String(id);
    setter(current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  useEffect(() => {
    if (!router.isReady) return;
    const requestedSection = router.query.section;
    if (!requestedSection) {
      if (section !== "chats") {
        setSection("chats");
        setFilter("all");
      }
      return;
    }
    if (requestedSection === "contacts") {
      if (!contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
      return;
    }
    if (["chats", "calls", "status", "archive"].includes(requestedSection)) {
      if (contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
      if (section !== requestedSection || filter !== "all") {
        setSection(requestedSection);
        setFilter("all");
        setPageType("default");
      }
    } else if (requestedSection === "favorites") {
      if (contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
      setSection("chats");
      setFilter("favorites");
    }
  }, [router.isReady, router.query.section, contactsPage, dispatch, section, filter]);

  return (
    <div className="chat-list-shell flex h-screen min-w-0 bg-[#090c0b] relative">
      <div
        className={`chat-icon-rail flex flex-col justify-between items-center transition-all duration-300 bg-[#0d1110] h-full ${
          navOpen ? "w-64" : "w-16"
        } fixed z-30`}
      >
        <div className="mt-4 flex flex-col items-center space-y-4 w-full">
          <button
            onClick={goHome}
            className={`chat-rail-button text-white p-2 ${section === "chats" ? "chat-rail-selected" : ""}`}
            title="Chats"
            aria-label="Chats"
          >
            <BsChatLeftText size={26} />
          </button>
          <button onClick={() => openSection("calls")} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${section === "calls" ? "chat-rail-selected" : ""}`} title="Calls" aria-label="Calls">
            <FiPhone size={25} className="text-gray-300" />
          </button>
          <button onClick={() => openSection("status")} className={`chat-rail-button flex items-center w-full space-x-3 px-5 py-2 text-white hover:text-emerald-400 ${section === "status" ? "chat-rail-selected" : ""}`} title="Status" aria-label="Status">
            <TbChartDonut3 size={27} className="text-gray-300" />
          </button>
          <button onClick={() => { openSection("chats"); setFilter("favorites"); }} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${section === "chats" && filter === "favorites" ? "chat-rail-selected" : ""}`} title="Favorites" aria-label="Favorites">
            <FiStar size={26} className="text-gray-300" />
          </button>
          <hr className="border-t border-gray-500 my-2 w-11" />
          <button onClick={() => openSection("archive")} className={`chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400 ${section === "archive" ? "chat-rail-selected" : ""}`} title="Archived chats" aria-label="Archived chats">
            <FiArchive size={25} className="text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3 mb-6 w-full">
          <hr className="border-t border-gray-500 w-11" />
          <button
            onClick={() => router.push("/settings")}
            className="chat-rail-button flex items-center w-full space-x-3 px-4 py-2 text-white hover:text-emerald-400"
            title="Settings"
            aria-label="Settings"
          >
            <FiSettings size={27} />
          </button>
          <button onClick={() => router.push("/settings/account")} className="chat-rail-button flex items-center space-x-2 p-2 hover:text-emerald-400 -ml-2" title={userInfo?.name || "Profile"} aria-label="Profile">
            <Avatar type="sm" image={userInfo?.profileImage} />
            {navOpen && (
              <span className="flex flex-col items-start whitespace-nowrap">
                <span>{userInfo?.name || "Profile"}</span>
                {userInfo?.handle && (
                  <span className="text-xs text-gray-400">@{userInfo.handle}</span>
                )}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="chat-sidebar bg-[#111614] flex flex-col z-20 ml-16 min-w-0 flex-1">
        {pageType === "default" && section === "chats" && (
          <>
            <ChatListHeader />
            <SearchBar />
            <div className="chat-filter-row flex space-x-2 px-4 py-2">
              <button onClick={() => setFilter("all")} className={`px-4 py-1 text-sm font-semibold rounded-full border border-transparent transition duration-200 ${filter === "all" ? "chat-filter-selected" : ""}`}>
                All
              </button>
              <button onClick={() => setFilter("unread")} className={`px-4 py-1 text-sm font-semibold rounded-full border border-transparent transition duration-200 ${filter === "unread" ? "chat-filter-selected" : ""}`}>
                Unread
              </button>
              <button onClick={() => setFilter("favorites")} className={`px-4 py-1 text-sm font-semibold rounded-full border border-transparent transition duration-200 ${filter === "favorites" ? "chat-filter-selected" : ""}`}>
                Favorites
              </button>
              <button onClick={() => setFilter("groups")} className={`px-4 py-1 text-sm font-semibold rounded-full border border-transparent transition duration-200 ${filter === "groups" ? "chat-filter-selected" : ""}`}>
                Groups
              </button>
            </div>
            <List
              filter={filter}
              favoriteIds={favoriteIds}
              archivedIds={archivedIds}
              onToggleFavorite={(id) => toggleId(setFavoriteIds, favoriteIds, id)}
              onToggleArchive={(id) => toggleId(setArchivedIds, archivedIds, id)}
            />
          </>
        )}
        {pageType === "all-contacts" && <ContactsList />}
        {pageType === "default" && section === "status" && (
          <StatusView userInfo={userInfo} />
        )}
        {pageType === "default" && ["calls", "archive"].includes(section) && (
          <ChatSidebarView
            section={section}
            archivedIds={archivedIds}
            onToggleArchive={(id) => toggleId(setArchivedIds, archivedIds, id)}
            onBackToChats={goHome}
          />
        )}
        <div className="chat-sidebar-footer" aria-hidden="true">REXTAILS</div>
      </div>
    </div>
  );
}

function StatusView({ userInfo }) {
  const profile = userInfo?.profileImage;
  const fileInput = useRef(null);
  const [updates, setUpdates] = useState([]);
  const [viewingUpdate, setViewingUpdate] = useState(null);

  useEffect(() => {
    try {
      const savedUpdates = JSON.parse(localStorage.getItem("rextailsMyStatusUpdates") || "[]");
      const activeUpdates = savedUpdates.filter((update) => Date.now() - update.createdAt < 24 * 60 * 60 * 1000);
      setUpdates(activeUpdates);
      localStorage.setItem("rextailsMyStatusUpdates", JSON.stringify(activeUpdates));
    } catch {
      setUpdates([]);
    }
  }, []);

  const addStatus = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const update = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: reader.result,
        type: file.type.startsWith("video/") ? "video" : "image",
        createdAt: Date.now(),
      };
      setUpdates((current) => {
        const next = [...current, update];
        try {
          localStorage.setItem("rextailsMyStatusUpdates", JSON.stringify(next));
        } catch (error) {
          console.error("Could not save status update locally:", error);
        }
        return next;
      });
      setViewingUpdate(update);
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const latestUpdate = updates[updates.length - 1];
  const updatedTime = latestUpdate
    ? new Date(latestUpdate.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <section className="sidebar-feature-view status-view" aria-label="Status updates">
      <header className="status-view-header">
        <h1>Status</h1>
        <button type="button" className="status-add-button" aria-label="Add status" title="Add status" onClick={() => fileInput.current?.click()}>
          <FiPlus aria-hidden="true" />
        </button>
      </header>
      <input ref={fileInput} className="status-file-input" type="file" accept="image/*,video/*" onChange={addStatus} aria-label="Choose a photo or video for your status" />
      <div className="status-my-row">
        <button className="status-my-main" type="button" onClick={() => latestUpdate && setViewingUpdate(latestUpdate)}>
          <div className="status-avatar-ring">
            {latestUpdate?.type === "image" ? (
              <img src={latestUpdate.url} alt="Latest status" />
            ) : profile ? (
              <img src={profile} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2z" /></svg>
            )}
          </div>
          <div className="status-my-copy">
            <strong>My status</strong>
            <span>{updates.length ? `${updates.length} ${updates.length === 1 ? "update" : "updates"} · ${updatedTime}` : "Tap to add status update"}</span>
          </div>
        </button>
        <button type="button" className="status-row-add" aria-label="Add status update" title="Add status update" onClick={() => fileInput.current?.click()}>
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      <p className="status-expiry-note">Status updates disappear after 24 hours.</p>
      {viewingUpdate && (
        <div className="status-viewer" role="dialog" aria-modal="true" aria-label="My status update" onClick={() => setViewingUpdate(null)}>
          <button className="status-viewer-close" type="button" aria-label="Close status" onClick={() => setViewingUpdate(null)}><FiX /></button>
          {viewingUpdate.type === "video" ? (
            <video src={viewingUpdate.url} autoPlay controls onClick={(event) => event.stopPropagation()} />
          ) : (
            <img src={viewingUpdate.url} alt="My status update" onClick={(event) => event.stopPropagation()} />
          )}
        </div>
      )}
    </section>
  );
}