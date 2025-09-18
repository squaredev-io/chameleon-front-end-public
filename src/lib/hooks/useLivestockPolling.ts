import { useState } from "react";
import { useGetLivestockRealTimeQuery } from "@/lib/services/api";

// Custom hook for polling GeoJSON data every 15 seconds for the Livestock Mngmt Bundle
export const useLivestockPolling = (options: any = {}) => {
  const { pollingInterval } = options;
  const [skipPolling, setSkipPolling] = useState(false);

  const { data, error, isLoading, isSuccess, isError, refetch } = useGetLivestockRealTimeQuery(
    undefined,
    {
      skip: skipPolling,
      pollingInterval
    }
  );

  const startPolling = () => setSkipPolling(false);
  const stopPolling = () => setSkipPolling(true);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
    isPolling: !skipPolling,
    startPolling,
    stopPolling,
    manualFetch: refetch
  };
};

export default useLivestockPolling;
