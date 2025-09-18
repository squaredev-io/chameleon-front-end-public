import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const getTileInfo = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: (url) => {
      return {
        url: `/cog/tilejson.json?tileMatrixSetId=WebMercatorQuad&tile_scale=1&url=${encodeURIComponent(url)}&return_mask=true&nodata=255`,
        method: "GET"
      };
    }
  });

interface TileStatistics {
  [key: string]: {
    min: number;
    max: number;
    mean: number;
    count: number;
    sum: number;
    std: number;
    median: number;
    majority: number;
    minority: number;
    unique: number;
    histogram: number[][];
    valid_percent: number;
    masked_pixels: number;
    valid_pixels: number;
    [key: string]: number | number[][] | string;
  };
}

export const getTileStatistics = (build: EndpointBuilder<any, any, any>) =>
  build.query<TileStatistics, string>({
    query: (url: string) => {
      return {
        url: `/cog/statistics?url=${encodeURIComponent(url)}`,
        method: "GET"
      };
    }
  });

export const cogApiEndpoints = (builder) => ({
  getTileInfo: getTileInfo(builder),
  getTileStatistics: getTileStatistics(builder)
});
