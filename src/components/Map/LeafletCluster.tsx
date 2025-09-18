import { AppConfig } from "@/lib/AppConfig";
import { CustomMarkerType } from "@/lib/constants";
import {
  createElementObject,
  createPathComponent,
  extendContext,
  LeafletContextInterface,
  LeafletElement
} from "@react-leaflet/core";
import { LatLng, LeafletMouseEventHandlerFn, Marker, MarkerClusterGroup, MarkerClusterGroupOptions } from "leaflet";
import "leaflet.markercluster";
import { LucideProps } from "lucide-react";
import React, { FunctionComponent } from "react";
import MarkerIconWrapper from "./CustomMarker/MarkerIconWrapper";
import LeafletDivIcon from "./LeafletDivIcon";

type ClusterEvents = {
  onClick?: LeafletMouseEventHandlerFn;
  onDblClick?: LeafletMouseEventHandlerFn;
  onMouseDown?: LeafletMouseEventHandlerFn;
  onMouseUp?: LeafletMouseEventHandlerFn;
  onMouseOver?: LeafletMouseEventHandlerFn;
  onMouseOut?: LeafletMouseEventHandlerFn;
  onContextMenu?: LeafletMouseEventHandlerFn;
};

type MarkerClusterControl = MarkerClusterGroupOptions & {
  children: React.ReactNode;
  icon: FunctionComponent<LucideProps>;
  color: string;
  extraProps: any;
} & ClusterEvents;

const CreateMarkerClusterGroup = (
  props: MarkerClusterControl,
  context: LeafletContextInterface
): LeafletElement<MarkerClusterGroup, MarkerClusterControl> => {
  const { map } = context;

  const markerClusterGroup = new MarkerClusterGroup({
    removeOutsideVisibleBounds: false,
    spiderLegPolylineOptions: {
      className: "hidden"
    },
    // Disable spiderfying at max zoom level to avoid the spiral weird effect
    spiderfyOnMaxZoom: false,
    iconCreateFunction: (cluster) =>
      LeafletDivIcon({
        source: (
          <MarkerIconWrapper
            color={props.color}
            icon={props.icon}
            label={`${cluster.getChildCount()}`}
          />
        ),
        anchor: [AppConfig.ui.markerIconSize / 2, AppConfig.ui.markerIconSize / 2]
      }),
    ...props
  });

  // Custom cluster click behavior
  markerClusterGroup.on("clusterclick", (e) => {
    const cluster = e.layer as any;
    const currentZoom = map.getZoom();
    const maxZoom = map.getMaxZoom();

    if (currentZoom < maxZoom) {
      map.flyTo(cluster.getLatLng(), currentZoom + 1);
    } else {
      const childMarkers = cluster.getAllChildMarkers() as Marker[];
      if (childMarkers.length) {
        // TODO: Update extraProps with generic names (e.g. markerCoordinates, isInformationModalOpen)
        const clusterMarkers = props.extraProps.livestockMarkerCoordinates.reduce(
          (acc: CustomMarkerType[], cur: Array<number>, index: number) => {
            const matched = childMarkers.find((marker) => marker.getLatLng().equals(new LatLng(cur[0], cur[1])));
            return matched ? acc.concat({ position: matched.getLatLng(), index }) : acc;
          },
          []
        );

        props.extraProps.setClusterMarkers(clusterMarkers);
        props.extraProps.setIsLivestockManagementInformationModalOpen(true);
      }
    }
  });

  // Ensure that the extended context and return type match the expected types
  return createElementObject(
    markerClusterGroup,
    extendContext(context, { layerContainer: markerClusterGroup } as Partial<LeafletContextInterface>)
  ) as LeafletElement<MarkerClusterGroup, MarkerClusterControl>;
};

export const LeafletCluster = () =>
  createPathComponent<MarkerClusterGroup, MarkerClusterControl>(CreateMarkerClusterGroup);
