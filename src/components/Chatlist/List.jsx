import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";

export default function List({
  filter = "all",
  favoriteIds = [],
  archivedIds = [],
  onToggleFavorite,
  onToggleArchive,
}) {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
        dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
        dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };

    if (userInfo?.id) {
      getContacts(); // Only once on mount
    }
  }, [userInfo]);

  const contacts = filteredContacts?.length ? filteredContacts : userContacts;
  const visibleContacts = contacts.filter((contact) => {
    const key = String(contact.id);
    if (archivedIds.includes(key)) return false;
    if (filter === "unread") return Number(contact.totalUnreadMessages) > 0;
    if (filter === "favorites") return favoriteIds.includes(key);
    if (filter === "groups") return Boolean(contact.isGroup || contact.group || contact.type === "group");
    return true;
  });

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {visibleContacts.length ? visibleContacts.map((contact) => (
        <ChatLIstItem
          data={contact}
          key={contact.id}
          isFavorite={favoriteIds.includes(String(contact.id))}
          isArchived={archivedIds.includes(String(contact.id))}
          onToggleFavorite={onToggleFavorite}
          onToggleArchive={onToggleArchive}
        />
      )) : (
        <p className="px-6 py-8 text-center text-sm text-secondary">
          {filter === "unread" ? "You’re all caught up." : filter === "favorites" ? "No favorites yet. Use the star on a chat to add one." : filter === "groups" ? "No group chats yet." : "No chats yet."}
        </p>
      )}
    </div>
  );
}
