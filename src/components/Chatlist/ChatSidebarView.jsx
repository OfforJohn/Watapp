import React from "react";
import Avatar from "@/components/common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { FiPhone, FiVideo } from "react-icons/fi";

function getChatUser(contact, currentUserId) {
  return {
    name: contact.name,
    about: contact.about,
    profilePicture: contact.profilePicture,
    email: contact.email,
    handle: contact.handle,
    id: Number(currentUserId) === Number(contact.senderId)
      ? contact.recieverId
      : contact.senderId,
  };
}

export default function ChatSidebarView({ section, archivedIds, onToggleArchive, onBackToChats }) {
  const [{ userInfo, userContacts }, dispatch] = useStateProvider();
  const chats = userContacts || [];
  const archived = chats.filter((chat) => archivedIds.includes(String(chat.id)));

  if (section === "calls") {
    return (
      <section className="sidebar-feature-view">
        <header className="sidebar-feature-heading">
          <button className="sidebar-feature-back" type="button" onClick={onBackToChats} aria-label="Back to home chats">‹ <span>Chats</span></button>
          <h2>Calls</h2>
          <p>Start a voice or video call with someone you’ve chatted with.</p>
        </header>
        {chats.length ? chats.map((chat) => {
          const user = getChatUser(chat, userInfo?.id);
          return (
            <div className="sidebar-feature-row" key={chat.id}>
              <Avatar type="sm" image={chat.profilePicture} />
              <span className="sidebar-feature-copy">
                <strong>{chat.name}</strong>
                <small>Recent chat</small>
              </span>
              <button
                className="sidebar-feature-action"
                type="button"
                aria-label={`Call ${chat.name}`}
                title={`Call ${chat.name}`}
                onClick={() => dispatch({
                  type: reducerCases.SET_VOICE_CALL,
                  voiceCall: { ...user, type: "out-going", callType: "audio", roomId: Date.now() },
                })}
              ><FiPhone /></button>
              <button
                className="sidebar-feature-action"
                type="button"
                aria-label={`Video call ${chat.name}`}
                title={`Video call ${chat.name}`}
                onClick={() => dispatch({
                  type: reducerCases.SET_VIDEO_CALL,
                  videoCall: { ...user, type: "out-going", callType: "video", roomId: Date.now() },
                })}
              ><FiVideo /></button>
            </div>
          );
        }) : <p className="sidebar-feature-empty">Your recent chats will appear here when you have a conversation.</p>}
      </section>
    );
  }

  if (section === "status") {
    return (
      <section className="sidebar-feature-view">
        <header className="sidebar-feature-heading">
          <button className="sidebar-feature-back" type="button" onClick={onBackToChats} aria-label="Back to home chats">‹ <span>Chats</span></button>
          <h2>Status</h2>
          <p>Updates from people in your chats.</p>
        </header>
        {chats.length ? chats.map((chat) => (
          <button
            className="sidebar-feature-row sidebar-status-row"
            type="button"
            key={chat.id}
            onClick={() => dispatch({
              type: reducerCases.CHANGE_CURRENT_CHAT_USER,
              user: getChatUser(chat, userInfo?.id),
            })}
          >
            <Avatar type="sm" image={chat.profilePicture} />
            <span className="sidebar-feature-copy">
              <strong>{chat.name}</strong>
              <small>{chat.about || "Available"}</small>
            </span>
          </button>
        )) : <p className="sidebar-feature-empty">No updates yet. Start a chat to see people here.</p>}
      </section>
    );
  }

  if (section === "archive") {
    return (
      <section className="sidebar-feature-view">
        <header className="sidebar-feature-heading">
          <button className="sidebar-feature-back" type="button" onClick={onBackToChats} aria-label="Back to home chats">‹ <span>Chats</span></button>
          <h2>Archived chats</h2>
          <p>Archived conversations are kept on this device.</p>
        </header>
        {archived.length ? archived.map((chat) => (
          <div className="sidebar-feature-row" key={chat.id}>
            <Avatar type="sm" image={chat.profilePicture} />
            <span className="sidebar-feature-copy"><strong>{chat.name}</strong><small>{chat.message || "Conversation"}</small></span>
            <button
              className="sidebar-text-action"
              type="button"
              onClick={() => onToggleArchive(chat.id)}
            >Unarchive</button>
          </div>
        )) : <p className="sidebar-feature-empty">No archived chats. Use the archive control on a chat to move it here.</p>}
      </section>
    );
  }

  return null;
}
