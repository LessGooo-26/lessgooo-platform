export const publicRoutes = {
  home: "/",
  services: "/services",
  faq: "/faq",
  about: "/about",
  programs: "/programs",
  kids: "/programs/kids",
  devopsCloudAi: "/programs/devops-cloud-ai",
  linux: "/programs/linux",
  webDevelopment: "/programs/web-development",
  iotArduino: "/programs/iot-arduino",
  modernSecretariat: "/programs/modern-secretariat",
  languages: "/programs/languages",
  partners: "/partners",
  contact: "/contact",
} as const;

export type PublicRouteId = keyof typeof publicRoutes;
export type PublicRoutePath = (typeof publicRoutes)[PublicRouteId];

export const primaryNavigationIds = [
  "home",
  "about",
  "programs",
  "services",
  "partners",
  "contact",
] as const satisfies readonly PublicRouteId[];

export const programRouteIds = [
  "kids",
  "devopsCloudAi",
  "linux",
  "webDevelopment",
  "iotArduino",
  "modernSecretariat",
  "languages",
] as const satisfies readonly PublicRouteId[];

export type ProgramRouteId = (typeof programRouteIds)[number];
