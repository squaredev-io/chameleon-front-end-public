import * as React from "react";
import Image from "next/image";
import EuFlag from "../../../public/icons/eu-flag.png";
import { AppConfig } from "@/lib/AppConfig";

const MapFooter = () => (
  <div
    className="fixed bottom-0 left-0 right-0 w-full bg-white flex justify-between items-center z-[1000] border-t border-gray-200"
    style={{ height: `${AppConfig.ui.footerHeight}px` }}
  >
    <div className="flex justify-start items-center gap-[10px] ml-[20px] overflow-hidden">
      <Image
        src={EuFlag.src}
        alt="EuFlag"
        width="30"
        height="20"
        objectFit="contain"
      />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">
        Chameleon has received funding from the European Union's Horizon 2022 research and innovation programme under grant agreement No. 101060529.
      </span>
    </div>
  </div>
);

export default MapFooter;
