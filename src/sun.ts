import * as THREE from "three";

export function updateSunPosition(azimuth: number, altitude: number, distance: number): THREE.Vector3 {
  const theta = (azimuth * Math.PI) / 180;
  const phi = (altitude * Math.PI) / 180;
  return new THREE.Vector3(distance * Math.cos(phi) * Math.cos(theta), distance * Math.sin(phi), distance * Math.cos(phi) * Math.sin(theta));
}

export function computeAnglesFromPosition(position: THREE.Vector3): { azimuth: number; altitude: number } {
  const { x, y, z } = position;
  const horizontalDist = Math.sqrt(x ** 2 + z ** 2);
  const altitudeRad = Math.atan2(y, horizontalDist);
  let azimuthRad = Math.atan2(z, x);
  if (azimuthRad < 0) azimuthRad += 2 * Math.PI;
  return {
    altitude: (altitudeRad * 180) / Math.PI,
    azimuth: (azimuthRad * 180) / Math.PI,
  };
}
