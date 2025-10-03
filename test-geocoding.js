// Test script to verify geocoding functionality
const GeocodingService = require('./src/services/GeocodingService.js').default;

async function testGeocoding() {
  console.log('🧪 Testing Geocoding Service...\n');

  // Test 1: Geocode Harvey Mudd College
  console.log('1. Testing Harvey Mudd College geocoding:');
  try {
    const result = await GeocodingService.geocodeLocation('Harvey Mudd College, Claremont, CA');
    console.log('✅ Success!');
    console.log('   Coordinates:', result.lat, result.lng);
    console.log('   Display Name:', result.displayName);
    console.log('   Address:', result.address);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n2. Testing coordinate validation:');
  const validCoords = GeocodingService.isValidCoordinates(34.1064, -117.7106);
  const invalidCoords = GeocodingService.isValidCoordinates(999, 999);
  console.log('   Valid coordinates (34.1064, -117.7106):', validCoords);
  console.log('   Invalid coordinates (999, 999):', invalidCoords);

  console.log('\n3. Testing distance calculation:');
  const distance = GeocodingService.calculateDistance(34.1064, -117.7106, 34.1200, -117.7200);
  console.log('   Distance between Harvey Mudd and nearby point:', distance.toFixed(2), 'miles');

  console.log('\n✅ Geocoding service test completed!');
}

testGeocoding().catch(console.error);
