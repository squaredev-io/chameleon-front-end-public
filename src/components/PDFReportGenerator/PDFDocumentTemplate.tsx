"use client";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import { BUNDLES_LITERALS } from "@/lib/constants";

const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Verdana", "Open Sans", "sans-serif"]
    },
    extend: {
      colors: {
        custom: "#bada55"
      }
    }
  }
});

interface PDFDocumentProps {
  bundleName: string;
  coordinates?: {
    upperLeft: string;
    lowerRight: string;
  };
  children?: React.ReactNode;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ bundleName, coordinates, children }) => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  return (
    <Document>
      <Page size="A4">
        <View fixed style={tw("relative w-full h-full")}>
          <Image
            style={tw("absolute top-0 left-0 w-full h-full z-[-1]")}
            src="/background.png"
          />
          <View style={tw("flex flex-row justify-end")}>
            <View style={tw("flex flex-col w-1/2 pt-12 pl-4")}>
              <Text style={tw("font-bold pb-2")}>{"Bundle:"}</Text>
              <Text
                style={tw(
                  "text-base max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                )}
              >
                {BUNDLES_LITERALS[bundleName]}
              </Text>
            </View>
          </View>
          <View style={tw("flex flex-row pt-16")}>
            <View style={tw("w-1/2 pl-4 flex flex-row items-center")}>
              <View style={tw("mr-5")}>
                <Image
                  src={"/icon_document.png"}
                  style={tw("rounded-full w-16 h-12")}
                />
              </View>
              <View style={tw("flex flex-col")}>
                <Text>{"Report"}</Text>
                <Text style={tw("text-base")}>{`Date: ${date}`}</Text>
                <Text style={tw("text-base")}>{`Time: ${time}`}</Text>
              </View>
            </View>
            <View style={tw("w-1/2 pl-4 flex flex-row items-center")}>
              <View style={tw("mr-5")}>
                <Image
                  src={"/icon_coordinates.png"}
                  style={tw("rounded-full w-14 h-12")}
                />
              </View>
              <View style={tw("flex flex-col")}>
                <Text>{"Coordinates"}</Text>
                <Text style={tw("text-base")}>{`Upper left: ${coordinates?.upperLeft}`}</Text>
                <Text style={tw("text-base")}>{`Lower right: ${coordinates?.lowerRight}`}</Text>
              </View>
            </View>
          </View>
          {children}
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
