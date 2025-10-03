// Example routes for testing and demonstration
export const harveyMuddRoutes = {
  // 30-mile bike ride with 5,000 feet of climbing
  baldyRoadRoute: {
    id: 'baldy_road_route',
    name: 'Baldy Road Climb',
    activity: 'biking',
    distance: 30.2,
    elevation: 5200,
    waypoints: [
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' },
      { lat: 34.1200, lng: -117.7200, name: 'Mills Road' },
      { lat: 34.1500, lng: -117.7500, name: 'Baldy Road Start' },
      { lat: 34.2000, lng: -117.8000, name: 'Baldy Road Mid' },
      { lat: 34.2500, lng: -117.8500, name: 'Ski Lifts' },
      { lat: 34.2000, lng: -117.8000, name: 'Descent Start' },
      { lat: 34.1500, lng: -117.7500, name: 'Baldy Road End' },
      { lat: 34.1200, lng: -117.7200, name: 'Mills Road Return' },
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' }
    ],
    description: 'A challenging climb up Baldy Road to the ski lifts with a thrilling descent. Perfect for cyclists seeking significant elevation gain.',
    difficulty: 'Hard',
    estimatedTime: '3-4 hours',
    directions: [
      {
        instruction: 'Start at Harvey Mudd College',
        distance: 0,
        duration: 0
      },
      {
        instruction: 'Head north on Mills Road',
        distance: 2.5,
        duration: 10
      },
      {
        instruction: 'Turn right onto Baldy Road',
        distance: 5.0,
        duration: 20
      },
      {
        instruction: 'Begin the climb - steady 6-8% grade',
        distance: 8.0,
        duration: 45
      },
      {
        instruction: 'Continue climbing - steeper sections ahead',
        distance: 12.0,
        duration: 75
      },
      {
        instruction: 'Reach the ski lifts - take a break!',
        distance: 15.1,
        duration: 120
      },
      {
        instruction: 'Begin descent - be careful on the way down',
        distance: 18.0,
        duration: 150
      },
      {
        instruction: 'Continue descending on Baldy Road',
        distance: 22.0,
        duration: 180
      },
      {
        instruction: 'Turn left back onto Mills Road',
        distance: 25.0,
        duration: 200
      },
      {
        instruction: 'Return to Harvey Mudd College',
        distance: 30.2,
        duration: 220
      }
    ]
  },

  // Alternative route with less elevation
  claremontHillsRoute: {
    id: 'claremont_hills_route',
    name: 'Claremont Hills Loop',
    activity: 'biking',
    distance: 28.5,
    elevation: 3200,
    waypoints: [
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' },
      { lat: 34.1200, lng: -117.7000, name: 'Claremont Hills' },
      { lat: 34.1400, lng: -117.6800, name: 'Pomona Hills' },
      { lat: 34.1600, lng: -117.6600, name: 'San Antonio Heights' },
      { lat: 34.1800, lng: -117.6400, name: 'Upland Hills' },
      { lat: 34.1600, lng: -117.6600, name: 'Return via San Antonio' },
      { lat: 34.1400, lng: -117.6800, name: 'Pomona Hills Return' },
      { lat: 34.1200, lng: -117.7000, name: 'Claremont Hills Return' },
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' }
    ],
    description: 'A scenic loop through the Claremont Hills with moderate elevation gain and beautiful views.',
    difficulty: 'Medium',
    estimatedTime: '2.5-3 hours',
    directions: [
      {
        instruction: 'Start at Harvey Mudd College',
        distance: 0,
        duration: 0
      },
      {
        instruction: 'Head east toward Claremont Hills',
        distance: 3.0,
        duration: 15
      },
      {
        instruction: 'Begin gradual climb through residential areas',
        distance: 6.0,
        duration: 30
      },
      {
        instruction: 'Continue through Pomona Hills',
        distance: 10.0,
        duration: 50
      },
      {
        instruction: 'Climb to San Antonio Heights',
        distance: 14.0,
        duration: 75
      },
      {
        instruction: 'Reach Upland Hills - highest point',
        distance: 18.0,
        duration: 100
      },
      {
        instruction: 'Begin return journey',
        distance: 22.0,
        duration: 125
      },
      {
        instruction: 'Descend through Pomona Hills',
        distance: 26.0,
        duration: 150
      },
      {
        instruction: 'Return to Harvey Mudd College',
        distance: 28.5,
        duration: 170
      }
    ]
  }
};

// Running routes
export const runningRoutes = {
  claremontLoop: {
    id: 'claremont_running_loop',
    name: 'Claremont College Loop',
    activity: 'running',
    distance: 5.2,
    elevation: 800,
    waypoints: [
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' },
      { lat: 34.1100, lng: -117.7000, name: 'Pomona College' },
      { lat: 34.1150, lng: -117.6900, name: 'Claremont McKenna' },
      { lat: 34.1200, lng: -117.6800, name: 'Scripps College' },
      { lat: 34.1250, lng: -117.6700, name: 'Pitzer College' },
      { lat: 34.1200, lng: -117.6800, name: 'Return via Scripps' },
      { lat: 34.1150, lng: -117.6900, name: 'Return via CMC' },
      { lat: 34.1100, lng: -117.7000, name: 'Return via Pomona' },
      { lat: 34.1064, lng: -117.7106, name: 'Harvey Mudd College' }
    ],
    description: 'A scenic run through all five Claremont Colleges with moderate hills.',
    difficulty: 'Easy',
    estimatedTime: '45-60 minutes',
    directions: [
      {
        instruction: 'Start at Harvey Mudd College',
        distance: 0,
        duration: 0
      },
      {
        instruction: 'Run to Pomona College',
        distance: 0.8,
        duration: 5
      },
      {
        instruction: 'Continue to Claremont McKenna',
        distance: 1.5,
        duration: 10
      },
      {
        instruction: 'Run to Scripps College',
        distance: 2.2,
        duration: 15
      },
      {
        instruction: 'Continue to Pitzer College',
        distance: 2.9,
        duration: 20
      },
      {
        instruction: 'Begin return loop',
        distance: 3.6,
        duration: 25
      },
      {
        instruction: 'Return to Harvey Mudd College',
        distance: 5.2,
        duration: 35
      }
    ]
  }
};

// Function to get example routes based on location and parameters
export const getExampleRoute = (location, distance, elevation, activity) => {
  // Check if location is near Harvey Mudd College (Claremont area)
  const isClaremontArea = location && 
    Math.abs(location.lat - 34.1064) < 0.1 && 
    Math.abs(location.lng - (-117.7106)) < 0.1;

  if (isClaremontArea && activity === 'biking') {
    // Check if parameters match the Baldy Road route
    if (Math.abs(distance - 30) < 5 && Math.abs(elevation - 5000) < 1000) {
      return harveyMuddRoutes.baldyRoadRoute;
    }
    // Check if parameters match the Claremont Hills route
    if (Math.abs(distance - 28) < 5 && Math.abs(elevation - 3000) < 1000) {
      return harveyMuddRoutes.claremontHillsRoute;
    }
  }

  if (isClaremontArea && activity === 'running') {
    // Check if parameters match the running route
    if (Math.abs(distance - 5) < 2 && Math.abs(elevation - 800) < 500) {
      return runningRoutes.claremontLoop;
    }
  }

  return null;
};
