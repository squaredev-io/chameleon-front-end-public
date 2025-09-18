import { bundlesApiEndpoints } from "@/lib/services/endpoints/bundles";
import { cogApiEndpoints } from "@/lib/services/endpoints/cog";
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query/react";
import { Config } from "../../config";
import { acceligenceApiEndpoints } from "@/lib/services/endpoints/acceligence";

export const dipApiSliceName = "dipApi";
export const cogApiSliceName = "cogApi";
export const acceligenceApiSliceName = "acceligenceApi";

const baseQuery = fetchBaseQuery({
  baseUrl: Config.dipApi
} as FetchBaseQueryArgs);

const baseQueryCogApi = fetchBaseQuery({
  baseUrl: Config.cogApi
} as FetchBaseQueryArgs);

const baseQueryAcceligenceApi = fetchBaseQuery({
  baseUrl: Config.acceligenceApi
} as FetchBaseQueryArgs);

const baseQueryCogApiWithInterceptor: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api: BaseQueryApi,
  extraOptions
) => {
  return baseQueryCogApi(args, api, extraOptions);
};

const baseQueryAcceligenceApiWithInterceptor: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api: BaseQueryApi,
  extraOptions
) => {
  return baseQueryAcceligenceApi(args, api, extraOptions);
};

export const dipApi = createApi({
  reducerPath: dipApiSliceName,
  baseQuery: baseQuery,
  endpoints: (builder) => bundlesApiEndpoints(builder)
});

export const cogApi = createApi({
  baseQuery: baseQueryCogApiWithInterceptor,
  reducerPath: cogApiSliceName,
  endpoints: (builder) => cogApiEndpoints(builder)
});

export const acceligenceApi = createApi({
  baseQuery: baseQueryAcceligenceApiWithInterceptor,
  reducerPath: acceligenceApiSliceName,
  endpoints: (builder) => acceligenceApiEndpoints(builder)
});

export const {
  useGetUserBundlesQuery,
  useLazyGetUserBundleGeoJsonQuery,
  useLazyGetUserBundleJsonQuery,
  useLazyGetUserBundleGeoTiffQuery,
  useLazyGetUserBundleShapeFileQuery
} = dipApi;

export const { useLazyGetTileInfoQuery, useLazyGetTileStatisticsQuery } = cogApi;
export const { useGetLivestockRealTimeQuery } = acceligenceApi;
