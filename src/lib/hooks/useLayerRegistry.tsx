import { useAppDispatch, useAppSelector } from "@/lib/hooks/index";
import {
  layerRegistryActions,
  layerRegistrySelectors,
  resetAllLayersAsync,
  toggleLayerAsync
} from "@/lib/store/layerRegistrySlice";

export const useLayerRegistry = () => {
  const dispatch = useAppDispatch();
  const resetLayerRegistry = () => dispatch(layerRegistryActions.resetLayerRegistry());
  const layers = useAppSelector(layerRegistrySelectors.layersSelector);
  const activeLayers = useAppSelector(layerRegistrySelectors.activeLayersSelector);

  const getLayerByName = (layerName: string) => layers.find(layer => layer.layerName === layerName);

  const registerLayer = (layerName: string) =>
    dispatch(layerRegistryActions.registerLayer({ layerName }));

  const resetAllLayers = () =>
    dispatch(layerRegistryActions.resetAllLayers());

  const updateLayerStatus = (layerName: string, isActive: boolean) =>
    dispatch(layerRegistryActions.updateLayerStatus({ layerName, isActive }));


  const resetAllLayersAndWait = async () => {
    // @ts-ignore
    const resultAction = await dispatch(resetAllLayersAsync());

    if (resetAllLayersAsync.fulfilled.match(resultAction)) {
      return resultAction.payload;
    }

    return layers;
  };

  const toggleLayerAndWait = async (layerName: string) => {
    // @ts-ignore
    const resultAction = await dispatch(toggleLayerAsync(layerName));

    if (toggleLayerAsync.fulfilled.match(resultAction)) {
      return resultAction.payload;
    }

    return { layerName, layer: layers[layerName] };
  };

  return {
    layers,
    activeLayers,
    registerLayer,
    getLayerByName,
    resetAllLayers,
    updateLayerStatus,
    resetAllLayersAndWait,
    toggleLayerAndWait,
    resetLayerRegistry
  };
};
