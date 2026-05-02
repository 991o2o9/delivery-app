import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  center: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px',
};

const KYRGYZSTAN_BOUNDS = {
  north: 43.5,
  south: 39.0,
  west: 69.0,
  east: 80.5,
};

const LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];

export const MapPicker = ({
  onLocationSelect,
  center,
  zoom = 14,
}: MapPickerProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        onLocationSelectRef.current(lat, lng, results[0].formatted_address);
      } else {
        onLocationSelectRef.current(lat, lng);
      }
    });
  }, []);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (!isLoaded || !map) return;

    const { AdvancedMarkerElement, PinElement } = google.maps.marker as any;

    if (markerRef.current) return; // уже создан

    const pin = new PinElement({
      background: '#3b82f6',
      borderColor: '#1d4ed8',
      glyphColor: 'white',
    });

    markerRef.current = new AdvancedMarkerElement({
      map,
      position: center,
      content: pin.element,
      gmpDraggable: true,
    });

    markerRef.current.addListener('dragend', () => {
      const pos = markerRef.current.position;
      if (pos) {
        reverseGeocode(
          typeof pos.lat === 'function' ? pos.lat() : pos.lat,
          typeof pos.lng === 'function' ? pos.lng() : pos.lng,
        );
      }
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [isLoaded, map]); // center намеренно убран отсюда

  useEffect(() => {
    if (markerRef.current && center) {
      markerRef.current.position = center;
    }
  }, [center]);

  const onClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        }

        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode],
  );

  if (!isLoaded) {
    return (
      <div className='animate-pulse bg-gray-200 h-[250px] rounded-lg flex items-center justify-center'>
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
      onLoad={onLoad}
      options={{
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        restriction: {
          latLngBounds: KYRGYZSTAN_BOUNDS,
          strictBounds: false,
        },
        streetViewControl: false,
        mapTypeControl: false,
      }}
    />
  );
};
