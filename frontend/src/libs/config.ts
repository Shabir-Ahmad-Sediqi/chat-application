const fallbackApiBase =
  import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";
const fallbackWsBase =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || fallbackApiBase;
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL as string) || fallbackWsBase;
export const ASSET_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL as string) || "";

export const resolveAssetUrl = (input?: string) => {
  if (!input) return "";
  if (/^(blob:|data:|https?:)/i.test(input)) return input;
  if (ASSET_BASE_URL) {
    try {
      return new URL(input, ASSET_BASE_URL).toString();
    } catch {
      return input;
    }
  }
  return input;
};
