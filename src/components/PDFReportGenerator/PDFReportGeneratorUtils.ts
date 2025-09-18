import React from "react";
import Leaflet from "leaflet";
import colors from "tailwindcss/colors";
import * as htmlToImage from "html-to-image";
import {
  AUTOMATIC_VINES_DETECTION,
  COW_LAMENESS_DETECTION,
  CROP_GROWTH,
  HEALTH_STATUS_OF_VEGETATION,
  LIVESTOCK,
  QUANTIFICATION_OF_LOGS,
  SOIL_ZONIFICATION
} from "@/lib/constants";
import AutomaticVinesDetectionContentTemplate
  from "@/components/PDFReportGenerator/AutomaticVinesDetectionContentTemplate";
import HealthStatusOfVegetationContentTemplate
  from "@/components/PDFReportGenerator/HealthStatusOfVegetationContentTemplate";
import CowLamenessContentTemplate from "@/components/PDFReportGenerator/CowLamenessContentTemplate";
import LivestockManagementContentTemplate from "@/components/PDFReportGenerator/LivestockManagementContentTemplate";
import QuantificationOfLogsContentTemplate from "@/components/PDFReportGenerator/QuantificationOfLogsContentTemplate";
import CropGrowthContentTemplate from "@/components/PDFReportGenerator/CropGrowthContentTemplate";

export const PDF_REPORT_TEMPLATE_MAPPING = {
  [COW_LAMENESS_DETECTION]: CowLamenessContentTemplate,
  [AUTOMATIC_VINES_DETECTION]: AutomaticVinesDetectionContentTemplate,
  [CROP_GROWTH]: CropGrowthContentTemplate,
  [HEALTH_STATUS_OF_VEGETATION]: HealthStatusOfVegetationContentTemplate,
  [LIVESTOCK]: LivestockManagementContentTemplate,
  [SOIL_ZONIFICATION]: null,
  [QUANTIFICATION_OF_LOGS]: QuantificationOfLogsContentTemplate
};

export const formatCoordinates = (lat: number, lng: number): string => {
  const latHemisphere = lat >= 0 ? "N" : "S";
  const lngHemisphere = lng >= 0 ? "E" : "W";

  const formattedLat = `${Math.abs(lat).toFixed(4)}° ${latHemisphere}`;
  const formattedLng = `${Math.abs(lng).toFixed(4)}° ${lngHemisphere}`;

  return `${formattedLat}, ${formattedLng}`;
};

const waitForAllTilesToLoad = (layerRefs: any, layersToEnable: string[]): Promise<void> => {
// const waitForAllTilesToLoad = (layerRefs: Record<string, L.TileLayer | L.GeoJSON>, layersToEnable: string[]): Promise<void> => {
  return new Promise((resolve) => {
    if (!layersToEnable.length || !Object.keys(layerRefs).length) {
      resolve();
      return;
    }

    let loadedLayers = 0;
    const totalLayers = layersToEnable.length;
    const loadedLayerNames = new Set<string>();

    const timeoutId = setTimeout(() => {
      console.log("⚠️ Timed out waiting for layers to load. Proceeding...");
      resolve();
    }, 20000);

    // Create event listener for custom events
    const customLayerLoadHandler = (event: CustomEvent) => {
      const layerName = event.detail.layerName;

      // Skip if we already counted this layer or it's not in our list
      if (!layersToEnable.includes(layerName) || loadedLayerNames.has(layerName)) {
        return;
      }

      console.log(`Caught custom event "tileLayerReady" for layer "${layerName}"!`);
      loadedLayerNames.add(layerName);
      loadedLayers++;

      if (loadedLayers === totalLayers) {
        // Clean up and resolve
        document.removeEventListener("tileLayerReady", customLayerLoadHandler as EventListener);
        clearTimeout(timeoutId);
        resolve();
      }
    };

    // Listen for our custom event
    document.addEventListener("tileLayerReady", customLayerLoadHandler as EventListener);
  });
};

export type SnapshotOptionsType = {
  width: number;
  height: number;
}

export const snapImageFromMap = async (
  map: Leaflet.Map,
  layerRefs: any,
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>,
  layersToEnable: string[],
  mapContainerRef: React.RefObject<HTMLDivElement>
): Promise<string | null> => {
  try {
    // Return a promise that will resolve with our snapshot
    return new Promise<string | null>((resolve) => {

      // Function to capture the current state
      const captureCurrentState = () => {
        // Ensure the map is fully rendered using invalidateSize
        map.invalidateSize();

        if (!mapContainerRef?.current) {
          resolve(null);
        }

        // Call htmlToImage toPng function to take screenshot
        htmlToImage.toJpeg(mapContainerRef.current!, {
          width: mapContainerRef?.current?.clientWidth,
          height: mapContainerRef?.current?.clientHeight,
          quality: 0.80,
          cacheBust: true,
          filter: (node) => {
            // Skip any image elements that have errors
            if (node.nodeName === "IMG") {
              const imgElement = node as HTMLImageElement;
              if (!imgElement.complete || imgElement.naturalHeight === 0) {
                return false;
              }
            }
            // Skip elements with the ignore attribute
            return !(node.hasAttribute && node.hasAttribute("data-html-to-image-ignore"));
          },
          backgroundColor: "#B497C5"
        })
          .then(dataUrl => {
            resolve(dataUrl);
          })
          .catch(err => {
            console.error("Error in html-to-image:", err);
            resolve(null);
          });
      };

      waitForAllTilesToLoad(layerRefs, layersToEnable).then(() => {
        console.log("✅ All tile layers are ready! Taking snapshot...");
        captureCurrentState();
      });
    });
  } catch (err) {
    console.error("Unexpected error in snapImageFromMap:", err);
    return null;
  }
};

export const blockUserInteractionDuringPDFGeneration = async (callback: () => Promise<void>) => {
  // Create an overlay that sits outside the map container
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  overlay.style.zIndex = "9999";
  overlay.style.cursor = "wait";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  // Add a message to the overlay
  const message = document.createElement("div");
  message.style.backgroundColor = colors.purple[700];
  message.style.color = colors.orange[100];
  message.style.padding = "20px";
  message.style.borderRadius = "5px";
  message.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  message.textContent = "Generating PDF Report...";
  message.style.fontWeight = "bold";
  overlay.appendChild(message);

  // Add data attribute to ensure it's not captured in the snapshot
  overlay.setAttribute("data-html-to-image-ignore", "true");
  message.setAttribute("data-html-to-image-ignore", "true");

  // Append to document body (outside the map container)
  document.body.appendChild(overlay);

  try {
    // Execute the callback function
    await callback();
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  } finally {
    // Remove the overlay when done
    document.body.removeChild(overlay);
  }
};
