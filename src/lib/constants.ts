import { LatLngExpression } from "leaflet";

export const AUTOMATIC_VINES_DETECTION = "automatic_vines_detection";
export const CROP_GROWTH = "crop_growth";
export const HEALTH_STATUS_OF_VEGETATION = "health_status_of_vegetation_vi";
export const LIVESTOCK = "livestock";
export const COW_LAMENESS_DETECTION = "cow_lameness";
export const SOIL_ZONIFICATION = "soil_zoning";
export const ANIMAL_BEHAVIOR = "animal_behavior";
export const QUANTIFICATION_OF_LOGS = "quantification_of_logs";
export const FORESTRY_RESILIENCE_ANALYTICS = "forestry_resilience_analytics";
export const TIMBER_STACK_INVENTORY = "timber_stack_inventory";

export type CustomMarkerType = {
  position: LatLngExpression;
  index: number;
};

export const BUNDLES = [
  AUTOMATIC_VINES_DETECTION,
  CROP_GROWTH,
  HEALTH_STATUS_OF_VEGETATION,
  LIVESTOCK,
  COW_LAMENESS_DETECTION,
  SOIL_ZONIFICATION,
  ANIMAL_BEHAVIOR,
  QUANTIFICATION_OF_LOGS,
  FORESTRY_RESILIENCE_ANALYTICS,
  TIMBER_STACK_INVENTORY
];

export const BUNDLES_TYPES = {
  GEOJSON: "geojson",
  JSON: "json",
  TIF: "tif",
  WEBP: "webp",
  ZIP: "zip",
  SHAPEFILE: "shp"
};

export const BUNDLES_LITERALS = {
  [AUTOMATIC_VINES_DETECTION]: "Automatic Vines Detection (AiDEAS)",
  [CROP_GROWTH]: "Crop Growth and Development Monitoring (UCLM)",
  [COW_LAMENESS_DETECTION]: "Lameness Detection in Cows (AiDEAS)",
  [HEALTH_STATUS_OF_VEGETATION]: "Health Status of Vegetation (LAMMC)",
  [LIVESTOCK]: "Livestock Mngmt and Monitoring (AiDEAS)",
  [SOIL_ZONIFICATION]: "Soil Zoning (UCLM)",
  [ANIMAL_BEHAVIOR]: "Animal Behavior (MadrIAno)",
  [QUANTIFICATION_OF_LOGS]: "Quantification Of Logs (THRUST)",
  [FORESTRY_RESILIENCE_ANALYTICS]: "Forestry Resilience Analytics (SAFRA)",
  [TIMBER_STACK_INVENTORY]: "Timber Stack Inventory (TILO)"
};

export const BUNDLES_PDF_REPORT_FILENAME = {
  [AUTOMATIC_VINES_DETECTION]: "automatic_vines_detection_report",
  [CROP_GROWTH]: "crop_growth_and_development_monitoring",
  [COW_LAMENESS_DETECTION]: "lameness_detection_in_cows_report",
  [HEALTH_STATUS_OF_VEGETATION]: "health_status_of_vegetation_report",
  [LIVESTOCK]: "livestock_management_and_monitoring_report",
  [SOIL_ZONIFICATION]: "soil_zoning_report",
  [ANIMAL_BEHAVIOR]: "animal_behavior_report",
  [QUANTIFICATION_OF_LOGS]: "quantification_of_logs_report",
  [FORESTRY_RESILIENCE_ANALYTICS]: "forestry_resilience_analytics_report",
  [TIMBER_STACK_INVENTORY]: "timber_stack_inventory_report"
};

// ToDo: This has to be made dynamic through the DIP API when connected
export const BUNDLE_FILE_REQUEST_MAPPING = {
  [COW_LAMENESS_DETECTION]: BUNDLES_TYPES.JSON,
  [AUTOMATIC_VINES_DETECTION]: BUNDLES_TYPES.GEOJSON,
  [CROP_GROWTH]: BUNDLES_TYPES.TIF,
  [HEALTH_STATUS_OF_VEGETATION]: BUNDLES_TYPES.GEOJSON,
  [LIVESTOCK]: BUNDLES_TYPES.GEOJSON,
  [SOIL_ZONIFICATION]: BUNDLES_TYPES.GEOJSON,
  [ANIMAL_BEHAVIOR]: BUNDLES_TYPES.GEOJSON,
  [QUANTIFICATION_OF_LOGS]: BUNDLES_TYPES.GEOJSON,
  [FORESTRY_RESILIENCE_ANALYTICS]: BUNDLES_TYPES.GEOJSON,
  [TIMBER_STACK_INVENTORY]: BUNDLES_TYPES.GEOJSON
};

// NGRDI – normalized green-red difference index
export const NGRDI = "NGRDI";
// VARI – visible atmospherically resistant index
export const VARI = "VARI";
