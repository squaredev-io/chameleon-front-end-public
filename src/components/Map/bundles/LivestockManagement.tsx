"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FeatureGroup, Polyline } from "react-leaflet";
import Image from "next/image";
import { MapPin } from "lucide-react";
import colors from "tailwindcss/colors";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import { LatLng, latLngBounds } from "leaflet";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { BUNDLES_TYPES, CustomMarkerType, LIVESTOCK } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import useMapContext from "@/components/Map/useMapContext";
import useLeafletWindow from "@/components/Map/useLeafletWindow";
import useUI from "@/lib/hooks/useUI";
import ImageNotLoaded from "../../../../public/image_not_loaded.png";
import { processImageWithRetry } from "@/lib/helper/helperFunctions";
import DatasetModal, { DEFAULT_DATASET, PILOT_DATASET } from "@/components/DatasetModal/DatasetModal";
import useLivestockPolling from "@/lib/hooks/useLivestockPolling";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import useBundles from "@/lib/hooks/useBundles";
import { Config } from "../../../config";

// Dynamically load the cluster and custom marker components to avoid SSR issues
const LeafletCluster = dynamic(
  () => import("../LeafletCluster").then(mod => mod.LeafletCluster()),
  { loading: LoadingBalloon, ssr: false }
);
const CustomMarker = dynamic(
  () => import("../CustomMarker"),
  { loading: LoadingBalloon, ssr: false }
);
const PDFReportGenerator = dynamic(
  () => import("../../PDFReportGenerator/PDFReportGenerator"),
  { loading: LoadingBalloon, ssr: false }
);

const pickImageSrc = (selectedDataset, selectedEntry) => (
  selectedDataset === DEFAULT_DATASET
    ? `${Config.apiURL}/v1/image?frame=${selectedEntry.frame_number}`
    : selectedEntry.image_url
);

const orderByTimestampDescending = (geoJsonFeatures: any) => (
  [...geoJsonFeatures].sort((a, b) => {
    // Access the timestamp inside properties
    const timestampA = a.properties.timestamp.split(":").map(Number);
    const timestampB = b.properties.timestamp.split(":").map(Number);

    // Compare hours
    if (timestampB[0] !== timestampA[0]) {
      return timestampB[0] - timestampA[0];
    }

    // If hours are equal, compare minutes
    if (timestampB[1] !== timestampA[1]) {
      return timestampB[1] - timestampA[1];
    }

    // If minutes are equal, compare seconds
    return timestampB[2] - timestampA[2];
  })
);

type LivestockInformationPopupContentProps = {
  activeMarker: CustomMarkerType;
  bundleResponse: { features: any[] };
  setActiveMarker?: (marker: any) => void;
  firstMarkerIndex?: number;
  lastMarkerIndex?: number;
};

// Popup component for displaying livestock information
// Updated LivestockInformationPopupContent component with fixed image loading state
export const LivestockInformationPopupContent = (
  {
    activeMarker,
    bundleResponse,
    setActiveMarker,
    firstMarkerIndex,
    lastMarkerIndex
  }: LivestockInformationPopupContentProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<any>(null);
  const { selectedDataset } = useUI();

  useEffect(() => {
    if (selectedDataset && bundleResponse && activeMarker) {
      const active = bundleResponse?.features[activeMarker.index].properties;
      setImageSrc(pickImageSrc(selectedDataset, active));
      setSelectedEntry(active);
    }
  }, [activeMarker]);

  const handleClose = () => setOpen(false);
  const handleClickOpen = () => setOpen(true);
  const handleLoadingComplete = () => setIsLoading(false);

  // Reset loading state when activeMarker changes
  useEffect(() => {
    setIsLoading(true);
  }, [activeMarker]);

  return selectedEntry && imageSrc ? (
    <div key={selectedEntry.timestamp} className="max-w-lg h-auto relative p-2 flex flex-col items-center">
      <>
        <div
          onClick={handleClickOpen}
          className="cursor-pointer relative w-full h-full flex justify-center items-center"
        >
          {isLoading && (
            <CircularProgress
              className="absolute"
              tabIndex={-1}
              role="status"
              aria-label="Loading"
            />
          )}
          <Image
            src={imageSrc}
            alt={`Frame ${selectedEntry?.frame_number}`}
            width={650}
            height={450}
            className="justify-center"
            onLoadingComplete={handleLoadingComplete}
          />
        </div>
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth disableEnforceFocus>
          <div className="relative w-full h-full flex justify-center items-center">
            {isLoading && (
              <CircularProgress
                className="absolute"
                tabIndex={-1}
                role="status"
                aria-label="Loading"
              />
            )}
            <Image
              src={imageSrc}
              alt={`Frame ${selectedEntry.frame_number}`}
              width={650}
              height={450}
              className="justify-center"
              layout="responsive"
              objectFit="contain"
              onLoadingComplete={handleLoadingComplete}
            />
          </div>
        </Dialog>
      </>
      <div className="flex flex-col mt-4 w-full">
        <div className="mb-2">
          <strong>Deviation from Herd:</strong>
          {selectedEntry.deviation_from_herd ? " Yes" : " No"}
        </div>
        <div className="mb-4">
          <strong>Message:</strong>
          {selectedEntry.message || " No message available"}
        </div>
        <div className="mb-4">
          <strong>Number of animals:</strong>
          {` ${selectedEntry.counter}`}
        </div>
        <div className="mb-4">
          <strong>Frame no:</strong>
          {` ${selectedEntry.frame_number}`}
        </div>
        <div className="mb-4">
          <strong>Timestamp:</strong>
          {` ${selectedEntry.timestamp}`}
        </div>
        {
          setActiveMarker && (
            <div className="absolute bottom-4 right-4">
              <div className="flex justify-between space-x-2">
                <button
                  className={`px-4 py-2 rounded text-chamBeige-100 ${activeMarker.index === firstMarkerIndex || isLoading ? "bg-disabled opacity-95 cursor-not-allowed" : "bg-chamPurple hover:bg-chamPurple-700"}`}
                  onClick={() => setActiveMarker && setActiveMarker("previous")}
                  disabled={activeMarker.index === firstMarkerIndex || isLoading}
                >
                  {"<"}
                </button>
                <button
                  className={`px-4 py-2 rounded text-chamBeige-100 ${activeMarker.index === lastMarkerIndex || isLoading ? "bg-disabled opacity-95 cursor-not-allowed" : "bg-chamPurple hover:bg-chamPurple-700"}`}
                  onClick={() => setActiveMarker && setActiveMarker("next")}
                  disabled={activeMarker.index === lastMarkerIndex || isLoading}
                >
                  {">"}
                </button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  ) : null;
};

type LivestockInformationModalProps = {
  bundleResponse: { features: any[] };
  clusterMarkers: CustomMarkerType[];
  isLivestockManagementInformationModalOpen: boolean;
  setIsLivestockManagementInformationModalOpen: (isOpen: boolean) => void;
};

const LivestockInformationModal = (
  {
    bundleResponse,
    clusterMarkers,
    isLivestockManagementInformationModalOpen,
    setIsLivestockManagementInformationModalOpen
  }: LivestockInformationModalProps) => {
  const [activeMarker, setActiveMarker] = useState<CustomMarkerType | null>(null);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(0);

  useEffect(() => {
    if (clusterMarkers) {
      setActiveMarker(clusterMarkers[0]);
      setActiveMarkerIndex(0);
    }
  }, [clusterMarkers]);

  const handleSetActiveMarker = (action: string) => {
    if (action === "next") {
      setActiveMarker(clusterMarkers[activeMarkerIndex + 1]);
      setActiveMarkerIndex(activeMarkerIndex + 1);
    } else if (action === "previous") {
      setActiveMarker(clusterMarkers[activeMarkerIndex - 1]);
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  };

  return bundleResponse && activeMarker ? (
    <Dialog
      open={isLivestockManagementInformationModalOpen}
      onClose={() => setIsLivestockManagementInformationModalOpen(false)}
      maxWidth="lg"
    >
      <DialogTitle>Livestock Management Information</DialogTitle>
      <DialogContent>
        <LivestockInformationPopupContent
          activeMarker={activeMarker}
          bundleResponse={bundleResponse}
          setActiveMarker={handleSetActiveMarker}
          firstMarkerIndex={clusterMarkers[0].index}
          lastMarkerIndex={clusterMarkers[clusterMarkers.length - 1].index}
        />
      </DialogContent>
    </Dialog>
  ) : null;
};

type LivestockManagementClusteredMarkersProps = {
  bundleResponse: { features: any[] };
  setClusterMarkers: (markers: CustomMarkerType[]) => void;
  livestockMarkerCoordinates: LatLng[];
  setIsLivestockManagementInformationModalOpen: (isOpen: boolean) => void;
};

// Component for rendering clustered livestock markers and their popups
const LivestockManagementClusteredMarkers = (
  {
    bundleResponse,
    setClusterMarkers,
    livestockMarkerCoordinates,
    setIsLivestockManagementInformationModalOpen
  }: LivestockManagementClusteredMarkersProps) => (
  <LeafletCluster
    icon={MapPin}
    chunkedLoading
    color={colors.purple[700]}
    extraProps={{
      setClusterMarkers,
      livestockMarkerCoordinates,
      setIsLivestockManagementInformationModalOpen
    }}
  >
    {
      livestockMarkerCoordinates.map((marker, index) => (
        <CustomMarker
          icon={MapPin}
          position={marker}
          color={colors.purple[700]}
          key={crypto.randomUUID()}
          popupContent={
            <LivestockInformationPopupContent
              activeMarker={{ position: marker, index }}
              bundleResponse={bundleResponse}
            />
          }
        />
      ))
    }
  </LeafletCluster>
);

export type LivestockManagementReportProps = {
  imageSrc: string;
  frameNumber: number;
  coordinates: string[];
  appearance: string;
  detectedAnimals: number;
  message: string;
};

export type LivestockManagementReportPreparedProps = {
  reportData: LivestockManagementReportProps[]
};

// Main component for Livestock Management bundle
const LivestockManagement = ({ mapContainerRef }) => {
  const { map } = useMapContext();
  const leafletWindow = useLeafletWindow();
  const prevBoundsRef = useRef<string | null>(null);
  const { selectedDataset, activeBundle } = useUI();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);
  const [bundleResponse, setBundleResponse] = useState<any>(null);
  const [clusterMarkers, setClusterMarkers] = useState<CustomMarkerType[] | null>(null);
  const [preparedData, setPreparedData] = useState<LivestockManagementReportPreparedProps | null>(null);
  const [isLivestockManagementInformationModalOpen, setIsLivestockManagementInformationModalOpen] = useState<any>(null);
  const [livestockMarkerCoordinates, setLivestockMarkerCoordinates] = useState<any>(null);
  const [polylinePositions, setPolylinePositions] = useState<any>(null);

  const { data: bundles } = useGetUserBundlesQuery();

  const originalBundleResponse: any = useBundles(
    bundles,
    activeBundle,
    BUNDLES_TYPES.GEOJSON
  );

  const {
    data: livestockData,
    startPolling,
    stopPolling
  } = useLivestockPolling({ pollingInterval: 10000 });

  useEffect(() => {
    if (selectedDataset === PILOT_DATASET) {
      startPolling();
    } else {
      stopPolling();
      setBundleResponse(originalBundleResponse);
    }
  }, [selectedDataset]);

  // Update local state when data changes
  useEffect(() => {
    if (livestockData) {
      setBundleResponse({ features: orderByTimestampDescending(livestockData.features) });
    }
  }, [livestockData]);

  useEffect(() => {
    if (bundleResponse) {
      // Extract coordinates for markers from the bundle response
      const markersCoordinates = bundleResponse?.features.map((feature: any) => (
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      ));
      setLivestockMarkerCoordinates(markersCoordinates);
      setPolylinePositions(markersCoordinates?.map((coord: Array<number>) => [coord[1], coord[0]]));
    }
  }, [bundleResponse]);

  // ToDo: create a new hook like the usePrepareMap but without the need for a tileInfo param
  //  (for the marker cases - e.g. animals bundles cases)
  // Calculate bounds for all markers
  const allMarkerBounds = useMemo(() => {
    if (!leafletWindow || !livestockMarkerCoordinates) {
      return undefined;
    }

    return latLngBounds(livestockMarkerCoordinates);
  }, [leafletWindow, livestockMarkerCoordinates]);

  // Fly to the calculated bounds when markers are updated
  useEffect(() => {
    if (!allMarkerBounds || !leafletWindow || !map) {
      return;
    }

    const newBoundsStr = allMarkerBounds.toBBoxString();
    if (newBoundsStr === prevBoundsRef.current) {
      return;
    }

    prevBoundsRef.current = newBoundsStr;

    map.flyTo(
      [allMarkerBounds.getCenter().lat, allMarkerBounds.getCenter().lng],
      map.getBoundsZoom(allMarkerBounds),
      { duration: 3 }
    );
  }, [allMarkerBounds?.toBBoxString()]);

  // Monitor image load errors
  useEffect(() => {
    if (imageLoadErrors.length) {
      console.warn("Failed to load images for frames: ", imageLoadErrors);
    }
  }, [imageLoadErrors]);

  const handleLivestockDataPreparation = async ({ data }) => {
    if (!data) {
      return null;
    }

    try {
      const firstFrame = {
        coordinates: bundleResponse.features[0].geometry.coordinates,
        ...bundleResponse.features[0].properties
      };
      const lastFrame = {
        coordinates: bundleResponse.features[bundleResponse.features.length - 1].geometry.coordinates,
        ...bundleResponse.features[bundleResponse.features.length - 1].properties
      };
      const messageFrames = bundleResponse.features.reduce((acc, cur) => {
        if (cur.properties.message) {
          acc.push({
            coordinates: cur.geometry.coordinates,
            ...cur.properties
          });
        }
        return acc;
      }, []);

      let importantFrames;
      if (!messageFrames) {
        const halfPosition = Math.floor(bundleResponse.features.length / 2);

        importantFrames = [{
          coordinates: bundleResponse.features[halfPosition].geometry.coordinates,
          ...bundleResponse.features[halfPosition].properties
        }];
      } else {
        importantFrames = messageFrames;
      }

      let curatedData: any[] = [];

      if (bundleResponse.features.length <= 35) {
        curatedData = bundleResponse.features.map(entry => ({
            coordinates: entry.geometry.coordinates,
            ...entry.properties
          })
        );
      } else {
        curatedData = [firstFrame, ...importantFrames, lastFrame];
      }

      // Process images with retry mechanism
      const reportData = await Promise.all(
        curatedData.map(async (entry) => {
          try {
            const processedImage = selectedDataset === DEFAULT_DATASET
              ? await processImageWithRetry(`${Config.apiURL}/v1/image?frame=${entry.frame_number}&format=webp`)
              : await processImageWithRetry(entry.image_url);

            return {
              imageSrc: processedImage.base64,
              frameNumber: entry.frame_number,
              coordinates: entry.coordinates,
              appearance: entry.appearance,
              detectedAnimals: entry.counter,
              message: entry.message
            };
          } catch (error) {
            console.error(`Failed to process image for frame ${entry.frame_number}:`, error);
            setImageLoadErrors(prev => [...prev, `Frame ${entry.frame_number}`]);
            return {
              imageSrc: ImageNotLoaded.src,
              frameNumber: entry.frame_number,
              coordinates: entry.coordinates,
              appearance: entry.appearance,
              detectedAnimals: entry.counter,
              message: entry.message + " (Image processing failed)"
            };
          }
        })
      );

      return { reportData };
    } catch (error) {
      console.error("Error in handleLivestockDataPreparation:", error);
      throw error;
    }
  };

  if (!selectedDataset) {
    return <DatasetModal />;
  }

  return polylinePositions?.length ? (
    <FeatureGroup>
      {
        isGeneratingReport && preparedData ? (
          <>
            {
              preparedData.reportData.map(marker => (
                <CustomMarker
                  icon={MapPin}
                  position={[Number(marker.coordinates[1]), Number(marker.coordinates[0])]}
                  color={colors.purple[700]}
                  key={`report-marker-${marker.frameNumber}-${crypto.randomUUID()}`}
                />
              ))
            }
            <Polyline
              positions={
                preparedData.reportData.map(marker => (
                  [Number(marker.coordinates[1]), Number(marker.coordinates[0])]
                ))
              }
              color={colors.blue[400]}
            />
          </>
        ) : (
          <>
            <LivestockManagementClusteredMarkers
              bundleResponse={bundleResponse}
              setClusterMarkers={setClusterMarkers}
              livestockMarkerCoordinates={livestockMarkerCoordinates}
              setIsLivestockManagementInformationModalOpen={setIsLivestockManagementInformationModalOpen}
            />
            <Polyline positions={polylinePositions} color={colors.blue[400]} />
          </>
        )
      }
      {
        clusterMarkers && clusterMarkers.length && (
          <LivestockInformationModal
            bundleResponse={bundleResponse}
            clusterMarkers={clusterMarkers}
            isLivestockManagementInformationModalOpen={isLivestockManagementInformationModalOpen}
            setIsLivestockManagementInformationModalOpen={setIsLivestockManagementInformationModalOpen}
          />
        )
      }
      {
        bundleResponse && (
          <PDFReportGenerator
            handleDataPreparation={async (data) => {
              setIsGeneratingReport(true);
              const prepared = await handleLivestockDataPreparation(data);
              setPreparedData(prepared);
              await new Promise(resolve => setTimeout(resolve, 500));
              return prepared;
            }}
            setIsGeneratingReport={setIsGeneratingReport}
            bundleName={LIVESTOCK}
            mapContainerRef={mapContainerRef}
            bundleProps={{ data: bundleResponse.features }}
          />
        )
      }
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(LIVESTOCK)(LivestockManagement);
