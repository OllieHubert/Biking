// Setup script to ensure environment variables are properly configured
const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const envContent = envExample
      .replace('NEWS_API_KEY= 6e95472e48094d4b9975767540eb53fb', 'REACT_APP_NEWS_API_KEY=6e95472e48094d4b9975767540eb53fb')
      .replace('# News app API Key', '# News API Key for React App');
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
  } else {
    // Create basic .env file
    const basicEnv = `# News API Key for React App
REACT_APP_NEWS_API_KEY=6e95472e48094d4b9975767540eb53fb

# Other API Keys (optional)
REACT_APP_OPEN_ELEVATION_API_KEY=your_open_elevation_api_key_here
REACT_APP_OPEN_ROUTE_API_KEY=your_open_route_service_api_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created successfully');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('Environment setup complete!');
console.log('API Key configured:', process.env.REACT_APP_NEWS_API_KEY ? 'Yes' : 'No');
