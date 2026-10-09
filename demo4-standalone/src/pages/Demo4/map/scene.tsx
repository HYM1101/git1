import { Suspense } from "react";
import Cloud from "./cloud";
import Base from "./base";
import Bottom from "./bottom";
import type { CityGeoJSON } from "@/types/map";

import bsMapData from "@/assets/bs_data.json";
import bsOutlineData from "@/assets/bs_outline_data.json";

const mapData = bsMapData as CityGeoJSON,
  outlineData = bsOutlineData as CityGeoJSON;

export default function Scene() {
  return (
    <Suspense fallback={null}>
      <Cloud />

      <Base data={mapData} outlineData={outlineData} />

      <Bottom />
    </Suspense>
  );
}
