"use client";

import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import PDFDocumentTemplateWrapper from "@/components/PDFReportGenerator/PDFDocumentTemplateWrapper";
import { Histogram } from "@/components/PDFReportGenerator/Charts";

// Register the font family and weights with URLs
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
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
    width: "90%",
    height: "auto",
    objectFit: "contain"
  },
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // padding: 5,
    gap: 10
  },
  gridItem: {
    width: "47%",
    minHeight: 250
    // marginBottom: 10,
    // padding: 10,
    // border: "1px solid #CCCCCC"
    // borderRadius: 5,
    // backgroundColor: "#FAFAFA"
  },
  sectionTitle: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
    textDecoration: "underline"
  },
  gridItemTitle: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center"
  },
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
  },
  table: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    marginTop: 10
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 24,
    textAlign: "center"
  },
  tableHeader: {
    // backgroundColor: "#E4E4E4",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 10
  },
  tableHeaderCell: {
    width: "50%",
    padding: 5,
    textAlign: "center"
  },
  tableCell: {
    width: "50%",
    padding: 5,
    textAlign: "center",
    fontFamily: "Open Sans",
    fontSize: 10
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "85%"
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

export interface PDFContentTemplateProps {
  bundleName: string;
  coordinates: {
    upperLeft: string;
    lowerRight: string;
  };
  reportData: any;
  mapImageSrc?: string[];
}

const CropGrowthContentTemplate: React.FC<PDFContentTemplateProps> = (
  {
    bundleName,
    coordinates,
    reportData,
    mapImageSrc
  }) => (
  <PDFDocumentTemplateWrapper bundleName={bundleName} coordinates={coordinates}>
    {/* Main content */}
    <View style={pdfContentTailwind("top-[185px] bottom-[55px]")}>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Analysis</Text>

      {/* 2x2 Grid Layout */}
      <View style={styles.gridContainer}>
        {/* Top Left: Histogram */}
        <View style={styles.gridItem}>
          <Text style={styles.gridItemTitle}>GCC Value Distribution</Text>
          {
            reportData && reportData.histogramData ? (
              <Histogram data={reportData.histogramData} width={250} height={250} />
            ) : (
              <Text style={styles.bodyText}>No histogram data available</Text>
            )
          }
        </View>

        {/* Top Right: Statistics as Table */}
        <View style={styles.gridItem}>
          <Text style={styles.gridItemTitle}>GCC Statistics</Text>
          {
            reportData && reportData.statistics ? (
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableHeaderCell}>Metric</Text>
                  <Text style={styles.tableHeaderCell}>All Vines</Text>
                  <Text style={styles.tableHeaderCell}>Vines with Alarms</Text>
                </View>

                {/* Table Rows */}
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>GCC Mean</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMean.toFixed(4)}</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMeanAlarm.toFixed(4)}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>GCC Max</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMax.toFixed(4)}</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMaxAlarm.toFixed(4)}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>GCC Min</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMin.toFixed(4)}</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccMinAlarm.toFixed(4)}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>GCC Std</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccStd.toFixed(4)}</Text>
                  <Text style={styles.tableCell}>{reportData.statistics.gccStdAlarm.toFixed(4)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.bodyText}>No statistics data available</Text>
            )
          }
        </View>

        {/* Bottom Left: GCC Map image */}
        {
          mapImageSrc && mapImageSrc[0] && (
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>GCC Map</Text>
              <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-1 pb-1")}>
                <Image
                  src={mapImageSrc[0]}
                  style={styles.image}
                />
              </View>
            </View>
          )
        }

        {/* Bottom Right: Vines with Alert image */}
        {
          mapImageSrc && mapImageSrc[1] && (
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>Vines with Alert</Text>
              <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-1 pb-1")}>
                <Image
                  src={mapImageSrc[1]}
                  style={styles.image}
                />
              </View>
            </View>
          )
        }
      </View>
    </View>
  </PDFDocumentTemplateWrapper>
);

export default CropGrowthContentTemplate;