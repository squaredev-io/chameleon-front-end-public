import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import useLeafletWindow from "@/components/Map/useLeafletWindow";
import useMapContext from "@/components/Map/useMapContext";
import { ANIMAL_BEHAVIOR, CustomMarkerType } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import { dynamicBlurDataUrl } from "@/lib/helper/helperFunctions";
import useUI from "@/lib/hooks/useUI";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { LatLng, latLngBounds } from "leaflet";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FeatureGroup, Polyline } from "react-leaflet";
import colors from "tailwindcss/colors";
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

type AnimalBehaviorPopupContentProps = {
  activeMarker: CustomMarkerType;
  bundleResponse: { features: any[] };
  blurDataUrls: { [key: number]: string };
  setActiveMarker?: (marker: any) => void;
  firstMarkerIndex?: number;
  lastMarkerIndex?: number;
};

// Popup component for displaying animal behavior information
export const AnimalBehaviorsPopupContent = (
  {
    activeMarker,
    bundleResponse,
    blurDataUrls,
    setActiveMarker,
    firstMarkerIndex,
    lastMarkerIndex
  }: AnimalBehaviorPopupContentProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => setOpen(false);
  const handleClickOpen = () => setOpen(true);
  const handleImageLoad = () => setIsLoading(false);
  const handleLoadingComplete = () => setIsLoading(false);

  const imageName = bundleResponse?.features[activeMarker.index].properties.image_name.replace(".jpg", "");
  const blurDataUrl = blurDataUrls[imageName] || "";
  const description = bundleResponse?.features[activeMarker.index].properties.description;

  return Object.keys(blurDataUrls).length ? (
    <div className="max-w-lg h-auto relative p-2 flex flex-col items-center">
      <>
        <div
          onClick={handleClickOpen}
          className="cursor-pointer"
        >
          <Image
            src={`${Config.apiURL}/v1/image/animal_behavior/${imageName}`}
            alt={`Frame ${imageName}`}
            width={650}
            height={450}
            className="justify-center"
            placeholder="blur"
            blurDataURL={blurDataUrl}
          />
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="lg"
          fullWidth
          disableEnforceFocus
        >
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
              src={`${Config.apiURL}/v1/image/animal_behavior/${imageName}`}
              alt={`Frame ${imageName}`}
              width={650}
              height={450}
              className="justify-center"
              placeholder="blur"
              blurDataURL={blurDataUrl}
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
          <strong>Image: </strong>
          {imageName}
        </div>
        <div className="mb-16">
          <strong>Description: </strong>
          {description || "No description available"}
        </div>
        {setActiveMarker && (
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
        )}
      </div>
    </div>
  ) : null;
};

type AnimalBehaviorModalProps = {
  blurDataUrls: { [key: number]: string };
  bundleResponse: { features: any[] };
  clusterMarkers: CustomMarkerType[];
  setClusterMarkers: (markers: CustomMarkerType[] | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

const Modal = (
  {
    blurDataUrls,
    bundleResponse,
    clusterMarkers,
    setClusterMarkers,
    isModalOpen,
    setIsModalOpen
  }: AnimalBehaviorModalProps) => {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClusterMarkers(null);
  };

  return activeMarker ? (
    <Dialog
      open={isModalOpen}
      onClose={handleCloseModal}
      maxWidth="lg"
    >
      <DialogTitle>Animal Behavior Information</DialogTitle>
      <DialogContent>
        <AnimalBehaviorsPopupContent
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

type ClusteredMarkersProps = {
  blurDataUrls: { [key: number]: string };
  bundleResponse: { features: any[] };
  setClusterMarkers: (markers: CustomMarkerType[]) => void;
  markerCoordinates: LatLng[];
  setIsModalOpen: (isOpen: boolean) => void;
};

// Component for rendering clustered animal behavior markers and their popups
const ClusteredMarkers = (
  {
    blurDataUrls,
    bundleResponse,
    setClusterMarkers,
    markerCoordinates,
    setIsModalOpen
  }: ClusteredMarkersProps) => (
  <LeafletCluster
    icon={MapPin}
    chunkedLoading
    color={colors.purple[700]}
    extraProps={{
      setClusterMarkers,
      livestockMarkerCoordinates: markerCoordinates,
      setIsLivestockManagementInformationModalOpen: setIsModalOpen
    }}
  >
    {markerCoordinates.map((marker, index) => (
      <CustomMarker
        icon={MapPin}
        position={marker}
        color={colors.purple[700]}
        key={`marker-${bundleResponse?.features[index].properties.image_name}`}
        popupContent={
          <AnimalBehaviorsPopupContent
            activeMarker={{ position: marker, index }}
            bundleResponse={bundleResponse}
            blurDataUrls={blurDataUrls}
          />
        }
      />
    ))}
  </LeafletCluster>
);

// Main component for Animal Behavior bundle
const AnimalBehavior = () => {
  const { map } = useMapContext();
  const leafletWindow = useLeafletWindow();
  const { bundleResponse, viewportInfo } = useUI();
  const [blurDataUrls, setBlurDataUrls] = useState({});
  const [clusterMarkers, setClusterMarkers] = useState<CustomMarkerType[] | null>(null);
  const [isAnimalBehaviorInformationModalOpen, setIsAnimalBehaviorInformationModalOpen] = useState<any>(null);

  // Extract coordinates for markers from the bundle response
  const animalBehaviorMarkerCoordinates = bundleResponse?.features.map((feature: any) => [
    feature.geometry.coordinates[1],
    feature.geometry.coordinates[0]
  ]);
  const polylinePositions = animalBehaviorMarkerCoordinates?.map((coord: Array<number>) => [coord[1], coord[0]]);

  // Calculate bounds for all markers
  const allMarkerBounds = useMemo(() => {
    if (!leafletWindow || !animalBehaviorMarkerCoordinates) {
      return undefined;
    }

    return latLngBounds(animalBehaviorMarkerCoordinates);
  }, [leafletWindow, animalBehaviorMarkerCoordinates]);

  // Fly to the calculated bounds when markers are updated
  useEffect(() => {
    if (!allMarkerBounds || !leafletWindow || !map) {
      return;
    }

    if (!map.invalidateSize()) {
      return;
    }

    map.flyTo([allMarkerBounds.getCenter().lat, allMarkerBounds.getCenter().lng], map.getBoundsZoom(allMarkerBounds));
  }, [allMarkerBounds, viewportInfo.viewportWidth, viewportInfo.viewportHeight]);

  // Fetch blur data URLs for image placeholders
  useEffect(() => {
    const fetchBlurDataUrls = async () => {
      const urls: any = {};
      for (const feature of bundleResponse?.features || []) {
        const imageName = feature?.properties?.image_name.replace(".jpg", "");
        if (imageName) {
          const imageUrl = `${Config.apiURL}/v1/image/animal_behavior/${imageName}`;
          urls[imageName] = await dynamicBlurDataUrl(imageUrl);
        }
      }
      setBlurDataUrls(urls);
    };

    fetchBlurDataUrls();

    return () => {
      setBlurDataUrls({});
    };
  }, [bundleResponse]);

  return polylinePositions?.length ? (
    <FeatureGroup>
      <ClusteredMarkers
        blurDataUrls={blurDataUrls}
        bundleResponse={bundleResponse}
        setClusterMarkers={setClusterMarkers}
        markerCoordinates={animalBehaviorMarkerCoordinates}
        setIsModalOpen={setIsAnimalBehaviorInformationModalOpen}
      />
      <Polyline
        positions={polylinePositions}
        color={colors.blue[400]}
      />
      {clusterMarkers && clusterMarkers.length && (
        <Modal
          blurDataUrls={blurDataUrls}
          bundleResponse={bundleResponse}
          clusterMarkers={clusterMarkers}
          setClusterMarkers={setClusterMarkers}
          isModalOpen={isAnimalBehaviorInformationModalOpen}
          setIsModalOpen={setIsAnimalBehaviorInformationModalOpen}
        />
      )}
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(ANIMAL_BEHAVIOR)(AnimalBehavior);
