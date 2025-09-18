"use client";

import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import { LivestockManagementReportProps } from "@/components/Map/bundles/LivestockManagement";
import { cowLamenessContentTemplateFontStyles } from "@/components/PDFReportGenerator/CowLamenessContentTemplate";
import PDFDocumentTemplateWrapper from "@/components/PDFReportGenerator/PDFDocumentTemplateWrapper";

// Register the font family and weights with URLs
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
});

export const livestockContentTemplateFontStyles = StyleSheet.create({
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

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#ffffff"
  },
  pageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
  },
  contentWrapper: {
    flexGrow: 1
  },
  image: {
    width: 170,
    height: "auto",
    objectFit: "contain"
  },
  bigImage: {
    maxWidth: 300,
    width: "100%",
    height: "auto",
    objectFit: "contain"
  },
  imagesPair: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 5
  },
  imagesPairClose: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 5,
    gap: 50
  },
  imageWrapper: {
    width: "70%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 185 // Height of header
  },
  sectionTitle: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
    textDecoration: "underline"
  }
});

export interface PDFContentTemplateProps {
  bundleName: string;
  coordinates: {
    upperLeft: string;
    lowerRight: string;
  };
  reportData: LivestockManagementReportProps[];
  mapImageSrc?: string[];
}

const LivestockManagementContentTemplate: React.FC<PDFContentTemplateProps> = (
  {
    bundleName,
    coordinates,
    reportData,
    mapImageSrc
  }) => (
  <PDFDocumentTemplateWrapper bundleName={bundleName} coordinates={coordinates}>
    {/* Main content */}
    <View style={pdfContentTailwind("top-[185px] bottom-[55px]")}>

      {/* Bundle Overview Section */}
      <Text style={styles.sectionTitle}>Overview</Text>

      {/* Map location Snapshot */}
      {
        mapImageSrc && mapImageSrc[0] ? (
          <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
            <Text style={cowLamenessContentTemplateFontStyles.titleWithSpace}>Herd Trail Location</Text>
            <Image
              src={mapImageSrc[0]}
              style={styles.bigImage}
            />
          </View>
        ) : null
      }

      {/* Bundle Overview Section */}
      <Text style={styles.sectionTitle}>Additional Info</Text>

      {/* Pairs of Animal/Herd Images and their respective details for the initial report page */}
      {
        [reportData[0], reportData[1]].map(reportEntry => (
          <View
            key={reportEntry.frameNumber}
            style={styles.imagesPairClose}
            wrap={false}
          >
            {
              reportEntry.imageSrc && (
                <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-1 pb-1")}>
                  <Image
                    src={reportEntry.imageSrc}
                    style={styles.image}
                  />
                </View>
              )
            }
            <View style={pdfContentTailwind("flex flex-col justify-start pt-1 pb-1")}>
              <View style={pdfContentTailwind("flex flex-row gap-1")}>
                <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Coordinates:</Text>
                <Text
                  style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.coordinates.join(", ")}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row gap-1")}>
                <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Appearance:</Text>
                <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.appearance}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row gap-1")}>
                <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Detected Animals:</Text>
                <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.detectedAnimals}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row gap-1")}>
                <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Message to User:</Text>
                <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.message}`}</Text>
              </View>
            </View>
          </View>
        ))
      }
    </View>

    {
      /* Add a page break after the rest of Image/Herd - info pairs for subsequent pages */
      reportData.length > 2 && (
        <View break style={pdfContentTailwind("top-[210px] bottom-[55px]")}>
          {
            reportData.slice(2, reportData.length).map(reportEntry => (
              <View
                key={reportEntry.frameNumber}
                style={styles.imagesPairClose}
                wrap={false}
              >
                {
                  reportEntry.imageSrc && (
                    <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-1 pb-1")}>
                      <Image
                        src={reportEntry.imageSrc}
                        style={styles.image}
                      />
                    </View>
                  )
                }
                <View style={pdfContentTailwind("flex flex-col justify-start pt-1 pb-1")}>
                  <View style={pdfContentTailwind("flex flex-row gap-1")}>
                    <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Coordinates:</Text>
                    <Text
                      style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.coordinates.join(", ")}`}</Text>
                  </View>
                  <View style={pdfContentTailwind("flex flex-row gap-1")}>
                    <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Appearance:</Text>
                    <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.appearance}`}</Text>
                  </View>
                  <View style={pdfContentTailwind("flex flex-row gap-1")}>
                    <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Detected Animals:</Text>
                    <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.detectedAnimals}`}</Text>
                  </View>
                  <View style={pdfContentTailwind("flex flex-row gap-1")}>
                    <Text style={livestockContentTemplateFontStyles.bodyTextBold}>Message to User:</Text>
                    <Text style={livestockContentTemplateFontStyles.bodyText}>{`${reportEntry.message}`}</Text>
                  </View>
                </View>
              </View>
            ))
          }
        </View>
      )
    }

  </PDFDocumentTemplateWrapper>
);

export default LivestockManagementContentTemplate;
