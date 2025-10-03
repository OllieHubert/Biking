// Test script to verify the Harvey Mudd College route example
const { getExampleRoute } = require('./src/data/exampleRoutes');

// Test the Harvey Mudd College scenario
const harveyMuddLocation = {
  lat: 34.1064,
  lng: -117.7106
};

const testParams = {
  location: harveyMuddLocation,
  distance: 30,
  elevation: 5000,
  activity: 'biking'
};

console.log('Testing Harvey Mudd College route generation...');
console.log('Location:', harveyMuddLocation);
console.log('Parameters:', testParams);

const route = getExampleRoute(
  testParams.location,
  testParams.distance,
  testParams.elevation,
  testParams.activity
);

if (route) {
  console.log('\n✅ Route found!');
  console.log('Route name:', route.name);
  console.log('Distance:', route.distance, 'miles');
  console.log('Elevation:', route.elevation, 'feet');
  console.log('Waypoints:', route.waypoints.length);
  console.log('Description:', route.description);
  
  console.log('\nFirst few waypoints:');
  route.waypoints.slice(0, 3).forEach((wp, index) => {
    console.log(`${index + 1}. ${wp.name} (${wp.lat}, ${wp.lng})`);
  });
} else {
  console.log('\n❌ No route found for these parameters');
}

// Test alternative parameters
console.log('\n--- Testing alternative parameters ---');
const altRoute = getExampleRoute(harveyMuddLocation, 28, 3000, 'biking');
if (altRoute) {
  console.log('Alternative route found:', altRoute.name);
} else {
  console.log('No alternative route found');
}
