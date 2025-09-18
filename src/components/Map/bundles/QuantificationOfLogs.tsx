"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { BUNDLES_TYPES, CustomMarkerType, QUANTIFICATION_OF_LOGS } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import useMapContext from "@/components/Map/useMapContext";
import useLeafletWindow from "@/components/Map/useLeafletWindow";
import useUI from "@/lib/hooks/useUI";
import useBundles from "@/lib/hooks/useBundles";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import { processImageWithRetry } from "@/lib/helper/helperFunctions";
import ImageNotLoaded from "../../../../public/image_not_loaded.png";
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

type QuantificationOfLogsInformationPopupContentProps = {
  activeMarker: CustomMarkerType;
  bundleResponse: { features: any[] };
  blurDataUrls: { [key: number]: string };
  setActiveMarker?: (marker: any) => void;
  firstMarkerIndex?: number;
  lastMarkerIndex?: number;
};

// Popup component for displaying Quantification Of Logs information
export const QuantificationOfLogsInformationPopupContent = (
  {
    activeMarker,
    bundleResponse,
    blurDataUrls,
    setActiveMarker,
    firstMarkerIndex,
    lastMarkerIndex
  }: QuantificationOfLogsInformationPopupContentProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => setOpen(false);
  const handleClickOpen = () => setOpen(true);
  const handleImageLoad = () => setIsLoading(false);
  const handleLoadingComplete = () => setIsLoading(false);

  return Object.keys(blurDataUrls).length ? (
    <div className="max-w-xl h-auto relative p-2 flex flex-col items-center">
      <>
        <div onClick={handleClickOpen} className="cursor-pointer">
          <Image
            src={`${Config.apiURL}/v1/image/${QUANTIFICATION_OF_LOGS}/${bundleResponse?.features[activeMarker.index].properties.image_name}`}
            alt={`Image ${bundleResponse?.features[activeMarker.index].properties.image_name}`}
            width={650}
            height={450}
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
              src={`${Config.apiURL}/v1/image/${QUANTIFICATION_OF_LOGS}/${bundleResponse?.features[activeMarker.index].properties.image_name}`}
              alt={`Image ${bundleResponse?.features[activeMarker.index].properties.image_name}`}
              width={650}
              height={450}
              className="justify-center"
              layout="responsive"
              objectFit="contain"
              onLoad={handleImageLoad}
              onLoadingComplete={handleLoadingComplete}
            />
          </div>
        </Dialog>
      </>
      <div className="flex flex-col mt-4 w-full">
        <div className="mb-2">
          <strong>Log Length:</strong>
          {bundleResponse?.features[activeMarker.index].properties.length}
        </div>
        {
          setActiveMarker && (
            <div className="absolute bottom-4 right-4">
              <div className="flex justify-between space-x-2">
                <button
                  className={`px-4 py-2 rounded text-chamBeige-100 ${activeMarker.index === firstMarkerIndex ? "bg-disabled opacity-95 cursor-not-allowed" : "bg-chamPurple hover:bg-chamPurple-700"}`}
                  onClick={() => setActiveMarker && setActiveMarker("previous")}
                  disabled={activeMarker.index === firstMarkerIndex}
                >
                  {"<"}
                </button>
                <button
                  className={`px-4 py-2 rounded text-chamBeige-100 ${activeMarker.index === lastMarkerIndex ? "bg-disabled opacity-95 cursor-not-allowed" : "bg-chamPurple hover:bg-chamPurple-700"}`}
                  onClick={() => setActiveMarker && setActiveMarker("next")}
                  disabled={activeMarker.index === lastMarkerIndex}
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

type QuantificationOfLogsInformationModalProps = {
  blurDataUrls: { [key: number]: string };
  bundleResponse: { features: any[] };
  clusterMarkers: CustomMarkerType[];
  isQuantificationOfLogsInformationModalOpen: boolean;
  setIsQuantificationOfLogsInformationModalOpen: (isOpen: boolean) => void;
};

const QuantificationOfLogsInformationModal = (
  {
    blurDataUrls,
    bundleResponse,
    clusterMarkers,
    isQuantificationOfLogsInformationModalOpen,
    setIsQuantificationOfLogsInformationModalOpen
  }: QuantificationOfLogsInformationModalProps) => {
  const [activeMarker, setActiveMarker] = useState<CustomMarkerType | null>(null);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(0);

  useEffect(() => {
    setActiveMarker(clusterMarkers[activeMarkerIndex]);
  }, []);

  const handleSetActiveMarker = (action: string) => {
    if (action === "next") {
      setActiveMarker(clusterMarkers[activeMarkerIndex + 1]);
      setActiveMarkerIndex(activeMarkerIndex + 1);
    } else if (action === "previous") {
      setActiveMarker(clusterMarkers[activeMarkerIndex - 1]);
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  };

  return activeMarker ? (
    <Dialog
      open={isQuantificationOfLogsInformationModalOpen}
      onClose={() => setIsQuantificationOfLogsInformationModalOpen(false)}
    >
      <DialogTitle>Quantification of Logs Information</DialogTitle>
      <DialogContent>
        <QuantificationOfLogsInformationPopupContent
          activeMarker={activeMarker}
          blurDataUrls={blurDataUrls}
          bundleResponse={bundleResponse}
          setActiveMarker={handleSetActiveMarker}
          firstMarkerIndex={clusterMarkers[0].index}
          lastMarkerIndex={clusterMarkers[clusterMarkers.length - 1].index}
        />
      </DialogContent>
    </Dialog>
  ) : null;
};

type QuantificationOfLogsClusteredMarkersProps = {
  blurDataUrls: { [key: number]: string };
  bundleResponse: { features: any[] };
  setClusterMarkers: (markers: CustomMarkerType[]) => void;
  quantificationOfLogsMarkerCoordinates: LatLng[];
  setIsQuantificationOfLogsInformationModalOpen: (isOpen: boolean) => void;
};

// Component for rendering clustered Quantification Of Logs markers and their popups
const QuantificationOfLogsClusteredMarkers = (
  {
    blurDataUrls,
    bundleResponse,
    setClusterMarkers,
    quantificationOfLogsMarkerCoordinates,
    setIsQuantificationOfLogsInformationModalOpen
  }: QuantificationOfLogsClusteredMarkersProps) => (
  <LeafletCluster
    icon={MapPin}
    chunkedLoading
    color={colors.purple[700]}
    extraProps={{
      setClusterMarkers,
      quantificationOfLogsMarkerCoordinates,
      setIsQuantificationOfLogsInformationModalOpen
    }}
  >
    {
      quantificationOfLogsMarkerCoordinates.map((marker, index) => (
        <CustomMarker
          icon={MapPin}
          position={marker}
          color={colors.purple[700]}
          key={`marker-${bundleResponse?.features[index].properties.image_name}`}
          popupContent={
            <QuantificationOfLogsInformationPopupContent
              activeMarker={{ position: marker, index }}
              bundleResponse={bundleResponse}
              blurDataUrls={blurDataUrls}
            />
          }
        />
      ))
    }
  </LeafletCluster>
);

export type QuantificationOfLogsReportProps = {
  imageSrc: string;
  imageName: string;
  coordinates: any;
};

export type QuantificationOfLogsReportPreparedProps = {
  stats: {
    imagesTotal: number,
    imagesDetected: number,
    logCount: number,
    lengthMin: number,
    lengthMax: number,
    lengthAverage: number
    arguments: string,
    gsd: number,
    conf: number,
    outputCrs: string,
    topFrac: number
  }
  images: QuantificationOfLogsReportProps[]
};

// Main component for the Open Calls Quantification Of Logs bundle
const QuantificationOfLogs = ({ mapContainerRef }) => {
  const { map } = useMapContext();
  const leafletWindow = useLeafletWindow();
  const { bundleResponse, activeBundle, viewportInfo } = useUI();
  const [blurDataUrls, setBlurDataUrls] = useState({});
  const [filteredBundleResponse, setFilteredBundleResponse] = useState<any>(null);
  const [quantificationOfLogsMarkerCoordinates, setQuantificationOfLogsMarkerCoordinates] = useState<any>(null);
  const [polylinePositions, setPolylinePositions] = useState<any>(null);
  const [clusterMarkers, setClusterMarkers] = useState<CustomMarkerType[] | null>(null);
  const [isQuantificationOfLogsInformationModalOpen, setIsQuantificationOfLogsInformationModalOpen] = useState<any>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);

  const { data: bundles } = useGetUserBundlesQuery();

  const bundleStatsApiResponse = useBundles(bundles, activeBundle, BUNDLES_TYPES.JSON);

  useEffect(() => {
    if (bundleResponse) {
      const urls = {};
      let index = 0;
      const usedIndexes = new Set();
      const filteredFeatures = [] as any;

      for (const feature of bundleResponse?.features || []) {
        const match = feature.properties.image_name.match(/_(\d+)\.JPG$/);
        if (match) {
          const result = match[1]; // Extracted number from file name (e.g. '001')
          // Only process this feature if it's a unique image (based on the number extracted)
          if (!usedIndexes.has(result)) {
            usedIndexes.add(result); // Mark this image number as used
            filteredFeatures.push({
              ...feature,
              properties: {
                ...feature.properties,
                image_name: feature.properties.image_name.replace(/\.JPG$/, "") // Remove the file extension from the image_name property
              }
            });
            urls[index] = `${Config.apiURL}/v1/image/${QUANTIFICATION_OF_LOGS}/${feature.properties.image_name.replace(/\.JPG$/, "")}`;
            index++;
          }
        }
      }
      setFilteredBundleResponse({ features: filteredFeatures });
      setBlurDataUrls(urls);
    }
  }, [bundleResponse]);

  useEffect(() => {
    if (filteredBundleResponse) {
      const quantificationOfLogsMarkerCoordinates = filteredBundleResponse?.features.map((feature: any) => (
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      ));
      const polylinePositions = quantificationOfLogsMarkerCoordinates?.map((coord: Array<number>) => [coord[1], coord[0]]);
      setQuantificationOfLogsMarkerCoordinates(quantificationOfLogsMarkerCoordinates);
      setPolylinePositions(polylinePositions);
    }
  }, [filteredBundleResponse]);

  // Calculate bounds for all markers
  const allMarkerBounds = useMemo(() => {
    if (!leafletWindow || !quantificationOfLogsMarkerCoordinates) {
      return undefined;
    }

    return latLngBounds(quantificationOfLogsMarkerCoordinates);
  }, [leafletWindow, quantificationOfLogsMarkerCoordinates]);

  // Fly to the calculated bounds when markers are updated
  useEffect(() => {
    if (!allMarkerBounds || !leafletWindow || !map) {
      return;
    }

    if (!map.invalidateSize()) {
      return;
    }

    map.flyTo(
      [allMarkerBounds.getCenter().lat, allMarkerBounds.getCenter().lng],
      map.getBoundsZoom(allMarkerBounds),
      { duration: 3 }
    );
  }, [allMarkerBounds, viewportInfo.viewportWidth, viewportInfo.viewportHeight]);

  // Monitor image load errors
  useEffect(() => {
    if (imageLoadErrors.length) {
      console.warn("Failed to load images: ", imageLoadErrors);
    }
  }, [imageLoadErrors]);

  const handleQuantificationOfLogsDataPreparation = async ({ data }) => {
    if (!data) {
      return null;
    }

    try {
      const images = new Set(data.images.map(entry => entry.properties.image_name));

      const processedImages = await Promise.all(
        [...images].map(async (image) => {
            try {
              const processedImage = await processImageWithRetry(`${Config.apiURL}/v1/image/${QUANTIFICATION_OF_LOGS}/${image}`);
              return {
                imageSrc: processedImage.base64,
                imageName: image,
                coordinates: processedImage.metadata
              };
            } catch (error) {
              console.error(`Failed to process image ${image}:`, error);
              setImageLoadErrors(prev => [...prev, image as string]);
              return {
                imageSrc: ImageNotLoaded.src,
                imageName: image,
                coordinates: "-"
              };
            }
          }
        )
      );

      const reportData = {
        stats: {
          imagesTotal: data.stats?.images_total,
          imagesDetected: data.stats?.images_detected,
          logCount: data.stats?.log_count,
          lengthMin: data.stats?.length_min,
          lengthMax: data.stats?.length_max,
          lengthAverage: data.stats?.length_average,
          arguments: data.stats?.arguments,
          gsd: data.stats?.gsd,
          conf: data.stats?.conf,
          outputCrs: data.stats?.output_crs,
          topFrac: data.stats?.top_frac
        },
        images: processedImages
      } as QuantificationOfLogsReportPreparedProps;

      return { reportData };
    } catch (error) {
      console.error("Error in handleQuantificationOfLogsDataPreparation:", error);
      throw error;
    }
  };

  return polylinePositions?.length ? (
    <FeatureGroup>
      <QuantificationOfLogsClusteredMarkers
        blurDataUrls={blurDataUrls}
        bundleResponse={filteredBundleResponse}
        setClusterMarkers={setClusterMarkers}
        quantificationOfLogsMarkerCoordinates={quantificationOfLogsMarkerCoordinates}
        setIsQuantificationOfLogsInformationModalOpen={setIsQuantificationOfLogsInformationModalOpen}
      />
      <Polyline positions={polylinePositions} color={colors.blue[400]} />
      {
        clusterMarkers && clusterMarkers.length && (
          <QuantificationOfLogsInformationModal
            blurDataUrls={blurDataUrls}
            bundleResponse={filteredBundleResponse}
            clusterMarkers={clusterMarkers}
            isQuantificationOfLogsInformationModalOpen={isQuantificationOfLogsInformationModalOpen}
            setIsQuantificationOfLogsInformationModalOpen={setIsQuantificationOfLogsInformationModalOpen}
          />
        )
      }
      {
        bundleResponse && bundleStatsApiResponse && (
          <PDFReportGenerator
            handleDataPreparation={handleQuantificationOfLogsDataPreparation}
            bundleName={QUANTIFICATION_OF_LOGS}
            mapContainerRef={mapContainerRef}
            bundleProps={{
              data: {
                images: bundleResponse.features,
                stats: bundleStatsApiResponse
              }
            }}
          />
        )
      }
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(QUANTIFICATION_OF_LOGS)(QuantificationOfLogs);
