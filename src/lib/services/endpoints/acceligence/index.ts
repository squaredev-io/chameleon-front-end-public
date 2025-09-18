import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/react";

export const getLivestockRealTime = (build: EndpointBuilder<any, any, any>) =>
  build.query<any, any>({
    query: () => ({
      url: "api/geojson",
      method: "GET"
    })
  });

export const acceligenceApiEndpoints = (builder) => ({
  getLivestockRealTime: getLivestockRealTime(builder)
});
