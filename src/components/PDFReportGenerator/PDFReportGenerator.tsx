"use client";

import React from "react";
import Image from "next/image";
import { pdf } from "@react-pdf/renderer";
import {
  blockUserInteractionDuringPDFGeneration,
  formatCoordinates,
  PDF_REPORT_TEMPLATE_MAPPING,
  snapImageFromMap
} from "./PDFReportGeneratorUtils";
import CowLamenessDetectionStyle from "@/components/Map/bundles/CowLamenessDetection.module.css";
import { BUNDLES_PDF_REPORT_FILENAME } from "@/lib/constants";
import ReportIcon from "/public/icons/report-light.png";
import useMapContext from "@/components/Map/useMapContext";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";

type PDFReportGeneratorProps = {
  handleDataPreparation?: any;
  setIsGeneratingReport?: any;
  bundleName: string;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  bundleProps: any;
  layersToEnable?: Array<Array<string>>;
  layerRefs?: any;
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>;
};

const PDFReportGenerator = (
  {
    handleDataPreparation,
    setIsGeneratingReport,
    bundleName,
    mapContainerRef,
    bundleProps,
    layersToEnable = [[]],
    layerRefs = {}
  }: PDFReportGeneratorProps) => {
  let preparedData;

  const { map } = useMapContext();
  const { resetAllLayersAndWait, toggleLayerAndWait } = useLayerRegistry();

  const handleGeneratePDF = async () => {
    await blockUserInteractionDuringPDFGeneration(async () => {
      const mapImageSrc: Array<string | null> = [];

      if (!map) {
        console.error("No map available!");
        return;
      }

      const bounds = map.getBounds();
      if (!bounds) {
        console.error("No map bounds available!");
        return;
      }

      if (handleDataPreparation) {
        preparedData = await handleDataPreparation(bundleProps);
      } else {
        preparedData = bundleProps;
      }

      if (!preparedData) {
        console.error("No data available to generate report.");
        return;
      }

      const coordinates = {
        upperLeft: formatCoordinates(bounds.getNorthWest().lat, bounds.getNorthWest().lng),
        lowerRight: formatCoordinates(bounds.getSouthEast().lat, bounds.getSouthEast().lng)
      };

      try {
        try {
          if (layersToEnable && layersToEnable.length) {
            for (const setOfLayers of layersToEnable) {
              await resetAllLayersAndWait();

              for (const layer of setOfLayers) {
                await toggleLayerAndWait(layer);
              }

              mapImageSrc.push(await snapImageFromMap(map, layerRefs, setOfLayers, mapContainerRef));
            }
          }
        } catch (error) {
          console.error("Error generating images from layers - ", error);
        }

        const TemplateComponent = PDF_REPORT_TEMPLATE_MAPPING[bundleName];

        if (!TemplateComponent) {
          console.error(`No PDF report template found for bundle name: ${bundleName}`);
          return;
        }

        const componentProps = {
          bundleName,
          coordinates,
          mapImageSrc,
          ...preparedData
        };

        const pdfDocument = <TemplateComponent {...componentProps} />;

        // Create a PDF Blob
        const blob = await pdf(pdfDocument).toBlob();

        // Create a hidden download link and trigger the report download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = BUNDLES_PDF_REPORT_FILENAME[bundleName];
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (setIsGeneratingReport) {
          setIsGeneratingReport(false);
        }
      } catch (error) {
        console.error("Error generating PDF - ", error);
      }
    });
  };

  return (
    <div className="fixed top-1/2 right-5 transform -translate-y-1/2 z-[9999]">
      <button
        onClick={handleGeneratePDF}
        className={CowLamenessDetectionStyle.reportIcon}
        title="Generate Bundle Report"
      >
        <Image
          src={ReportIcon.src}
          alt="Generate Bundle Report"
          width={50}
          height={50}
          style={{ objectFit: "contain" }}
        />
      </button>
    </div>
  );
};

export default PDFReportGenerator;
