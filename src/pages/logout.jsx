import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

function logout() {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  useEffect(() => {
    socket?.current?.emit("signout", userInfo?.id);
    dispatch({
      type: reducerCases.SET_USER_INFO,
      userInfo: undefined,
    });
    localStorage.removeItem("guestEmail");
    localStorage.removeItem("guestUid");
    localStorage.removeItem("userId");
    router.push("/");
  }, [socket]);
  return <div className="bg-conversation-panel-background"></div>;
}

export default logout;
