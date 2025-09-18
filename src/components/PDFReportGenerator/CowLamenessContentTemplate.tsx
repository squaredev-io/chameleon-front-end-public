"use client";

import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import { PieChartComponent, PieChartLegend } from "./Charts";
import { CowLamenessReportPreparedProps } from "@/components/Map/bundles/CowLamenessDetection";
import PDFDocumentTemplateWrapper from "@/components/PDFReportGenerator/PDFDocumentTemplateWrapper";

// Register the font family and weights with URLs
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
});

// ToDo: rework this into styles and move all duplicates of this and the overall styling stuff to the PDFDocumentTemplateWrapper
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
    paddingBottom: 7,
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
    maxHeight: 300,
    width: "auto",
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
  },
  subtitle: {
    fontFamily: "Open Sans",
    fontWeight: "normal",
    fontSize: 10,
    textAlign: "center",
    marginVertical: 10
  }
});

export interface PDFContentTemplateProps {
  bundleName: string;
  coordinates: {
    upperLeft: string;
    lowerRight: string;
  };
  // ToDo: change this to make it universal and relocate it to the PDFReportGeneratorUtils
  reportData: CowLamenessReportPreparedProps;
  mapImageSrc?: string[];
}

const CowLamenessContentTemplate: React.FC<PDFContentTemplateProps> = (
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

      {/* Map location Snapshot and Pie Chart */}
      {
        mapImageSrc && mapImageSrc[0] ? (
          <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
            <Text style={cowLamenessContentTemplateFontStyles.titleWithSpace}>Location</Text>
            <Image
              src={mapImageSrc[0]}
              style={styles.bigImage}
            />
          </View>
        ) : null
      }

      {/* Bundle Execution Result */}
      <Text style={styles.sectionTitle}>Results:</Text>
      <Text style={styles.subtitle}>{reportData.overviewValue}</Text>

      {/* Image/Chart pairs with page handling for initial page */}
      {
        reportData.overviewValue !== "Invalid metrics for gait analysis" && reportData.images && reportData.images.length && [reportData.images[0], reportData.images[1]].map((reportEntry) =>
            reportEntry && (
              <View key={reportEntry.imageSrc} style={styles.imagesPairClose}>
                <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
                  <Text style={cowLamenessContentTemplateFontStyles.titleWithSpace}>{reportEntry.animalId}</Text>
                  <Image
                    src={reportEntry.imageSrc}
                    style={styles.image}
                  />
                </View>
                <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
                  <Text style={cowLamenessContentTemplateFontStyles.title}>Probability to Lameness Class</Text>
                  <PieChartComponent data={reportEntry.pieChartData} />
                  <PieChartLegend data={reportEntry.pieChartData} />
                </View>
              </View>
            )
        )
      }
    </View>

    {
      /* Add a page break after the rest of Image/Chart pairs for subsequent pages */
      reportData.images.length > 1 && (
        <View break style={pdfContentTailwind("top-[210px] bottom-[55px]")}>
          {
            reportData.images.slice(2, reportData.images.length).map((reportEntry) =>
                reportEntry && (
                  <View key={reportEntry.imageSrc} style={styles.imagesPairClose}>
                    <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
                      <Text style={cowLamenessContentTemplateFontStyles.titleWithSpace}>{reportEntry.animalId}</Text>
                      <Image
                        src={reportEntry.imageSrc}
                        style={styles.image}
                      />
                    </View>
                    <View style={pdfContentTailwind("flex flex-col items-center justify-center")}>
                      <Text style={cowLamenessContentTemplateFontStyles.title}>Probability to Lameness Class</Text>
                      <PieChartComponent data={reportEntry.pieChartData} />
                      <PieChartLegend data={reportEntry.pieChartData} />
                    </View>
                  </View>
                )
            )
          }
        </View>
      )
    }
  </PDFDocumentTemplateWrapper>
);

export default CowLamenessContentTemplate;
