import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import Chat from "@/components/Chat/Chat";
import ChatList from "@/components/Chatlist/ChatList";
import Empty from "@/components/Empty";
import IncomingCall from "@/components/common/IncomingCall";
import IncomingVideoCall from "@/components/common/IncomingVideoCall";
import SearchMessages from "@/components/Chat/SearchMessages";
import VideoCall from "@/components/Call/VideoCall";
import VoiceCall from "@/components/Call/VoiceCall";
import LoginScreen from "@/components/LoginScreen";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import {
  CHECK_USER_ROUTE,
  GET_MESSAGES_ROUTE,
  HOST,
  onBoardUserRoute,
  UPDATE_GUEST_PROFILE_ROUTE,
} from "@/utils/ApiRoutes";

export default function Main() {
  const [
    {
      userInfo,
      currentChatUser,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
      messageSearch,
    },
    dispatch,
  ] = useStateProvider();
  const socket = useRef();
  const [guestReady, setGuestReady] = useState(false);
  const [guestError, setGuestError] = useState("");
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [creatingGuest, setCreatingGuest] = useState(false);
  const [loginName, setLoginName] = useState("");

  const startGuestSession = async (chosenName) => {
    const name = chosenName.trim();
    if (name.length < 2 || name.length > 40) {
      setGuestError("Choose a display name between 2 and 40 characters.");
      return;
    }

    setCreatingGuest(true);
    setGuestError("");
    try {
      let guestEmail = localStorage.getItem("guestEmail");
      let guestUid = localStorage.getItem("guestUid");
      if (!guestEmail || !guestUid) {
        const randomId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        guestEmail = `guest-${randomId}@guest.local`;
        guestUid = `guest-${randomId}`;
        localStorage.setItem("guestEmail", guestEmail);
        localStorage.setItem("guestUid", guestUid);
      }

      const checkResponse = await axios.post(CHECK_USER_ROUTE, {
        email: guestEmail,
      });
      let profile = checkResponse.data.data;

      if (checkResponse.data.status && profile.name !== name) {
        const updateResponse = await axios.patch(
          UPDATE_GUEST_PROFILE_ROUTE(profile.id),
          { name }
        );
        profile = updateResponse.data.user;
      } else if (!checkResponse.data.status) {
        const avatarResponse = await fetch("/default_avatar.png");
        const avatarBlob = await avatarResponse.blob();
        const avatarImage = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarBlob);
        });

        const createResponse = await axios.post(onBoardUserRoute, {
          email: guestEmail,
          firebaseUid: guestUid,
          name,
          about: "Available",
          image: avatarImage,
        });
        profile = createResponse.data.data;
      }

      if (!profile?.id || !profile?.handle) {
        throw new Error(
          "The backend did not return a profile handle. Apply the backend Prisma migration and restart the server."
        );
      }

      localStorage.setItem("guestName", profile.name);
      localStorage.setItem("guestProfileConfigured", "true");
      localStorage.setItem("userId", profile.id);
      dispatch({
        type: reducerCases.SET_USER_INFO,
        userInfo: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          handle: profile.handle,
          phoneNumber: profile.phoneNumber || `8${String(profile.id).padStart(7, "0")}`,
          profileImage: profile.profilePicture,
          status: profile.about,
        },
      });
      setNeedsDisplayName(false);
      setGuestReady(true);
    } catch (error) {
      console.error("Failed to start guest session:", error);
      setGuestError(
        error.response?.data?.msg ||
          error.message ||
          "Could not create your profile. Check the backend and its database migration."
      );
    } finally {
      setCreatingGuest(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      setGuestReady(true);
      return;
    }

    const savedName = localStorage.getItem("guestName");
    setLoginName(savedName || "");
    setNeedsDisplayName(true);
  }, []);

  useEffect(() => {
    if (!userInfo?.id) return undefined;
    const activeSocket = io(HOST, { reconnection: true });
    socket.current = activeSocket;
    const registerUser = () => activeSocket.emit("add-user", userInfo.id);
    const onMessage = (data) => {
      if (!data?.message) return;
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: { ...data.message },
        fromSelf: false,
      });
    };
    const onOnlineUsers = ({ onlineUsers }) => {
      dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
    };
    const onReadReceipt = ({ id, recieverId }) => {
      dispatch({ type: reducerCases.SET_MESSAGES_READ, id, recieverId });
    };
    const onIncomingVoiceCall = ({ from, roomId, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VOICE_CALL,
        incomingVoiceCall: { ...from, roomId, callType },
      });
    };
    const onVoiceCallRejected = () => {
      dispatch({ type: reducerCases.SET_INCOMING_VOICE_CALL, incomingVoiceCall: undefined });
      dispatch({ type: reducerCases.SET_VOICE_CALL, voiceCall: undefined });
    };
    const onIncomingVideoCall = ({ from, roomId, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VIDEO_CALL,
        incomingVideoCall: { ...from, roomId, callType },
      });
    };
    const onVideoCallRejected = () => {
      dispatch({ type: reducerCases.SET_INCOMING_VIDEO_CALL, incomingVideoCall: undefined });
      dispatch({ type: reducerCases.SET_VIDEO_CALL, videoCall: undefined });
    };

    activeSocket.on("connect", registerUser);
    activeSocket.on("msg-recieve", onMessage);
    activeSocket.on("online-users", onOnlineUsers);
    activeSocket.on("mark-read-recieve", onReadReceipt);
    activeSocket.on("incoming-voice-call", onIncomingVoiceCall);
    activeSocket.on("voice-call-rejected", onVoiceCallRejected);
    activeSocket.on("incoming-video-call", onIncomingVideoCall);
    activeSocket.on("video-call-rejected", onVideoCallRejected);
    if (activeSocket.connected) registerUser();
    dispatch({ type: reducerCases.SET_SOCKET, socket });
    return () => {
      activeSocket.off("connect", registerUser);
      activeSocket.off("msg-recieve", onMessage);
      activeSocket.off("online-users", onOnlineUsers);
      activeSocket.off("mark-read-recieve", onReadReceipt);
      activeSocket.off("incoming-voice-call", onIncomingVoiceCall);
      activeSocket.off("voice-call-rejected", onVoiceCallRejected);
      activeSocket.off("incoming-video-call", onIncomingVideoCall);
      activeSocket.off("video-call-rejected", onVideoCallRejected);
      activeSocket.disconnect();
      if (socket.current === activeSocket) socket.current = undefined;
    };
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    if (!userInfo?.id || !currentChatUser?.id) return;
    let cancelled = false;
    axios
      .get(`${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`)
      .then(({ data }) => {
        if (!cancelled) {
          dispatch({ type: reducerCases.SET_MESSAGES, messages: data.messages || [] });
        }
      })
      .catch((error) => console.error("Failed to load chat messages:", error));
    return () => {
      cancelled = true;
    };
  }, [currentChatUser?.id, userInfo?.id, dispatch]);

  if (needsDisplayName && !guestReady) {
    return (
      <LoginScreen
        initialName={loginName}
        error={guestError}
        busy={creatingGuest}
        onContinue={(name) => {
          setLoginName(name);
          startGuestSession(name);
        }}
      />
    );
  }

  if (!guestReady) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-panel-header-background text-white">
        <p>{guestError || "Connecting to chat…"}</p>
        {guestError && (
          <button
            className="rounded bg-[#00a884] px-4 py-2"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {incomingVoiceCall && <IncomingCall />}
      {incomingVideoCall && <IncomingVideoCall />}
      {videoCall && <div className="h-screen w-screen overflow-hidden"><VideoCall /></div>}
      {voiceCall && <div className="h-screen w-screen overflow-hidden"><VoiceCall /></div>}
      {!videoCall && !voiceCall && (
        <div className="chat-app-shell grid h-screen w-screen max-h-screen max-w-full overflow-hidden">
          <ChatList />
          {currentChatUser ? (
              <div className={messageSearch ? "grid min-w-0 grid-cols-2" : "min-w-0"}>
                <Chat />
                {messageSearch && <SearchMessages />}
              </div>
            ) : (
              <Empty />
            )}
        </div>
      )}
    </>
  );
}