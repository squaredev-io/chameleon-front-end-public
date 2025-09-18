import {
  getUserBundleGeoJson,
  getUserBundleGeoTiff,
  getUserBundleJson,
  getUserBundles,
  getUserBundleShapeFile
} from "./bundles";

export const bundlesApiEndpoints = (builder) => ({
  getUserBundles: getUserBundles(builder),
  getUserBundleGeoJson: getUserBundleGeoJson(builder),
  getUserBundleJson: getUserBundleJson(builder),
  getUserBundleGeoTiff: getUserBundleGeoTiff(builder),
  getUserBundleShapeFile: getUserBundleShapeFile(builder)
});
