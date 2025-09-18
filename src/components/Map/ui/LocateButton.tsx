import { LatLngExpression } from "leaflet";
import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppConfig } from "@/lib/AppConfig";
import useMapContext from "../useMapContext";
import colors from "tailwindcss/colors";
import CustomMarker from "@/components/Map/CustomMarker";

const LocateButton: React.FC = () => {
  const { map } = useMapContext();
  const [userPosition, setUserPosition] = useState<LatLngExpression | undefined>(undefined);

  const handleClick = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      });
    } else {
      setUserPosition(undefined);
    }
  }, [map]);

  useEffect(() => {
    if (userPosition) {
      map?.flyTo(userPosition);
    }
  }, [userPosition]);

  return (
    <>
      <button
        aria-label="locate"
        type="button"
        style={{ zIndex: 400 }}
        className="button absolute rounded top-16 right-3 p-2 shadow-md text-dark bg-white"
        onClick={() => handleClick()}
      >
        <LocateFixed size={AppConfig.ui.mapIconSize} />
      </button>
      {userPosition && (
        <CustomMarker
          color={colors.green[400]}
          icon={LocateFixed}
          position={userPosition}
        />
      )}
    </>
  );
};

export default LocateButton;
