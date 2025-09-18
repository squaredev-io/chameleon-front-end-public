"use client";

import { notFound, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import useUI from "@/lib/hooks/useUI";
import useBundles from "@/lib/hooks/useBundles";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import { BUNDLE_FILE_REQUEST_MAPPING, BUNDLES } from "@/lib/constants";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";
import { AppConfig } from "@/lib/AppConfig";
import MapFooter from "@/components/Footer/MapFooter";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const BundlePageContent = () => {
  const searchParams = useSearchParams();
  const bundleName = searchParams.get("bundle");

  const { changeActiveBundle, changeBundleResponse, resetUi } = useUI();
  const { resetLayerRegistry } = useLayerRegistry();
  const { data: bundles } = useGetUserBundlesQuery();

  if (!bundleName || !BUNDLES.includes(bundleName)) {
    notFound();
  }

  const bundleResult = useBundles(
    bundles,
    bundleName,
    BUNDLE_FILE_REQUEST_MAPPING[bundleName]
  );

  useEffect(() => {
    resetUi();
    resetLayerRegistry();

    setTimeout(() => {
      changeBundleResponse(null);
      changeActiveBundle(bundleName);
    }, 100);
  }, [bundleName]);

  useEffect(() => {
    if (bundleResult) {
      changeBundleResponse(bundleResult);
    }
  }, [bundleResult]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-hidden"
        style={{
          marginBottom: `${AppConfig.ui.footerHeight}px`
        }}
      >
        <Map />
      </div>
      <MapFooter />
    </div>
  );
};

const BundlePage = () => (
  <Suspense>
    <BundlePageContent />
  </Suspense>
);

export default BundlePage;
