import { LatLngExpression } from "leaflet";

// ToDo: transform this static configuration into initial state management ui section
export const AppConfig = {
  minZoom: 3,
  maxZoom: 18, // max zoom level of the ESRI_WORLD_IMAGERY tile provider (18)
  // maxZoom: 30, // max zoom level of the PLANET tile provider
  ui: {
    topBarHeight: 80,
    footerHeight: 22, // Add footer height
    // sideBarWidth: 300, // ToDo: This has got to change to adapt using tailwind props?
    sideBarWidth: 0,
    bigIconSize: 48,
    mapIconSize: 32,
    markerIconSize: 32,
    menuIconSize: 16,
    topBarIconSize: 24
  },
  baseCenter: [46.20414, 12.71242] as LatLngExpression
};
