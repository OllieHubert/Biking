// Test script to verify the new routing service with actual street routes
const RouteService = require('./src/services/RouteService.js').default;

async function testRouting() {
  console.log('🧪 Testing New Routing Service...\n');

  // Test 1: Real route between two points
  console.log('1. Testing real route generation:');
  try {
    const startLocation = {
      lat: 34.1064,
      lng: -117.7106,
      displayName: 'Harvey Mudd College, Claremont, CA'
    };
    
    const endLocation = {
      lat: 34.0522,
      lng: -118.2437,
      displayName: 'Los Angeles, CA'
    };

    const route = await RouteService.generateRoute({
      activity: 'biking',
      distance: 50,
      elevation: 1000,
      startLocation: startLocation,
      endLocation: endLocation
    });

    if (route) {
      console.log('✅ Route generated successfully!');
      console.log('   Route name:', route.name);
      console.log('   Actual distance:', route.distance.toFixed(2), 'km');
      console.log('   Actual elevation:', route.elevation.toFixed(0), 'm');
      console.log('   Is real route:', route.isRealRoute);
      console.log('   Waypoints:', route.waypoints ? route.waypoints.length : 'None');
      
      if (route.routeData) {
        console.log('   Route data available:', !!route.routeData);
        console.log('   Instructions:', route.routeData.instructions ? route.routeData.instructions.length : 0);
      }
    } else {
      console.log('❌ No route generated');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n2. Testing loop route generation:');
  try {
    const startLocation = {
      lat: 34.1064,
      lng: -117.7106,
      displayName: 'Harvey Mudd College, Claremont, CA'
    };

    const route = await RouteService.generateRoute({
      activity: 'biking',
      distance: 30,
      elevation: 500,
      startLocation: startLocation
    });

    if (route) {
      console.log('✅ Loop route generated successfully!');
      console.log('   Route name:', route.name);
      console.log('   Actual distance:', route.distance.toFixed(2), 'km');
      console.log('   Actual elevation:', route.elevation.toFixed(0), 'm');
      console.log('   Is real route:', route.isRealRoute);
    } else {
      console.log('❌ No loop route generated');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n✅ Routing service test completed!');
}

testRouting().catch(console.error);
