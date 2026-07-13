import { useEffect, useRef, useState } from "react";
import { isGoogleMapsConfigured, loadGoogleMaps } from "../lib/googleMaps";

const SEONGSU_CENTER = { lat: 37.5446, lng: 127.0559 };
const REGION_CENTERS = {
  성수: SEONGSU_CENTER,
  홍대: { lat: 37.5563, lng: 126.9236 },
  "홍대/연남": { lat: 37.5612, lng: 126.9252 },
  "합정/망원": { lat: 37.5513, lng: 126.913 },
};

function positionFor(place, index) {
  if (Number.isFinite(place.latitude) && Number.isFinite(place.longitude)) {
    return { lat: place.latitude, lng: place.longitude };
  }

  const center = REGION_CENTERS[place.region] || SEONGSU_CENTER;
  const angle = (index * 137.5 * Math.PI) / 180;
  const distance = 0.0025 + (index % 4) * 0.0012;
  return {
    lat: center.lat + Math.sin(angle) * distance,
    lng: center.lng + Math.cos(angle) * distance,
  };
}

export default function GoogleMap({ places = [], showRoute = false, height = "100%", minHeight = 320, onPlaceSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const [error, setError] = useState("");

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    if (!isGoogleMapsConfigured) return undefined;

    let active = true;

    loadGoogleMaps()
      .then((maps) => {
        if (!active || !containerRef.current) return;

        mapRef.current = new maps.Map(containerRef.current, {
          center: SEONGSU_CENTER,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        const bounds = new maps.LatLngBounds();
        const infoWindow = new maps.InfoWindow();
        const path = places.map(positionFor);

        places.forEach((place, index) => {
          const position = path[index];
          const marker = new maps.Marker({
            map: mapRef.current,
            position,
            title: place.name,
            label: showRoute ? { text: String(index + 1), color: "#ffffff", fontWeight: "700" } : undefined,
          });

          marker.addListener("click", () => {
            if (onPlaceSelectRef.current) {
              onPlaceSelectRef.current(place);
              return;
            }
            const content = document.createElement("div");
            const title = document.createElement("strong");
            const detail = document.createElement("div");
            title.textContent = place.name;
            detail.textContent = [place.category, place.region].filter(Boolean).join(" · ");
            detail.style.cssText = "margin-top:4px;color:#6F6762;font-size:12px";
            content.append(title, detail);
            infoWindow.setContent(content);
            infoWindow.open({ map: mapRef.current, anchor: marker });
          });
          bounds.extend(position);
        });

        if (showRoute && path.length > 1) {
          new maps.Polyline({
            map: mapRef.current,
            path,
            strokeColor: "#FF7A5C",
            strokeOpacity: 0.9,
            strokeWeight: 4,
          });
        }

        if (places.length === 1) {
          mapRef.current.setCenter(path[0]);
          mapRef.current.setZoom(15);
        } else if (places.length > 1) {
          mapRef.current.fitBounds(bounds, 42);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => {
      active = false;
      if (mapRef.current && window.google?.maps) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
      }
      mapRef.current = null;
    };
  }, [height, minHeight, places, showRoute]);

  if (!isGoogleMapsConfigured) {
    return (
      <div style={messageStyle}>
        <strong>Google Maps API 키가 필요해요.</strong>
        <span>.env.local에 VITE_GOOGLE_MAPS_API_KEY를 추가한 뒤 개발 서버를 다시 시작해 주세요.</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={messageStyle}>
        <strong>지도를 불러오지 못했어요.</strong>
        <span>{error} API 키의 웹사이트 제한과 Maps JavaScript API 활성화 여부를 확인해 주세요.</span>
      </div>
    );
  }

  return <div ref={containerRef} aria-label="더미 장소 Google 지도" style={{ width: "100%", height, minHeight }} />;
}

const messageStyle = {
  width: "100%",
  minHeight: 320,
  padding: 28,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  textAlign: "center",
  color: "#6F6762",
  background: "#FFF3EC",
  fontSize: 12,
  lineHeight: 1.6,
};
