import { useEffect } from "react";
import useMapContext from "@/components/Map/useMapContext";
import useLeafletWindow from "@/components/Map/useLeafletWindow";
import useUI from "@/lib/hooks/useUI";

const usePrepareMap = (tileInfo) => {
  const { map } = useMapContext();
  const leafletWindow = useLeafletWindow();
  const { changeLayerZoomLevels } = useUI();

  useEffect(() => {
    if (tileInfo) {
      if (!tileInfo.bounds || !leafletWindow || !map) {
        return;
      }

      if (!map.invalidateSize()) {
        return;
      }

      changeLayerZoomLevels({ minZoom: tileInfo.minZoom, maxZoom: tileInfo.maxZoom });

      map.setMinZoom(tileInfo.minZoom);
      map.setMaxZoom(tileInfo.maxZoom);

      const [lng, lat, zoom] = tileInfo.center;
      map.flyTo([lat, lng], zoom, { duration: 2 });
    }
  }, [tileInfo]);

  return;
};

export default usePrepareMap;
