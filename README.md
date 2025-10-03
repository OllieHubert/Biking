# 🚴‍♂️ Biking Route Generator

A mobile and web application that generates personalized biking and running routes based on your location, desired distance, and elevation preferences.

## Features

- **Location-based routing**: Uses your current location or a custom starting point
- **Distance & elevation targeting**: Specify exact distance and elevation gain preferences
- **Activity type selection**: Choose between biking and running routes
- **Interactive maps**: View routes on OpenStreetMap with turn-by-turn directions
- **Alternative suggestions**: When exact matches aren't found, suggests closest alternatives
- **Responsive design**: Works on both mobile and desktop devices

## Example Usage

If you're at Harvey Mudd College and want a 30-mile bike ride with 5,000 feet of climbing, the app will suggest routes like:
- Taking Mills Road onto Baldy Road
- Biking to the ski lifts
- Descending from there

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- For mobile development: Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd biking-route-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create .env file
REACT_APP_OPEN_ELEVATION_API_KEY=your_api_key_here
REACT_APP_OPEN_ROUTE_API_KEY=your_api_key_here
```

### Running the Application

#### Web Version
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### Mobile Version
```bash
npm run mobile
```
This will start the Expo development server for mobile testing.

### Building for Production

```bash
npm run build
```

## Technology Stack

- **Frontend**: React, React Router, Material-UI
- **Maps**: Leaflet, React-Leaflet, OpenStreetMap
- **Mobile**: React Native, Expo
- **Routing**: Custom algorithm with elevation data integration
- **Styling**: Material-UI, CSS3

## API Integration

The app integrates with several APIs for enhanced functionality:

- **OpenStreetMap**: For map tiles and basic routing
- **Open-Elevation API**: For elevation data
- **OpenRouteService**: For advanced routing (optional)

## Route Generation Algorithm

1. **Location Analysis**: Determines starting point and surrounding area
2. **Elevation Mapping**: Fetches elevation data for the region
3. **Route Generation**: Creates multiple possible routes based on:
   - Distance preferences
   - Elevation gain targets
   - Terrain suitability
4. **Scoring & Ranking**: Ranks routes by how well they match your criteria
5. **Alternative Suggestions**: If no perfect match, suggests closest alternatives

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Integration with popular fitness apps (Strava, Garmin)
- [ ] Weather-based route suggestions
- [ ] Social features (share routes, rate routes)
- [ ] Offline map support
- [ ] Advanced elevation profiles
- [ ] Route difficulty ratings
- [ ] Points of interest along routes

## Support

For support, email support@bikingroutes.com or create an issue in the repository.
