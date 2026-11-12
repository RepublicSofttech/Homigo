import { createContext, useContext, useState } from "react";

const KEY = "hs_location";
export const CITIES = [
  { name: "New Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || CITIES[0];
  } catch {
    return CITIES[0];
  }
}

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLoc] = useState(load);
  const setLocation = (loc) => {
    setLoc(loc);
    try {
      localStorage.setItem(KEY, JSON.stringify(loc));
    } catch {
      /* ignore */
    }
  };
  const detect = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Location not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { name: "Current location", lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
          setLocation(loc);
          resolve(loc);
        },
        () => reject(new Error("Location permission denied")),
        { timeout: 10000 }
      );
    });
  return <LocationContext.Provider value={{ location, setLocation, detect }}>{children}</LocationContext.Provider>;
}

export const useLocation2 = () => useContext(LocationContext);
