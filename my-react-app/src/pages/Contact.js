import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 26.8467,
  lng: 80.9462
}; // Lucknow coordinates

const locations = [
  { name: "Lucknow Marbles Qaisar Bagh", lat: 26.848751, lng: 80.932337 },
  { name: "Lucknow Marbles Vijyant Khand", lat:26.871335, lng:81.025691 },
  { name: "Lucknow Marbles Tiwariganj", lat: 26.891512, lng: 81.065252 }
];

function Contact() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCsNh45zRUdhDiJTYblG4vw5gAtWlbTf_4",
    libraries: ["places"]
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach((location) => {
      bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
    });
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  useEffect(() => {
    if (map) {
      const newMarkers = locations.map((location) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name,
        });

        marker.addListener('click', () => {
          console.log('Marker clicked:', location);
          setSelectedLocation(location);
          if (map) {
            map.setCenter({ lat: location.lat, lng: location.lng });
            map.setZoom(18.5); // Adjust the zoom level as needed
          }
        });

        return marker;
      });
    }
  }, [map]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form>
        {/* Your existing form code */}
      </form>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
            onClick={() => {
              console.log('Marker onClick triggered');
              setSelectedLocation(location);
              if (map) {
                map.setCenter({ lat: location.lat, lng: location.lng });
                map.setZoom(15); // Adjust the zoom level as needed
              }
            }}
          />
        ))}
        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <div>
              <h2>{selectedLocation.name}</h2>
              <p>{selectedLocation.vicinity}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default Contact;