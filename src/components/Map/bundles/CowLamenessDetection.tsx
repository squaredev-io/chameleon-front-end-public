"use client";

import Image from "next/image";
import useUI from "@/lib/hooks/useUI";
import { FeatureGroup } from "react-leaflet";
import React, { useEffect, useState } from "react";
import { BUNDLES_TYPES, COW_LAMENESS_DETECTION } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useGetUserBundlesQuery, useLazyGetUserBundleGeoTiffQuery } from "@/lib/services/api";
import { LatLngExpression, LatLngLiteral } from "leaflet";
import { MapPin } from "lucide-react";
import colors from "tailwindcss/colors";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import { processImageWithRetry } from "@/lib/helper/helperFunctions";
import ImageNotLoaded from "../../../../public/image_not_loaded.png";
import useMapContext from "@/components/Map/useMapContext";
import { AppConfig } from "@/lib/AppConfig";
import DatasetModal, { DEFAULT_DATASET, PILOT_DATASET } from "@/components/DatasetModal/DatasetModal";
import useBundles from "@/lib/hooks/useBundles";

const CustomMarker = dynamic(
  () => import("../CustomMarker"),
  { loading: LoadingBalloon, ssr: false }
);
const PDFReportGenerator = dynamic(
  () => import("../../PDFReportGenerator/PDFReportGenerator"),
  { loading: LoadingBalloon, ssr: false }
);

// ToDo: Remove this hardcoded location when we have the actual latitude and longitude from the DIP
const RANCH_LOCATION_1 = {
  lat: 40.649194,
  lng: -4.736278
} as LatLngLiteral;

const RANCH_LOCATION_2 = {
  lat: 40.58627514095032,
  lng: -4.845961975577776
} as LatLngLiteral;

const CowLamenessInfoModal = (
  {
    imageSize,
    lameAnimal,
    getUserBundleGeoTiffResponse,
    isLamenessDetectionModalOpen,
    setIsLamenessDetectionModalOpen
  }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => setIsLoading(false);
  const handleLoadingComplete = () => setIsLoading(false);

  return imageSize && lameAnimal ? (
    <Dialog
      open={isLamenessDetectionModalOpen}
      onClose={() => setIsLamenessDetectionModalOpen(false)}
      maxWidth="lg"
    >
      <DialogTitle>Lameness Detection In Cows</DialogTitle>
      <DialogContent>
        <div className="max-w-lg h-auto relative p-2 flex flex-col items-center">
          {
            isLoading && (
              <CircularProgress
                className="absolute"
                tabIndex={-1}
                role="status"
                aria-label="Loading"
              />
            )
          }
          <Image
            src={getUserBundleGeoTiffResponse}
            alt="lameness_detection_in_cows"
            width={imageSize?.width}
            height={imageSize?.height}
            className="justify-center"
            layout="responsive"
            objectFit="contain"
            onLoad={handleImageLoad}
            onLoadingComplete={handleLoadingComplete}
          />
          <div className="flex flex-col mt-4 w-full">
            <div className="mb-2">
              <strong>Cow id: </strong>
              {lameAnimal?.id}
            </div>
            <div className="mb-4">
              <strong>Lameness Probability: </strong>
              {lameAnimal?.probability}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
};

type LamenessDetectionEntry = {
  id: string;
  gait_status: string;
  probability: number;
  frame_number: number;
};

export type CowLamenessReportProps = {
  animalId: string,
  imageSrc: string,
  pieChartData: { name: string; value: number }[];
};

export type CowLamenessReportPreparedProps = {
  overviewValue: string,
  images: CowLamenessReportProps[]
};

// Main component for the Lameness Detection in Cows bundle
const CowLamenessDetection = ({ mapContainerRef }) => {
  const { map } = useMapContext();
  const { activeBundle, selectedDataset } = useUI();
  const [lameAnimals, setLameAnimals] = useState<LamenessDetectionEntry[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [bundleExecutionResult, setBundleExecutionResult] = useState<string>("");
  const [isLamenessDetectionModalOpen, setIsLamenessDetectionModalOpen] = useState<boolean>(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);
  const [selectedDatasetLocation, setSelectedDatasetLocation] = useState<LatLngLiteral | null>(null);

  const { data: bundles } = useGetUserBundlesQuery();

  const bundleResponse: any = useBundles(
    bundles,
    selectedDataset === PILOT_DATASET ? `${activeBundle}_pilot` : activeBundle,
    BUNDLES_TYPES.JSON
  );

  const [getUserBundleGeoTiffTrigger, { data: getUserBundleGeoTiffResponse }] = useLazyGetUserBundleGeoTiffQuery();

  useEffect(() => {
    if (selectedDataset === DEFAULT_DATASET) {
      setSelectedDatasetLocation(RANCH_LOCATION_1);
    } else if (selectedDataset === PILOT_DATASET) {
      setSelectedDatasetLocation(RANCH_LOCATION_2);
    }
  }, [selectedDataset]);

  useEffect(() => {
    if (bundleResponse) {
      if (Array.isArray(bundleResponse) && bundleResponse.length) {
        const lameAnimals = bundleResponse.filter(entry => entry.gait_status === "unhealthy");
        setLameAnimals(lameAnimals);
      } else {
        if (bundleResponse.gait_status === "unhealthy") {
          setLameAnimals([bundleResponse]);
        } else {
          setLameAnimals([]);
        }
      }
    }
  }, [bundleResponse]);

  // Lame animals counting and fetch lame animals images
  useEffect(() => {
    if (selectedDataset) {
      if (!lameAnimals?.length) {
        setBundleExecutionResult("No cows in the observed population exhibit signs of lameness.");
      } else if (lameAnimals?.length) {
        //   ToDo: This should be an array and probably work like the animal herd monitoring modal (carousel) in the UI
        //    but also save all the image urls in an array for the pdf report handler
        getUserBundleGeoTiffTrigger({ file_name: `cow_${lameAnimals[0].id}` });
        setBundleExecutionResult("Detected cows with lameness:");
      } else {
        setBundleExecutionResult(bundleResponse.message || "Invalid metrics for gait analysis");
      }
    }
  }, [lameAnimals, selectedDataset]);

  // Image size set
  useEffect(() => {
    if (getUserBundleGeoTiffResponse) {
      // Load image dimensions
      const img = document.createElement("img");
      img.src = getUserBundleGeoTiffResponse;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, [getUserBundleGeoTiffResponse]);

  useEffect(() => {
    if (map && selectedDatasetLocation) {
      map.flyTo(
        selectedDatasetLocation as LatLngExpression,
        AppConfig.maxZoom,
        { duration: 2 }
      );
    }
  }, [selectedDatasetLocation]);

  // Monitor image load errors
  useEffect(() => {
    if (imageLoadErrors.length) {
      console.warn("Failed to load images: ", imageLoadErrors);
    }
  }, [imageLoadErrors]);

  const handleCowLamenessDataPreparation = async ({ data }) => {
    if (!data) {
      return null;
    }

    try {
      const processedImages = await Promise.all(
        //ToDo: or somehow use data.images here
        lameAnimals.map(async (animal) => {
            try {
              // ToDo: this should be an array of lame animals image urls (fetched somehow from the API)
              const processedImage = await processImageWithRetry(getUserBundleGeoTiffResponse);
              return {
                animalId: `Animal ID: ${animal.id}`,
                imageSrc: processedImage.base64,
                pieChartData: [
                  { name: "Lame", value: animal.probability * 100 },
                  { name: "Healthy", value: 100 - (animal.probability * 100) }
                ]
              };
            } catch (error) {
              console.error(`Failed to process image ${animal.id}:`, error);
              setImageLoadErrors(prev => [...prev, animal.id as string]);
              return {
                animalId: `Animal ID: ${animal.id}`,
                imageSrc: ImageNotLoaded.src,
                pieChartData: [
                  { name: "Lame", value: 0 },
                  { name: "Healthy", value: 0 }
                ]
              };
            }
          }
        )
      );

      const reportData = {
        overviewValue: data.overviewValue,
        images: processedImages
      } as CowLamenessReportPreparedProps;

      return { reportData };
    } catch (error) {
      console.error("Error in handleCowLamenessDataPreparation:", error);
      throw error;
    }
  };

  if (!selectedDataset) {
    return <DatasetModal />;
  }

  return imageSize ? (
    <FeatureGroup>
      <CustomMarker
        icon={MapPin}
        position={selectedDatasetLocation as LatLngExpression}
        color={colors.purple[700]}
        onClick={() => setIsLamenessDetectionModalOpen(true)}
      />
      <CowLamenessInfoModal
        imageSize={imageSize}
        lameAnimal={lameAnimals[0]} // ToDo: this needs to be fixed as well ... see carousel comment above
        getUserBundleGeoTiffResponse={getUserBundleGeoTiffResponse}
        isLamenessDetectionModalOpen={isLamenessDetectionModalOpen}
        setIsLamenessDetectionModalOpen={setIsLamenessDetectionModalOpen}
      />
      {
        // getUserBundleGeoTiffResponse && (
        bundleExecutionResult && (
          <PDFReportGenerator
            handleDataPreparation={handleCowLamenessDataPreparation}
            bundleName={COW_LAMENESS_DETECTION}
            mapContainerRef={mapContainerRef}
            bundleProps={{
              data: {
                overviewValue: bundleExecutionResult,
                images: [getUserBundleGeoTiffResponse]
              }
            }}
          />
        )
      }
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(COW_LAMENESS_DETECTION)(CowLamenessDetection);
