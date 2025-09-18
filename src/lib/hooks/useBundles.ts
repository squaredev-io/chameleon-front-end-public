import { BUNDLES_TYPES } from "@/lib/constants";
import {
  useLazyGetUserBundleGeoJsonQuery,
  useLazyGetUserBundleGeoTiffQuery,
  useLazyGetUserBundleJsonQuery,
  useLazyGetUserBundleShapeFileQuery
} from "@/lib/services/api";
import { useEffect, useState } from "react";

// ToDo: the logic behind this is that this hook will be responsible for all the calls that should be made
//  to get all bundle related data. For example: it should first call the useGetUserBundlesQuery to get all
//  bundles names from the storage(for now only - after the DIP is integrated this will change accordingly),
//  then for the selected bundle it should call all the other hooks to get these bundles outputs (e.x. geoJson,
//  tif, shape files etc.) and then it should call another hook (useBringMapToPosition) in order to prepare
//  the map, get bounds, flyTo position, focus etc., and finally return an object with the outputs of the
//  selected bundle for the components to use.
const useBundles = (bundles, selectedBundle, fileExtention) => {
  const [output, setOutput] = useState(null);

  const [getUserBundleGeoJsonTrigger, { data: bundleGeoJsonResponse }] = useLazyGetUserBundleGeoJsonQuery();

  const [getUserBundleJsonTrigger, { data: bundleJsonResponse }] = useLazyGetUserBundleJsonQuery();

  const [getUserBundleShapeFileTrigger, { data: bundleShapeFileResponse }] = useLazyGetUserBundleShapeFileQuery();

  const [getUserBundleGeoTiffTrigger, { data: bundleGeoTiffResponse }] = useLazyGetUserBundleGeoTiffQuery();

  const triggerMapping = {
    [BUNDLES_TYPES.GEOJSON]: getUserBundleGeoJsonTrigger,
    [BUNDLES_TYPES.JSON]: getUserBundleJsonTrigger,
    [BUNDLES_TYPES.SHAPEFILE]: getUserBundleShapeFileTrigger,
    [BUNDLES_TYPES.TIF]: getUserBundleGeoTiffTrigger
  };

  useEffect(() => {
    if (bundles && bundles.length && selectedBundle && fileExtention) {
      const filteredItems = bundles.filter((bundle) => bundle.includes(selectedBundle));

      const fetchItem = filteredItems.filter((item) => item.includes(fileExtention));

      if (fetchItem) {
        let bundleFileName;
        if (fetchItem.find(item => item.includes("_output"))) {
          bundleFileName = `${selectedBundle}_output`;
        } else {
          bundleFileName = selectedBundle;
        }
        triggerMapping[fileExtention]({ file_name: bundleFileName });
      }
    }
  }, [bundles, selectedBundle, fileExtention]);

  useEffect(() => {
    if (bundleGeoJsonResponse) {
      setOutput(bundleGeoJsonResponse);
    } else if (bundleJsonResponse) {
      setOutput(bundleJsonResponse);
    } else if (bundleGeoTiffResponse) {
      setOutput(bundleGeoTiffResponse);
    } else if (bundleShapeFileResponse) {
      setOutput(bundleShapeFileResponse);
    }
  }, [bundleGeoJsonResponse, bundleJsonResponse, bundleGeoTiffResponse, bundleShapeFileResponse]);

  return output;
};

export default useBundles;
