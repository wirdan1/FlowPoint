const fetch = require('node-fetch');

/**
 * Distance Calculator Service
 * @creator Hookrest - Danz
 * @version 1.0
 */

async function getCoordinates(city) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`;
    const response = await fetch(url, { 
      headers: { 
        'User-Agent': 'Node.js',
        'Accept-Language': 'en-US,en;q=0.9'
      } 
    });
    const data = await response.json();
    
    if (data.length === 0) {
      return {
        status: false,
        error: `City not found: ${city}`
      };
    }
    
    return {
      status: true,
      result: {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      }
    };
  } catch (error) {
    return {
      status: false,
      error: error.message
    };
  }
}

async function calculateDistance(cityA, cityB, unit = 'km') {
  try {
    // Get coordinates for both cities
    const coordA = await getCoordinates(cityA);
    const coordB = await getCoordinates(cityB);
    
    if (!coordA.status || !coordB.status) {
      return {
        status: false,
        error: coordA.error || coordB.error
      };
    }
    
    // Calculate haversine distance (straight line)
    const haversineDist = haversineDistance(
      coordA.result.lat, coordA.result.lon,
      coordB.result.lat, coordB.result.lon,
      unit
    );
    
    // Get driving distance
    const drivingDist = await getDrivingDistance(
      coordA.result.lat, coordA.result.lon,
      coordB.result.lat, coordB.result.lon,
      unit
    );
    
    // Estimate travel times
    const travelTimes = estimateTravelTimes(haversineDist, drivingDist, unit);
    
    return {
      status: true,
      creator: "Hookrest - Danz",
      result: {
        cities: {
          origin: coordA.result.display_name,
          destination: coordB.result.display_name
        },
        distances: {
          straight: haversineDist.toFixed(2),
          driving: drivingDist ? drivingDist.toFixed(2) : null,
          unit: unit
        },
        travel_times: travelTimes
      }
    };
    
  } catch (error) {
    return {
      status: false,
      creator: "Hookrest - Danz",
      error: error.message
    };
  }
}

// Helper functions (keep the same implementations)
function haversineDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = unit === 'km' ? 6371 : 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getDrivingDistance(startLat, startLon, endLat, endLon, unit = 'km') {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    return data.routes?.[0]?.distance ? 
      (unit === 'km' ? data.routes[0].distance / 1000 : data.routes[0].distance / 1609.34) : 
      null;
  } catch {
    return null;
  }
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}j ${mins}m`;
}

function estimateTravelTimes(crowFlies, drivingDistance, unit = 'km') {
  const speeds = {
    motorcycle: unit === 'km' ? 40 : 24.85,
    car: unit === 'km' ? 80 : 49.71,
    bus: unit === 'km' ? 50 : 31.07,
    train: unit === 'km' ? 100 : 62.14,
    plane: unit === 'km' ? 800 : 497.10
  };
  
  const result = {};
  for (const [vehicle, speed] of Object.entries(speeds)) {
    const distance = vehicle === 'plane' ? crowFlies : drivingDistance;
    result[vehicle] = distance ? 
      formatTime((distance / speed) * 60) : 
      'N/A';
  }
  
  return result;
}

module.exports = calculateDistance;
