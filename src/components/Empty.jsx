import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-[100vh] border-b-4 border-b-icon-green items-center justify-center">
      <video src="/dcddc.mp4" autoPlay loop muted playsInline style={{ height: 450, width: 450, mixBlendMode: 'screen', filter: 'contrast(1.1) brightness(1.1)' }} />
    </div>
  );
}

export default Empty;
