import { useAppDispatch, useAppSelector } from "@/lib/hooks/index";
import {
  HealthStatusOfVegetationParams,
  LayerZoomLevels,
  uiSliceActions,
  uiSliceSelectors,
  ViewportInfo
} from "@/lib/store/uiSlice";

const useUI = () => {
  const dispatch = useAppDispatch();

  return {
    resetUi: () => dispatch(uiSliceActions.resetUi()),
    viewportInfo: useAppSelector(uiSliceSelectors.viewportInfoSelector),
    changeViewportInfo: (viewportInfo: ViewportInfo) => dispatch(uiSliceActions.changeViewportInfo(viewportInfo)),
    digitalTwinToggle: useAppSelector(uiSliceSelectors.digitalTwinToggleSelector),
    changeDigitalTwinToggle: (digitalTwinToggle: boolean) => dispatch(uiSliceActions.changeDigitalTwinToggle(digitalTwinToggle)),
    drawPolygonToggle: useAppSelector(uiSliceSelectors.drawPolygonToggleSelector),
    changeDrawPolygonToggle: (drawPolygonToggle: boolean) => dispatch(uiSliceActions.changeDrawPolygonToggle(drawPolygonToggle)),
    bundleResponse: useAppSelector(uiSliceSelectors.bundleResponseSelector),
    changeBundleResponse: (bundleResponse: any) => dispatch(uiSliceActions.changeBundleResponse(bundleResponse)),
    activeBundle: useAppSelector(uiSliceSelectors.activeBundleSelector),
    changeActiveBundle: (activeBundle: any) => dispatch(uiSliceActions.changeActiveBundle(activeBundle)),
    layerZoomLevels: useAppSelector(uiSliceSelectors.layerZoomLevelsSelector),
    changeLayerZoomLevels: (layerZoomLevels: LayerZoomLevels) => dispatch(uiSliceActions.changeLayerZoomLevels(layerZoomLevels)),
    areNoneLayersChecked: useAppSelector(uiSliceSelectors.areNoneLayersCheckedSelector),
    changeAreNoneLayersChecked: (areNoneLayersChecked: boolean) => dispatch(uiSliceActions.changeAreNoneLayersChecked(areNoneLayersChecked)),
    healthStatusOfVegetationNGRDIParams: useAppSelector(uiSliceSelectors.healthStatusOfVegetationNGRDIParamsSelector),
    changeHealthStatusOfVegetationNGRDIParams: (healthStatusOfVegetationNGRDIParams: HealthStatusOfVegetationParams) =>
      dispatch(uiSliceActions.changeHealthStatusOfVegetationNGRDIParams(healthStatusOfVegetationNGRDIParams)),
    healthStatusOfVegetationVARIParams: useAppSelector(uiSliceSelectors.healthStatusOfVegetationVARIParamsSelector),
    changeHealthStatusOfVegetationVARIParams: (healthStatusOfVegetationVARIParams: HealthStatusOfVegetationParams) =>
      dispatch(uiSliceActions.changeHealthStatusOfVegetationVARIParams(healthStatusOfVegetationVARIParams)),
    mapContainerRef: useAppSelector(uiSliceSelectors.mapContainerRefSelector),
    changeMapContainerRef: (mapContainerRef: any) => dispatch(uiSliceActions.changeMapContainerRef(mapContainerRef)),
    selectedDataset: useAppSelector(uiSliceSelectors.selectedDatasetSelector),
    changeSelectedDataset: (selectedDataset: any) => dispatch(uiSliceActions.changeSelectedDataset(selectedDataset))
  };
};

export default useUI;
