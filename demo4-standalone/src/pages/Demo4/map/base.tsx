import { use, useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import {
  Box2,
  LineSegments,
  Mesh,
  RepeatWrapping,
  Vector2,
  type Group,
} from "three";
import { geoMercator } from "d3-geo";
import type { CityGeoJSON } from "@/types/map";
import City, { type CityProps } from "./city";
import loadTexture from "../helpers/loadTexture";
import { useConfigStore } from "../stores";

import map from "@/assets/bs_map.png";
import normalMap from "@/assets/bs_map.png";

export interface BaseProps {
  depth?: number;
  data: CityGeoJSON;
  outlineData?: CityGeoJSON;
}

const textures = Promise.all([
  loadTexture(map, (tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
  }),
  loadTexture(normalMap, (tex) => {
    tex.wrapS = tex.wrapT = RepeatWrapping;
  }),
]);

export default function Base(props: BaseProps) {
  const { data, outlineData, depth = 6 } = props;
  const groupRef = useRef<Group>(null!);
  const camera = useThree((state) => state.camera);

  const [texture1, texture2] = use(textures);

  const projection = useMemo(() => {
    const centerCoord =
      outlineData?.features[0]?.properties?.centroid ??
      data.features[0].properties.centroid;
    return geoMercator()
      .center(centerCoord)
      .scale(4000)
      .translate([0, 0]);
  }, [data, outlineData]);

  const { regions, bbox, center } = useMemo(() => {
    const regions: CityProps["data"][] = [];
    const bbox = new Box2();

    const toV2 = (coord: number[]) => {
      const [x, y] = projection(coord as [number, number])!;
      const projected = new Vector2(x, -y);
      bbox.expandByPoint(projected);
      return projected;
    };

    data.features.forEach((feature) => {
      const points = feature.geometry.coordinates.reduce<Vector2[][]>(
        (pre, cur) => [
          ...pre,
          ...cur.map<Vector2[]>((coordinates) => coordinates.map(toV2)),
        ],
        []
      );

      const [x, y] = projection(
        feature.properties.centroid ?? feature.properties.center
      )!;

      regions.push({
        city: feature.properties.name,
        cityId: [x, -y, depth + 0.1],
        points,
      });
    });

    const center = bbox.getCenter(new Vector2());

    return {
      regions,
      bbox,
      center,
    };
  }, [projection, data, depth]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const tl = gsap.timeline({
      onComplete: () => {
        useConfigStore.setState({ mapPlayComplete: true });
      },
    });

    tl.to(camera.position, {
      x: 0,
      y: 120,
      z: 200,
      duration: 2,
      ease: "circ.out",
    });
    tl.to(
      groupRef.current.scale,
      { x: 1, y: 1, z: 1, duration: 1, ease: "circ.out" },
      2
    );
    groupRef.current.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        tl.to(obj.material, { opacity: 1, duration: 1, ease: "circ.out" }, 2);
      }
    });

    return () => {
      tl.kill();
    };
  }, [camera]);

  return (
    <group
      ref={groupRef}
      rotation={[-Math.PI / 2, 0, 0]}
      scale-z={0.01}
      position={[-center.x, 0, center.y]}>
      {regions.map((region, idx) => (
        <City
          key={idx}
          depth={depth}
          bbox={bbox}
          data={region}
          map={texture1}
          normalMap={texture2}
        />
      ))}
    </group>
  );
}
