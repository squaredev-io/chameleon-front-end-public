"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { createTw } from "react-pdf-tailwind";
import { BUNDLES_LITERALS } from "@/lib/constants";
import { pdfContentTailwind } from "@/components/PDFReportGenerator/QuantificationOfLogsContentTemplate";

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
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

const HeaderContent = ({ bundleName, coordinates }) => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  return (
    <View fixed style={styles.fixedHeader}>
      {/* Header Section */}
      <View style={pdfContentTailwind("flex flex-row justify-end")}>
        <View style={pdfContentTailwind("flex flex-col w-1/2 pt-12 pl-4 pl-10")}>
          <Text style={pdfContentTailwind("font-bold pb-2")}>Bundle:</Text>
          <Text style={pdfContentTailwind("text-base max-w-full overflow-hidden text-ellipsis whitespace-nowrap")}>
            {BUNDLES_LITERALS[bundleName]}
          </Text>
        </View>
      </View>

      {/* Document Info Section */}
      <View style={pdfContentTailwind("flex flex-row pt-16")}>
        <View style={pdfContentTailwind("w-1/2 pl-4 flex flex-row items-center")}>
          <View style={pdfContentTailwind("mr-5")}>
            <Image
              src="/icon_document.png"
              style={pdfContentTailwind("rounded-full w-16 h-12")}
            />
          </View>
          <View style={pdfContentTailwind("flex flex-col")}>
            <Text>{"Report"}</Text>
            <Text style={pdfContentTailwind("text-base")}>{`Date: ${date}`}</Text>
            <Text style={pdfContentTailwind("text-base")}>{`Time: ${time}`}</Text>
          </View>
        </View>
        <View style={pdfContentTailwind("w-1/2 pl-4 flex flex-row items-center")}>
          <View style={pdfContentTailwind("mr-5")}>
            <Image
              src="/icon_coordinates.png"
              style={pdfContentTailwind("rounded-full w-14 h-12")}
            />
          </View>
          <View style={pdfContentTailwind("flex flex-col")}>
            <Text>{"Coordinates"}</Text>
            <Text style={pdfContentTailwind("text-base")}>{`Upper left: ${coordinates?.upperLeft}`}</Text>
            <Text style={pdfContentTailwind("text-base")}>{`Lower right: ${coordinates?.lowerRight}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface PDFDocumentTemplateWrapperProps {
  bundleName: string;
  coordinates?: {
    upperLeft: string;
    lowerRight: string;
  };
  children?: React.ReactNode;
}

const PDFDocumentTemplateWrapper: React.FC<PDFDocumentTemplateWrapperProps> = (
  { bundleName, coordinates, children }
) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Background and Header - fixed on all pages */}
      <Image fixed style={styles.pageBackground} src="/background.png" />
      <HeaderContent
        bundleName={bundleName}
        coordinates={coordinates}
      />
      {children}
    </Page>
  </Document>
);

export default PDFDocumentTemplateWrapper;
