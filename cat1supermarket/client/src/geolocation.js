// Service area counties with accurate coordinates (major city centers)
const SERVICE_COUNTIES = [
  { name: 'Nairobi', latitude: -1.2864, longitude: 36.8172 }, // Nairobi CBD
  { name: 'Mombasa', latitude: -4.0435, longitude: 39.6682 }, // Mombasa CBD
  { name: 'Kisumu', latitude: -0.1022, longitude: 34.7617 }, // Kisumu CBD
  { name: 'Nakuru', latitude: -0.3031, longitude: 36.0800 }, // Nakuru CBD
  { name: 'Eldoret', latitude: 0.5143, longitude: 35.2698 }   // Eldoret CBD
];

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Find nearest county based on coordinates
function findNearestCounty(userLat, userLon) {
  let nearestCounty = null;
  let minDistance = Infinity;

  SERVICE_COUNTIES.forEach(county => {
    const distance = calculateDistance(
      userLat, userLon,
      county.latitude, county.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCounty = county;
    }
  });

  return {
    county: nearestCounty,
    distance: minDistance
  };
}

// Geolocation service class
class GeolocationService {
  constructor() {
    this.lastKnownPosition = null;
    this.isTracking = false;
    this.watchId = null;
  }

  // Get current position with error handling
  async getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lastKnownPosition = position;
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location permission denied. Please enable location services.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred.'));
          }
        },
        { ...defaultOptions, ...options }
      );
    });
  }

  // Detect user's location and find nearest county
  async detectCounty() {
    try {
      const position = await this.getCurrentPosition();
      const { county, distance } = findNearestCounty(position.latitude, position.longitude);

      return {
        success: true,
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          county: county ? county.name : 'Unknown',
          distance: distance
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        location: null
      };
    }
  }

  // Start watching position (for continuous tracking)
  startWatch(callback, options = {}) {
    if (!navigator.geolocation) {
      callback(new Error('Geolocation is not supported'));
      return;
    }

    this.isTracking = true;
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.lastKnownPosition = position;
        callback(null, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        callback(error);
      },
      { ...defaultOptions, ...options }
    );
  }

  // Stop watching position
  stopWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  // Get all available counties
  getCounties() {
    return KENYA_COUNTIES.map(c => c.name);
  }

  // Check if a county is valid
  isValidCounty(countyName) {
    return KENYA_COUNTIES.some(c => c.name.toLowerCase() === countyName.toLowerCase());
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
export { SERVICE_COUNTIES as KENYA_COUNTIES, findNearestCounty };

