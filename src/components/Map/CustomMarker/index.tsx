import { Marker, Popup } from "react-leaflet";
import { AppConfig } from "@/lib/AppConfig";
import LeafletDivIcon from "../LeafletDivIcon";
import useMapContext from "../useMapContext";
import MarkerIconWrapper, { CustomMarkerProps } from "./MarkerIconWrapper";

const CustomMarker: React.FC<CustomMarkerProps> = (
  {
    position,
    icon,
    color,
    popupContent,
    onClick
  }) => {
  const { map } = useMapContext();

  const handleMarkerClick = () => map?.panTo(position);

  return (
    <Marker
      position={position}
      icon={LeafletDivIcon({
        source: (
          <MarkerIconWrapper
            color={color}
            icon={icon}
          />
        ),
        anchor: [(AppConfig.ui.markerIconSize + 16) / 2, (AppConfig.ui.markerIconSize + 16) / 2]
      })}
      eventHandlers={{ click: onClick || handleMarkerClick }}
    >
      {
        popupContent && (
          <Popup minWidth={300} maxWidth={400}>
            {popupContent}
          </Popup>
        )
      }
    </Marker>
  );
};

export default CustomMarker;
