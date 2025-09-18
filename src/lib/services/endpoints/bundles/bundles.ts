import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

export const getUserBundles = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, void>({
    query: () => {
      return {
        url: "/v1/bundles",
        method: "GET"
      };
    }
  });

export const getUserBundleGeoJson = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: (params) => {
      return {
        url: "/v1/geojson",
        method: "GET",
        params
      };
    }
  });

export const getUserBundleJson = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: (params) => {
      return {
        url: "/v1/json",
        method: "GET",
        params
      };
    }
  });

export const getUserBundleShapeFile = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: (params) => {
      return {
        url: "/v1/shp",
        method: "GET",
        params
      };
    }
  });

export const getUserBundleGeoTiff = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: (params) => {
      return {
        url: "/v1/geotiff",
        method: "GET",
        params
      };
    }
  });
