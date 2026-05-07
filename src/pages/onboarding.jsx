import React, { useEffect, useState } from "react";
import Avatar from "../components/common/Avatar";
import Input from "../components/common/Input";
import axios from "axios";
import { onBoardUserRoute } from "../utils/ApiRoutes";

import Resizer from "react-image-file-resizer";

import Image from "next/image";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";

export default function OnBoarding() {
  const router = useRouter();

  const [{ userInfo, newUser }, dispatch] = useStateProvider();

  const [image, setImage] = useState("/default_avatar.png");
  const [name, setName] = useState(userInfo?.name || "");
  const [about, setAbout] = useState("");

  useEffect(() => {
    if (!newUser && !userInfo?.email) router.push("/login");
    else if (!newUser && userInfo?.email) router.push("/");
  }, [newUser, userInfo, router]);

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        "PNG",
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    });

  const onBoardUser = async () => {
    if (validateDetails()) {
      const email = userInfo?.email;
      try {
        const base64Response = await fetch(`${image}`);
        const blob = await base64Response.blob();
        setImage(await resizeFile(blob));
        const { data } = await axios.post(onBoardUserRoute, {
          email,
          name,
          about,
          
      firebaseUid: userInfo.firebaseUid,   // FIXED
          image,
        });
        if (data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              
          firebaseUid: userInfo.firebaseUid,
              profileImage: image,
              status: about,
            },
          });

          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const validateDetails = () => {
    if (name.length < 3) {
      // Toast Notification
      return false;
    }
    return true;
  };

  return (
    <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center justify-center gap-2">
          <video
            src="/dcddc.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-16 w-16"
            style={{ mixBlendMode: 'screen', filter: 'contrast(1.1) brightness(1.1)' }}
          />
          <span className="text-4xl font-light">WhatsApp</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: '#20d360' }}>Rextails</span>
      </div>

      <div className="bg-[#202c33] p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl text-center mb-6">Create your profile</h2>
        
        <div className="flex flex-col items-center gap-6">
          <Avatar type="xl" image={image} setImage={setImage} />
          
          <div className="w-full flex flex-col gap-4">
            <Input name="Display Name" state={name} setState={setName} label />
            <Input name="About" state={about} setState={setAbout} label />
          </div>
          
          <button
            className="w-full bg-[#00a884] hover:bg-[#06cf9c] transition-colors py-3 px-6 rounded-lg font-medium mt-2"
            onClick={onBoardUser}
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
}
