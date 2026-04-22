import React, { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] bg-background relative shadow-2xl flex flex-col h-[100dvh] overflow-hidden border-x border-white/5">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 no-scrollbar">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
