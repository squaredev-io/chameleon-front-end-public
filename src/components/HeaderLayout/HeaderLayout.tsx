"use client";

import TopBar from "../TopBar/TopBar";
import { useResizeDetector } from "react-resize-detector";
import { AppConfig } from "@/lib/AppConfig";
import { useEffect } from "react";
import useUI from "@/lib/hooks/useUI";

type LayoutProps = {
  children: React.ReactNode
}

const HeaderLayout = ({ children }: LayoutProps) => {
  const { changeViewportInfo } = useUI();

  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef
  } = useResizeDetector({
    refreshMode: "debounce",
    refreshRate: 200
  });

  useEffect(() => {
    changeViewportInfo({
      viewportWidth: viewportWidth as number,
      viewportHeight: viewportHeight as number
    });
  }, [viewportWidth, viewportHeight]);

  return (
    <div ref={viewportRef}>
      <TopBar />
      <div
        className={`absolute w-full h-full bg-chamBeige-200`}
        style={{
          top: AppConfig.ui.topBarHeight,
          width: viewportWidth ?? "100%",
          height: viewportHeight ? viewportHeight - AppConfig.ui.topBarHeight : "-webkit-fill-available"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default HeaderLayout;
