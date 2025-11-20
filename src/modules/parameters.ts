export interface Params {
  rotation: number;
  azimuth: number;
  altitude: number;
  shadowNear: number;
  shadowFar: number;
  shadowLeft: number;
  shadowRight: number;
  shadowTop: number;
  shadowBottom: number;
  shadowMapSize: number;
  showShadowHelper: boolean;
  showModel: boolean;
}

export const params: Params = {
  rotation: 0,
  azimuth: 0,
  altitude: 0,
  shadowNear: -50,
  shadowFar: 50,
  shadowLeft: -50,
  shadowRight: 50,
  shadowTop: 50,
  shadowBottom: -50,
  shadowMapSize: 4096,
  showShadowHelper: false,
  showModel: true,
};
