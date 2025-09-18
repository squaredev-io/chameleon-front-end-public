"use client";

import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import { createTw } from "react-pdf-tailwind";
import PDFDocumentTemplate from "./PDFDocumentTemplate";
import { Config } from "../../config";

// Register the font family and weights with URLs
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
});

export const cowLamenessContentTemplateFontStyles = StyleSheet.create({
  title: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 11,
    paddingRight: 4,
    paddingBottom: 1
  },
  titleWithSpace: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 11,
    paddingRight: 4,
    paddingBottom: 4,
    paddingTop: 4
  },
  subtitle: {
    fontFamily: "Open Sans",
    fontWeight: "normal",
    fontSize: 9,
    paddingRight: 4,
    paddingBottom: 1
  },
  bodyText: {
    fontFamily: "Open Sans",
    fontWeight: "normal",
    fontSize: 11
  }
});

export const pdfContentTailwind = createTw({
  theme: {
    fontFamily: {
      sans: ["Open Sans"]
    },
    extend: {
      colors: {
        custom: "#bada55"
      }
    }
  }
});

const style = StyleSheet.create({
  bigImage: {
    width: "75%",
    height: "auto",
    objectFit: "contain"
  }
});

export interface PDFContentTemplateProps {
  bundleName: string;
  coordinates: {
    upperLeft: string;
    lowerRight: string;
  };
  reportData: {
    imageSrc: string;
    overviewValue: string;
  };
  mapImageSrc?: string[];
}

const AutomaticVinesDetectionContentTemplate: React.FC<PDFContentTemplateProps> = (
  {
    bundleName,
    coordinates,
    reportData,
    mapImageSrc
  }) => {
  const [calculatedImageUrl, setCalculatedImageUrl] = useState("");

  useEffect(() => {
    const cogUrl = Config.cogApi;
    // ToDo: remove this karfwto ... and use reportData.imageSrc instead when possible
    // ToDo: add a timeout and if it exceeds it put a message "could not load blah blah" instead of png
    const default_url = "https://eu-003.s3.synologyc2.net/chameleon/crop_growth.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=eublYMNJuhYoEHphUantIvodINy9VC31%2F20250425%2Feu-003%2Fs3%2Faws4_request&X-Amz-Date=20250425T174827Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=7340a51b4c315d70a0772ca2e5d694ffdb0525f11b34d282148fb05e71252a96";
    // const pilot_url = "https://eu-003.s3.synologyc2.net/chameleon/automatic_vines_detection_pilot.tif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=eublYMNJuhYoEHphUantIvodINy9VC31%2F20250425%2Feu-003%2Fs3%2Faws4_request&X-Amz-Date=20250425T173058Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=327884fe309a5e139d0656aa24543d1d4e686e7efb7aa02c84d0213d96db2973";
    setCalculatedImageUrl(`${cogUrl}cog/preview?format=png&url=${encodeURIComponent(default_url)}&width=650&height=350&return_mask=true`);
    // setCalculatedImageUrl(`${cogUrl}cog/preview?format=png&url=${encodeURIComponent(reportData.imageSrc)}&width=650&height=350&return_mask=true`);
  }, []);

  return (
    <PDFDocumentTemplate bundleName={bundleName} coordinates={coordinates}>
      <View style={pdfContentTailwind("absolute top-[185px] bottom-[55px] left-0 right-0")}>

        {/* Bundle Overview Section */}
        <View style={pdfContentTailwind("flex flex-row items-center justify-center pt-4")}>
          <Text style={pdfContentTailwind("font-bold text-lg pt-1 underline")}>{"Overview"}</Text>
        </View>
        {/* Bundle Execution Result */}
        <View style={pdfContentTailwind("flex flex-row pt-2 pb-2 px-12")}>
          <Text style={cowLamenessContentTemplateFontStyles.title}>Number of Detected Vines:</Text>
          {
            reportData.overviewValue ? (
              <Text style={cowLamenessContentTemplateFontStyles.bodyText}>{reportData.overviewValue}</Text>
            ) : null
          }
        </View>

        {/* Detected Vines Image */}
        {
          calculatedImageUrl && (
            <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-2 pb-2")}>
              <Image
                src={calculatedImageUrl}
                style={style.bigImage}
              />
            </View>
          )
        }
        {/* Map location Snapshot */}
        {
          mapImageSrc && mapImageSrc[0] && (
            <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-2 pb-2")}>
              <Text style={cowLamenessContentTemplateFontStyles.titleWithSpace}>{"Location:"}</Text>
              <Image
                src={mapImageSrc[0]}
                style={style.bigImage}
              />
            </View>
          )
        }
      </View>

    </PDFDocumentTemplate>
  );
};

export default AutomaticVinesDetectionContentTemplate;
