// Test script to verify autocomplete functionality
const GeocodingService = require('./src/services/GeocodingService.js').default;

async function testAutocomplete() {
  console.log('🧪 Testing Autocomplete Functionality...\n');

  // Test 1: Harvey Mudd College suggestions
  console.log('1. Testing "Harvey Mudd" suggestions:');
  try {
    const suggestions = await GeocodingService.getLocationSuggestions('Harvey Mudd', 5);
    console.log(`✅ Found ${suggestions.length} suggestions:`);
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion.displayName}`);
      console.log(`      Coordinates: ${suggestion.lat}, ${suggestion.lng}`);
      console.log(`      Type: ${suggestion.type}`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n2. Testing "Los Angeles" suggestions:');
  try {
    const suggestions = await GeocodingService.getLocationSuggestions('Los Angeles', 3);
    console.log(`✅ Found ${suggestions.length} suggestions:`);
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion.displayName}`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n3. Testing short query (should return empty):');
  try {
    const suggestions = await GeocodingService.getLocationSuggestions('L', 5);
    console.log(`✅ Short query returned ${suggestions.length} suggestions (expected 0)`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n✅ Autocomplete test completed!');
}

testAutocomplete().catch(console.error);
