import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-[100vh] border-b-4 border-b-icon-green items-center justify-center">
      <Image src="https://cdn.discordapp.com/attachments/1364573740406411295/1501331269219520512/IMG_4024.gif?ex=69fc57f3&is=69fb0673&hm=f4b0c7255b29e1370432355f7dbd7d543a1ad95f494323aca6c091b36930c03c&" alt="whatsapp-gif" height={300} width={300} />
    </div>
  );
}

export default Empty;
