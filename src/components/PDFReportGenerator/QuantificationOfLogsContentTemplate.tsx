"use client";

import React from "react";
import { createTw } from "react-pdf-tailwind";
import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { QuantificationOfLogsReportPreparedProps } from "@/components/Map/bundles/QuantificationOfLogs";
import PDFDocumentTemplateWrapper from "@/components/PDFReportGenerator/PDFDocumentTemplateWrapper";

// Register fonts
Font.register({
  family: "Open Sans",
  fonts: [
    { src: "/fonts/open-sans/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/open-sans/OpenSans-Bold.ttf", fontWeight: "bold" }
  ]
});

const quantificationOfLogsContentTemplateFontStyles = StyleSheet.create({
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
    fontSize: 11,
    justifyContent: "flex-end"
  },
  bodyTextBold: {
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 11,
    justifyContent: "flex-start"
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

interface PDFContentTemplateProps {
  bundleName: string;
  coordinates: {
    upperLeft: string;
    lowerRight: string;
  };
  reportData: QuantificationOfLogsReportPreparedProps;
  mapImageSrc?: string[];
}

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

const QuantificationOfLogsContentTemplate: React.FC<PDFContentTemplateProps> = (
  {
    bundleName,
    coordinates,
    reportData,
    mapImageSrc
  }) => {
  const arrayOfImagePairs: [any, any][] = [];

  for (let i = 0; i < reportData.images.length; i += 2) {
    if (i + 1 < reportData.images.length) {
      arrayOfImagePairs.push([reportData.images[i], reportData.images[i + 1]]);
    }
  }

  return (
    <PDFDocumentTemplateWrapper bundleName={bundleName} coordinates={coordinates}>
      {/* Main content */}
      <View style={pdfContentTailwind("top-[185px] bottom-[55px]")}>

        {/* Summary Section - starts on first page */}
        <View>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={pdfContentTailwind("flex flex-row gap-10 items-center pb-2 px-12")}>
            <View style={pdfContentTailwind("flex flex-1 flex-col items-center order-0")}>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Images analyzed:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.imagesTotal}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Images with
                  detections:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.imagesDetected}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Total windthrow
                  detections:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.logCount}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Min. windthrow length,
                  m:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.lengthMin}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Max. windthrow length,
                  m:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.lengthMax}`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Average windthrow length,
                  m:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`${reportData.stats.lengthAverage}`}</Text>
              </View>
            </View>
            <View style={pdfContentTailwind("flex flex-1 flex-col items-center order-1")}>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Input Params:</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Analysis input
                  parameters:</Text>
                <Text
                  style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`-`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Ground sample distance GSD,
                  cm/px:</Text>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`-`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Detection confidence
                  threshold:</Text>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`-`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Coordinate reference system
                  CRS:</Text>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`-`}</Text>
              </View>
              <View style={pdfContentTailwind("flex flex-row justify-between w-full")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>Image cropping
                  fraction:</Text>
                <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>{`-`}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Map location Snapshot and Pie Chart */}
        {
          mapImageSrc && mapImageSrc[0] ? (
            <View>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={pdfContentTailwind("flex flex-col items-center justify-center pt-1 pb-1")}>
                <Text style={quantificationOfLogsContentTemplateFontStyles.titleWithSpace}>
                  Windthrow locations (point clusters):
                </Text>
                <Image
                  src={mapImageSrc[0]}
                  style={styles.bigImage}
                />
              </View>
            </View>
          ) : null
        }

        {/* Images Grid - will automatically flow across pages */}
        <Text style={styles.sectionTitle}>Windthrow detections</Text>

        {/* Image pairs with page handling for initial page */}
        <View style={styles.imagesPair}>
          {
            arrayOfImagePairs[0].map((reportEntry, index) =>
                reportEntry && (
                  <View key={`pair-0-image-${index}`} style={styles.imageWrapper}>
                    <Image src={reportEntry.imageSrc} style={styles.image} />
                    <View style={pdfContentTailwind("flex-row gap-2 mt-2 justify-start")}>
                      <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>
                        GPS Position:
                      </Text>
                      <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>
                        {`${(reportEntry.coordinates.latitude as number).toFixed(7)}, ${(reportEntry.coordinates.longitude as number).toFixed(7)}`}
                      </Text>
                    </View>
                  </View>
                )
            )
          }
        </View>
      </View>

      {
        /* Add a page break after the rest of Image pairs for subsequent pages */
        arrayOfImagePairs.length > 1 && (
          <View break style={pdfContentTailwind("top-[210px] bottom-[55px]")}>
            {
              arrayOfImagePairs.slice(1, arrayOfImagePairs.length).map((pair, pairIndex) => (
                <View key={`pair-${pairIndex}`} style={styles.imagesPair} wrap={false}>
                  {
                    pair.map((reportEntry, index) =>
                        reportEntry && (
                          <View key={`pair-${pairIndex}-image-${index}`} style={styles.imageWrapper}>
                            <Image src={reportEntry.imageSrc} style={styles.image} />
                            <View style={pdfContentTailwind("flex-row gap-2 mt-2 justify-start")}>
                              <Text style={quantificationOfLogsContentTemplateFontStyles.bodyTextBold}>
                                GPS Position:
                              </Text>
                              <Text style={quantificationOfLogsContentTemplateFontStyles.bodyText}>
                                {`${(reportEntry.coordinates.latitude as number).toFixed(7)}, ${(reportEntry.coordinates.longitude as number).toFixed(7)}`}
                              </Text>
                            </View>
                          </View>
                        )
                    )
                  }
                </View>
              ))
            }
          </View>
        )
      }
    </PDFDocumentTemplateWrapper>
  );
};

export default QuantificationOfLogsContentTemplate;