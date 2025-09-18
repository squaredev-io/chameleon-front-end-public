import { useEffect, useRef, useState } from "react";
import { CameraFlyToBoundingSphere, Cesium3DTileset as Resium3DTileset, Viewer as ResiumViewer } from "resium";
import { Cesium3DTileset, Cesium3DTileStyle, Ion, IonResource } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// Your access token can be found at: https://ion.cesium.com/tokens.
// This is the default access token from your ion account
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZTUzODQwMS1iOWYyLTQ5M2MtOTZlOS0yZmEyMjE2ODMyOTUiLCJpZCI6MTcxNjk4LCJpYXQiOjE2OTcxOTgzMzh9.rBsS4BCTkjmQ7yJK8GlAF16-hwVLTMDApJRIU_PD1RQ";

export default function Cesium() {
  const viewerRef = useRef(null);
  const [tileset, setTileset] = useState<Cesium3DTileset>();

  const handleViewerCreated = (viewer: any) => {
    viewerRef.current = viewer; // Set the viewer reference when created
  };

  useEffect(() => {
    const loadTileset = async () => {
      try {
        // Load the tileset from Cesium Ion
        const tileset = await Cesium3DTileset.fromIonAssetId(2312098);
        setTileset(tileset);
      } catch (error) {
        console.error("Error loading tileset:", error);
      }
    };

    loadTileset();
  }, []);

  useEffect(() => {
    if (tileset && viewerRef.current) {
      // @ts-expect-error Unresolved variable cesiumElement
      const cesiumViewer = viewerRef.current?.cesiumElement;

      // Add the tileset to the Cesium viewer
      cesiumViewer.scene.primitives.add(tileset);

      // Apply the default style if it exists
      const extras = tileset.asset.extras;
      if (extras?.ion?.defaultStyle) {
        tileset.style = new Cesium3DTileStyle(extras.ion.defaultStyle);
      }
    }
  }, [tileset, viewerRef.current]);

  return tileset ? (
    // @ts-expect-error Type error
    <ResiumViewer full onViewerCreated={handleViewerCreated}>
      <Resium3DTileset
        url={IonResource.fromAssetId(2312098)}
      />
      <CameraFlyToBoundingSphere
        boundingSphere={tileset.boundingSphere}
        duration={5}
      />
    </ResiumViewer>
  ) : null;
}