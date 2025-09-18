"use client";

import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import PDFDocumentTemplate from "./PDFDocumentTemplate";
import { HealthStatusOfVegetationReportProps } from "@/components/Map/bundles/HealthStatusOfVegetation";
import { PieChartComponent, PieChartLegend } from "@/components/PDFReportGenerator/Charts";

// Register the font family and weights with URLs
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
});

export const contentTemplateFontStyles = StyleSheet.create({
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
  },
  bodyTextBold: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
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
    width: "100%",
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
  reportData: HealthStatusOfVegetationReportProps;
  mapImageSrc?: string[];
}

const HealthStatusOfVegetationPieChartDefaultColors = ["#00C49F", "#FF8042", "#FF0000"];

const HealthStatusOfVegetationContentTemplate: React.FC<PDFContentTemplateProps> = (
  {
    bundleName,
    coordinates,
    reportData,
    mapImageSrc
  }) => (
  <PDFDocumentTemplate bundleName={bundleName} coordinates={coordinates}>
    <View style={pdfContentTailwind("absolute top-[185px] bottom-[55px] left-0 right-0")}>

      {/* Bundle Overview Section */}
      <View style={pdfContentTailwind("flex flex-row items-center justify-center pt-4")}>
        <Text style={pdfContentTailwind("font-bold text-lg pt-1 underline")}>{"Overview"}</Text>
      </View>

      {/* Bundle Execution Overview Details */}
      <View style={pdfContentTailwind("flex flex-col justify-start pt-2 pb-2 px-12")}>
        <View style={pdfContentTailwind("flex flex-row gap-1")}>
          <Text style={contentTemplateFontStyles.bodyTextBold}>Total inspected area:</Text>
          <Text style={contentTemplateFontStyles.bodyText}>{`${reportData.totalInspectedArea} ha`}</Text>
        </View>
        <View style={pdfContentTailwind("flex flex-row gap-1")}>
          <Text style={contentTemplateFontStyles.bodyTextBold}>Canopy cover:</Text>
          <Text style={contentTemplateFontStyles.bodyText}>{`${reportData.canopyCover}%`}</Text>
        </View>
        <View style={pdfContentTailwind("flex flex-row gap-1")}>
          <Text style={contentTemplateFontStyles.bodyTextBold}>Detected trees:</Text>
          <Text style={contentTemplateFontStyles.bodyText}>{`${reportData.detectedTrees}`}</Text>
        </View>
      </View>

      {
        reportData.indexProps.map((reportEntry, index) => (
          <View
            key={reportEntry.index}
            style={pdfContentTailwind("flex flex-col justify-center items-center pt-2 pb-2 px-12")}
          >
            {/*  Vegetation Index Title Section */}
            <Text style={pdfContentTailwind("font-bold text-lg pt-1 underline")}>
              {`Results based on ${reportEntry.index} vegetation index`}
            </Text>

            <View style={pdfContentTailwind("flex flex-row justify-center items-center gap-4 pt-4 pb-4")}>
              {/* Map Snapshot of Vegetation Index and Footer under image */}
              {
                mapImageSrc && mapImageSrc[index] && (
                  <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-4 pb-4")}>
                    <Image
                      src={mapImageSrc[index]}
                      style={style.bigImage}
                    />
                    <Text style={contentTemplateFontStyles.bodyText}>
                      {`Stressed Threshold: ${reportEntry.stressedThreshold} | Dead Threshold: ${reportEntry.deadThreshold}`}
                    </Text>
                  </View>
                )
              }
              {/* Chart and legend */}
              <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-4 pb-4")}>
                <Text style={contentTemplateFontStyles.title}>Statistics</Text>
                <View style={pdfContentTailwind("pt-2")}>
                  <PieChartComponent
                    data={reportEntry.pieChartData}
                    width={120}
                    height={120}
                    colors={HealthStatusOfVegetationPieChartDefaultColors}
                  />
                </View>
                <PieChartLegend
                  data={reportEntry.pieChartData}
                  colors={HealthStatusOfVegetationPieChartDefaultColors}
                />
              </View>
            </View>
          </View>
        ))
      }

    </View>

  </PDFDocumentTemplate>
);

export default HealthStatusOfVegetationContentTemplate;
