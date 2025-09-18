import { processImageToBase64 } from "@/components/PDFReportGenerator/actions";
import { LatLngBoundsExpression } from "leaflet";
// import proj4 from "proj4";

const publicDomain = process.env.NEXT_PUBLIC_DOMAIN as string;
const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000/" : publicDomain;

// Image processing helper
export const processImageWithRetry = async (url: string, retries = 3): Promise<{ base64: string; metadata: any }> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await processImageToBase64(url);
      if (result) {
        return result;
      }
      throw new Error("Empty image result");
    } catch (error) {
      console.error(`Attempt ${i + 1} failed to process image:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw new Error("Failed to process image after all retries");
};

// Utility function to generate blur data URL for image placeholders
export async function dynamicBlurDataUrl(url) {
  const base64str = await fetch(`${baseUrl}/_next/image?url=${url}&w=16&q=50`).then(async (res) =>
    Buffer.from(await res.arrayBuffer()).toString("base64")
  );

  const blurSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <image preserveAspectRatio="none" filter="url(#b)" x="0" y="0" height="100%" width="100%" 
      href="data:image/avif;base64,${base64str}" />
    </svg>
  `;

  const toBase64 = (str) => (typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str));

  return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
}

/**
 * Converts a bounding box array to Leaflet LatLngBoundsExpression
 * Validates that it's in [west, south, east, north] format
 */
export const getLeafletBoundsFromArray = (boundsArray: number[]): LatLngBoundsExpression | null => {
  if (!Array.isArray(boundsArray) || boundsArray.length !== 4) {
    console.error("Invalid bounds array. Expected format: [west, south, east, north]");
    return null;
  }

  const [west, south, east, north] = boundsArray;

  const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
  const isValidLng = (lng: number) => lng >= -180 && lng <= 180;

  if (!isValidLng(west) || !isValidLng(east) || !isValidLat(south) || !isValidLat(north)) {
    console.warn("Bounds values seem out of valid lat/lng range.");
  }

  if (west >= east || south >= north) {
    console.warn("Bounds are not logically ordered (min values should be less than max).");
  }

  return [
    [south, west], // Southwest corner: (lat, lng)
    [north, east] // Northeast corner: (lat, lng)
  ];
};

// // Register common projections
// const registerCommonProjections = () => {
//   // Common projections
//   // proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs"); // Web Mercator
//   // proj4.defs("EPSG:2263", "+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=ft +no_defs"); // NY State Plane
//   // proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"); // British National Grid
//   // proj4.defs("EPSG:32633", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"); // UTM Zone 33N
//   // proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"); // ETRS89-LAEA Europe
// };
//
// // Function to analyze coordinates and detect likely projection
// const detectProjection = (geojson) => {
//   registerCommonProjections();
//
//   if (!geojson || !geojson.features || geojson.features.length === 0) {
//     return "EPSG:4326"; // Default to WGS84
//   }
//
//   // Get a sample of coordinates
//   let sampleCoords = [];
//   for (const feature of geojson.features) {
//     if (feature.geometry) {
//       if (feature.geometry.type === "Point") {
//         sampleCoords.push(feature.geometry.coordinates);
//       } else if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiPoint") {
//         sampleCoords = sampleCoords.concat(feature.geometry.coordinates.slice(0, 5));
//       } else if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiLineString") {
//         sampleCoords = sampleCoords.concat(feature.geometry.coordinates[0].slice(0, 5));
//       } else if (feature.geometry.type === "MultiPolygon") {
//         sampleCoords = sampleCoords.concat(feature.geometry.coordinates[0][0].slice(0, 5));
//       }
//       if (sampleCoords.length >= 10) break;
//     }
//   }
//
//   // Analyze coordinate ranges
//   let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
//
//   for (const coord of sampleCoords) {
//     const [x, y] = coord;
//     minX = Math.min(minX, x);
//     maxX = Math.max(maxX, x);
//     minY = Math.min(minY, y);
//     maxY = Math.max(maxY, y);
//   }
//
//   // Decision tree based on coordinate ranges
//   // These are rough estimates and may need adjustment for your specific data
//
//   // WGS84 / EPSG:4326 - Decimal degrees
//   if (minX >= -180 && maxX <= 180 && minY >= -90 && maxY <= 90) {
//     return "EPSG:4326";
//   }
//
//   // Web Mercator / EPSG:3857 - Meters, typical range for most of world
//   if (Math.abs(minX) > 10000 && Math.abs(maxX) > 10000) {
//     return "EPSG:3857";
//   }
//
//   // UTM coordinates typically have large easting values (6 digits)
//   if (minX > 100000 && maxX < 1000000) {
//     // Could be any UTM zone - this is a simplification
//     return "EPSG:32633"; // Example: UTM Zone 33N
//   }
//
//   // British National Grid
//   if (minX > 0 && maxX < 700000 && minY > 0 && maxY < 1300000) {
//     return "EPSG:27700";
//   }
//
//   // NY State Plane
//   if (minX > 900000 && maxX < 1100000 && minY > 100000 && maxY < 300000) {
//     return "EPSG:2263";
//   }
//
//   // If none of the above, default to Web Mercator as it's common
//   return "EPSG:3857";
// };
//
// // Handle GeoJSON with unknown projection
// export const handleUnknownProjection = (geojson) => {
//   // First, check if it's already WGS84 by testing if coordinates look like lat/lon
//   if (isLikelyWGS84(geojson)) {
//     return geojson;
//   }
//
//   // Detect most likely projection
//   const detectedProjection = detectProjection(geojson);
//   console.log(`Detected projection: ${detectedProjection}`);
//
//   // Transform using detected projection
//   return transformGeoJSON(geojson, detectedProjection, "EPSG:4326");
// };
//
// // Check if coordinates are likely already in WGS84
// const isLikelyWGS84 = (geojson) => {
//   if (!geojson || !geojson.features || geojson.features.length === 0) {
//     return true;
//   }
//
//   // Get a sample coordinate
//   let sampleCoord = null;
//   for (const feature of geojson.features) {
//     if (feature.geometry) {
//       if (feature.geometry.type === "Point") {
//         sampleCoord = feature.geometry.coordinates;
//         break;
//       } else if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiPoint") {
//         sampleCoord = feature.geometry.coordinates[0];
//         break;
//       } else if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiLineString") {
//         sampleCoord = feature.geometry.coordinates[0][0];
//         break;
//       } else if (feature.geometry.type === "MultiPolygon") {
//         sampleCoord = feature.geometry.coordinates[0][0][0];
//         break;
//       }
//     }
//   }
//
//   if (!sampleCoord) return true;
//
//   const [x, y] = sampleCoord;
//   // Check if coordinates are in a reasonable range for WGS84
//   return Math.abs(x) <= 180 && Math.abs(y) <= 90;
// };
//
// // Transform GeoJSON from source projection to target projection
// const transformGeoJSON = (geojson, sourceProj, targetProj) => {
//   if (!geojson || !geojson.features) {
//     return geojson;
//   }
//
//   const transformed = JSON.parse(JSON.stringify(geojson));
//
//   transformed.features = transformed.features.map(feature => {
//     if (!feature.geometry) return feature;
//
//     switch (feature.geometry.type) {
//       case "Point":
//         feature.geometry.coordinates = transformPoint(feature.geometry.coordinates, sourceProj, targetProj);
//         break;
//       case "LineString":
//         feature.geometry.coordinates = feature.geometry.coordinates.map(point =>
//           transformPoint(point, sourceProj, targetProj)
//         );
//         break;
//       case "Polygon":
//         feature.geometry.coordinates = feature.geometry.coordinates.map(ring =>
//           ring.map(point => transformPoint(point, sourceProj, targetProj))
//         );
//         break;
//       case "MultiPoint":
//         feature.geometry.coordinates = feature.geometry.coordinates.map(point =>
//           transformPoint(point, sourceProj, targetProj)
//         );
//         break;
//       case "MultiLineString":
//         feature.geometry.coordinates = feature.geometry.coordinates.map(line =>
//           line.map(point => transformPoint(point, sourceProj, targetProj))
//         );
//         break;
//       case "MultiPolygon":
//         feature.geometry.coordinates = feature.geometry.coordinates.map(polygon =>
//           polygon.map(ring =>
//             ring.map(point => transformPoint(point, sourceProj, targetProj))
//           )
//         );
//         break;
//     }
//
//     return feature;
//   });
//
//   return transformed;
// };
//
// // Transform point coordinates
// const transformPoint = (coordinates, from, to) => {
//   try {
//     return proj4(from, to, coordinates);
//   } catch (err) {
//     console.error("Error transforming coordinates:", err);
//     return coordinates;
//   }
// };
