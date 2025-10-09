import React from 'react';
import D3RouteMap from './D3RouteMap';

const EdgeRoutesMap = ({ edgeRoutes, startLocation }) => {
  if (!edgeRoutes || !startLocation) {
    return (
      <div style={{ 
        width: '100%', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <p>No route data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <D3RouteMap
        routeData={edgeRoutes}
        startLocation={startLocation}
        width={800}
        height={400}
      />
    </div>
  );
};

export default EdgeRoutesMap;
