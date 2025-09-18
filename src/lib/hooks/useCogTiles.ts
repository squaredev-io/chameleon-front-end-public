import { useLazyGetTileInfoQuery, useLazyGetTileStatisticsQuery } from "@/lib/services/api";
import { useEffect, useRef, useState } from "react";
import { Config } from "../../config";

export type GetTileUrlParamsType = {
  url: string;
  rescale?: string;
  colorMap?: string;
  returnMask?: boolean;
  noData?: number | string; // Accept string for multiple NoData values
  bidx?: string; // For specifying bands
  resampling?: string; // Add resampling method option
  unscale?: boolean;
  reproject?: string;
}

/**
 * Creates a properly formatted TiTiler URL for tile requests
 */
const getTileUrl = (params: GetTileUrlParamsType) => {
  const { url, rescale, colorMap, returnMask, noData, bidx, resampling, unscale, reproject } = params;

  const queryParams = [
    url ? `url=${encodeURIComponent(url)}` : "",
    returnMask ? `return_mask=${returnMask}` : "",
    noData !== undefined ? `nodata=${noData}` : "",
    rescale ? `rescale=${rescale}` : "",
    colorMap ? `colormap_name=${colorMap}` : "",
    resampling ? `resampling=${resampling}` : "",
    unscale !== undefined ? `unscale=${unscale}` : "",
    reproject ? `reproject=${reproject}` : ""
  ];

  if (bidx) {
    const bidxParts = bidx.split(",").map(b => `bidx=${b.trim()}`);
    queryParams.push(...bidxParts);
  }

  const endpoint = `cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${queryParams.filter(Boolean).join("&")}`;
  return `${Config.cogApi}${endpoint}`;
};


export type CogTilesResponseType = {
  tileUrl: string;
  bandMinMaxValues: Array<number>;
  bounds: Array<Array<number>>;
  maxZoom: number;
  minZoom: number;
  center: number;
}

/*
 * Custom hook created for fetching tile-based information such as the tileUrl, bounds, and zoom info
 * from the TiTiler service of the COG API given a TIF url as input and an optional colormap
 */
const useCogTiles = (
  url: string,
  colormap?: string,
  rescale?: string,
  options?: {
    bidx?: string,
    noData?: number,
    returnMask?: boolean
    // resampling?: string,
    // timeout?: number,
    // debug?: boolean
  }
): CogTilesResponseType | null => {
  const [output, setOutput] = useState<CogTilesResponseType | null>(null);
  const [tileUrl, setTileUrl] = useState<string>("");
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [bandMinMaxValues, setBandMinMaxValues] = useState<Array<number>>([0, 1]);
  const timeoutRef = useRef<any>(null);

  const [getTileInfoTrigger, { data: tileInfoResponse }] = useLazyGetTileInfoQuery();
  const [getTileStatisticsTrigger, { data: tileStatisticsResponse }] = useLazyGetTileStatisticsQuery();

  useEffect(() => {
    if (url) {
      getTileInfoTrigger(url);

      setTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const statisticsPromise = getTileStatisticsTrigger(url).unwrap();

      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
        console.warn(`Tile statistics request timed out after 10 seconds`);
      }, 10000);

      statisticsPromise.then(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }).catch((error) => {
        console.error("Error fetching tile statistics:", error);
        setTimedOut(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      });
    }

    // Clean up timeout when component unmounts or input changes
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    // Process statistics data when available, or proceed with default values if timed out
    if (tileStatisticsResponse || timedOut) {
      try {
        // Default tile URL as fallback
        let tileUrl;

        if (tileStatisticsResponse) {
          // Extract band statistics
          const bands = Object.keys(tileStatisticsResponse).filter(k => k.startsWith("b"));

          // console.log("bands: ", bands);
          // console.log("tileStatisticsResponse: ", tileStatisticsResponse);

          if (bands.length === 0) {
            console.warn("No band statistics found");
          }

          // Get min/max values from first band or use defaults
          const bandMinMaxValues = bands.length > 0
            ? [tileStatisticsResponse[bands[0]].min, tileStatisticsResponse[bands[0]].max]
            : [0, 1];

          setBandMinMaxValues(bandMinMaxValues);

          // Create URL parameters
          const basicParams: GetTileUrlParamsType = {
            url,
            rescale: rescale || `${bandMinMaxValues[0]},${bandMinMaxValues[1]}`,
            colorMap: colormap,
            // noData: options?.noData,
            bidx: options?.bidx || (bands.length >= 3 ? "1,2,3" : undefined),
            resampling: "nearest",
            reproject: "nearest",
            unscale: false,
            returnMask: options?.returnMask
          };

          // Add additional parameters based on colormap
          const finalParams = colormap
            ? { ...basicParams, returnMask: true }
            : { ...basicParams, noData: options?.noData !== undefined ? options.noData : 255 };

          tileUrl = getTileUrl(finalParams);
        } else {
          // Fallback URL with minimal parameters
          console.warn("Using default rendering without statistics due to timeout");
          tileUrl = getTileUrl({
            url
          });
        }

        // console.log("tileUrl: ", tileUrl);
        setTileUrl(tileUrl);

      } catch (err) {
        console.error("Error generating tile URL:", err);
      }
    }
    // }, [tileStatisticsResponse, timedOut, url, rescale, colormap, options]);
  }, [tileStatisticsResponse, timedOut]);

  useEffect(() => {
    if (tileUrl && tileInfoResponse) {
      const { bounds, center, minzoom, maxzoom } = tileInfoResponse;
      setOutput({
        tileUrl,
        bandMinMaxValues,
        bounds: [
          [bounds[1], bounds[0]], // Southwest corner
          [bounds[3], bounds[2]] // Northeast corner
        ],
        minZoom: minzoom,
        maxZoom: maxzoom,
        center: center
      });
    }
  }, [tileUrl, tileInfoResponse]);
  
  return output;
};

export default useCogTiles;
