import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-[100vh] border-b-4 border-b-icon-green items-center justify-center pb-48">
      <div className="flex flex-col items-center">
        <video src="/dcddc.mp4" autoPlay loop muted playsInline style={{ height: 450, width: 450, mixBlendMode: 'screen', filter: 'contrast(1.1) brightness(1.1)' }} />
        <span className="font-semibold -mt-28" style={{ color: '#20d360', fontSize: '5rem' }}>Rextails</span>
      </div>
    </div>
  );
}

export default Empty;
