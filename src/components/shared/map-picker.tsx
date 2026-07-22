'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/next
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

function LocationMarker({ latitude, longitude, onLocationChange }: { latitude: number; longitude: number; onLocationChange: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker | null>(null);

  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      ref={markerRef}
      position={[latitude, longitude]}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

function MapCenterUpdater({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: latitude, lng: longitude });

  useEffect(() => {
    const prev = prevRef.current;
    if (prev.lat !== latitude || prev.lng !== longitude) {
      map.setView([latitude, longitude], map.getZoom());
      prevRef.current = { lat: latitude, lng: longitude };
    }
  }, [latitude, longitude, map]);

  return null;
}

function LocateButton({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trình duyệt truy cập vị trí trong cài đặt.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Không thể xác định vị trí. Vui lòng thử lại hoặc kéo marker để chọn vị trí thủ công.');
            break;
          case error.TIMEOUT:
            alert('Yêu cầu định vị bị quá thời gian. Vui lòng thử lại.');
            break;
          default:
            alert('Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.');
        }
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={locating}
      className="absolute top-2 right-2 z-[1000] px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg shadow-soft text-text-primary hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
    >
      {locating ? (
        <span className="inline-block w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      )}
      {locating ? 'Đang định vị...' : 'Định vị'}
    </button>
  );
}

export function MapPicker({ latitude, longitude, onLocationChange, className }: MapPickerProps) {
  return (
    <div className={className + ' relative'}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="w-full h-48 rounded-lg border border-border z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />
        <MapCenterUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>
      <LocateButton onLocationChange={onLocationChange} />
      <p className="text-xs text-text-muted mt-1">Click hoặc kéo marker để chọn vị trí</p>
    </div>
  );
}