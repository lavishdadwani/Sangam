import userAPI from "./user/user";

const LOCATION_STORAGE_KEY = "user_location";
const DEBOUNCE_DELAY = 3000; // 3 seconds - update DB only if user hasn't changed location for 3 seconds

let debounceTimer = null;
let pendingUpdate = null;

/**
 * Save location to localStorage
 */
export const saveLocationToStorage = (locationData) => {
  try {
    const dataToStore = {
      lat: locationData.lat,
      lng: locationData.lng,
      address: locationData.address || null,
      city: locationData.city || null,
      state: locationData.state || null,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (err) {
    console.error("Failed to save location to localStorage:", err);
  }
};

/**
 * Get location from localStorage
 */
export const getLocationFromStorage = () => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      const locationData = JSON.parse(stored);
      if (locationData.lat !== 0 && locationData.lng !== 0) {
        return locationData;
      }
    }
  } catch (err) {
    console.error("Failed to get location from localStorage:", err);
  }
  return null;
};

/**
 * Clear location from localStorage
 */
export const clearLocationFromStorage = () => {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear location from localStorage:", err);
  }
};

/**
 * Update location in database (debounced)
 * This will only update DB after user stops changing location for DEBOUNCE_DELAY ms
 */
export const updateLocationInDB = async (locationData, immediate = false) => {

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  // store latest location data
  pendingUpdate = {
    lat: locationData.lat,
    lng: locationData.lng,
    address: locationData.address,
    city: locationData.city,
    state: locationData.state,
  };

  // If immediate (critical action), update DB right away
  if (immediate) {
    return await syncLocationToDB(pendingUpdate);
  }

  // Otherwise, debounce the update
  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      if (pendingUpdate) {
        await syncLocationToDB(pendingUpdate);
        pendingUpdate = null;
      }
      resolve();
    }, DEBOUNCE_DELAY);
  });
};

/**
 * Sync location to database (internal function)
 */
const syncLocationToDB = async (locationData) => {
  try {
    const updateData = {
      lat: locationData.lat,
      lng: locationData.lng,
    };

    if (locationData.address && locationData.address !== "") {
      updateData.address = locationData.address;
    }
    if (locationData.city && locationData.city !== "") {
      updateData.city = locationData.city;
    }
    if (locationData.state && locationData.state !== "") {
      updateData.state = locationData.state;
    }

    const result = await userAPI.updateLocation(updateData);
    return result;
  } catch (err) {
    console.error("Failed to sync location to DB:", err);
    throw err;
  }
};

/**
 * Force immediate sync to database (for critical actions like checkout)
 */
export const forceSyncLocationToDB = async (locationData) => {
  // Clear any pending debounced updates
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingUpdate = null;

  // Update immediately
  return await syncLocationToDB(locationData);
};

/**
 * Initialize location from storage or userData
 * Priority: localStorage > userData > default
 */
export const initializeLocation = (userData) => {
  // First, try to get from localStorage
  const storedLocation = getLocationFromStorage();
  if (storedLocation) {
    return storedLocation;
  }

  // Fallback to userData from DB
  if (userData?.location?.coordinates) {
    const [lng, lat] = userData.location.coordinates;
    if (lat !== 0 && lng !== 0) {
      return {
        lat,
        lng,
        address: userData.location.address || null,
        city: userData.location.city || null,
        state: userData.location.state || null,
      };
    }
  }

  return null;
};

