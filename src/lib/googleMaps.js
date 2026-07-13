const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

let googleMapsPromise;

export const isGoogleMapsConfigured = Boolean(apiKey);

export function loadGoogleMaps() {
  if (!isGoogleMapsConfigured) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const callbackName = "__wispotGoogleMapsReady";
      const script = document.createElement("script");

      window[callbackName] = () => {
        delete window[callbackName];
        resolve(window.google.maps);
      };

      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=${callbackName}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        delete window[callbackName];
        googleMapsPromise = undefined;
        reject(new Error("Google Maps 스크립트를 불러오지 못했습니다."));
      };
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}
