import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3RouteMap = ({ routeData, startLocation, width = 800, height = 600 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!routeData || !startLocation) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Set up the map projection
    const projection = d3.geoMercator()
      .center([startLocation.lng, startLocation.lat])
      .scale(10000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create the main group
    const g = svg.append("g");

    // Add base map background (similar to isochrone map)
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f8f9fa")
      .attr("stroke", "#dee2e6")
      .attr("stroke-width", 1);

    // Add grid lines for base map effect
    const gridSize = 20;
    for (let i = 0; i < width; i += gridSize) {
      g.append("line")
        .attr("x1", i)
        .attr("y1", 0)
        .attr("x2", i)
        .attr("y2", height)
        .attr("stroke", "#e9ecef")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }
    for (let i = 0; i < height; i += gridSize) {
      g.append("line")
        .attr("x1", 0)
        .attr("y1", i)
        .attr("x2", width)
        .attr("y2", i)
        .attr("stroke", "#e9ecef")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }

    // Add start location marker
    const startCoords = projection([startLocation.lng, startLocation.lat]);
    g.append("circle")
      .attr("cx", startCoords[0])
      .attr("cy", startCoords[1])
      .attr("r", 8)
      .attr("fill", "#dc3545")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("opacity", 0.9);

    g.append("text")
      .attr("x", startCoords[0])
      .attr("y", startCoords[1] - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#dc3545")
      .text("START");

    // Process and display routes
    if (routeData.routes && routeData.routes.length > 0) {
      const colors = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A'];
      
      routeData.routes.forEach((route, index) => {
        if (route.route && route.route.geometry) {
          const color = colors[index % colors.length];
          
          // Convert route coordinates to GeoJSON format
          const routeGeoJSON = {
            type: "Feature",
            geometry: route.route.geometry,
            properties: {
              distance: route.distance,
              duration: route.duration,
              routeIndex: index
            }
          };

          // Add route path
          g.append("path")
            .datum(routeGeoJSON)
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 4)
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", "8,4")
            .style("cursor", "pointer");

          // Add route markers for start and end points
          const startPoint = route.start;
          const endPoint = route.end;
          
          if (startPoint) {
            const startCoords = projection([startPoint.lng, startPoint.lat]);
            g.append("circle")
              .attr("cx", startCoords[0])
              .attr("cy", startCoords[1])
              .attr("r", 6)
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .attr("opacity", 0.9);
          }

          if (endPoint) {
            const endCoords = projection([endPoint.lng, endPoint.lat]);
            g.append("circle")
              .attr("cx", endCoords[0])
              .attr("cy", endCoords[1])
              .attr("r", 6)
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 2)
              .attr("opacity", 0.9);
          }

          // Add route information
          const routeInfo = g.append("g")
            .attr("class", `route-info-${index}`)
            .attr("transform", `translate(${width - 200}, ${20 + index * 80})`);

          routeInfo.append("rect")
            .attr("width", 180)
            .attr("height", 60)
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

          routeInfo.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", color)
            .text(`Route ${index + 1}`);

          routeInfo.append("text")
            .attr("x", 10)
            .attr("y", 35)
            .attr("font-size", "12px")
            .attr("fill", "#666")
            .text(`Distance: ${route.distance ? (route.distance / 1000).toFixed(1) + ' km' : 'Unknown'}`);

          routeInfo.append("text")
            .attr("x", 10)
            .attr("y", 50)
            .attr("font-size", "12px")
            .attr("fill", "#666")
            .text(`Duration: ${route.duration ? Math.round(route.duration / 60) + ' min' : 'Unknown'}`);
        }
      });
    }

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Fit the view to show all routes
    if (routeData.routes && routeData.routes.length > 0) {
      const bounds = d3.geoBounds({
        type: "FeatureCollection",
        features: routeData.routes
          .filter(route => route.route && route.route.geometry)
          .map(route => ({
            type: "Feature",
            geometry: route.route.geometry
          }))
      });

      if (bounds[0] && bounds[1]) {
        const [[x0, y0], [x1, y1]] = bounds.map(projection);
        const scale = 0.8 / Math.max((x1 - x0) / width, (y1 - y0) / height);
        const translate = [width / 2 - scale * (x0 + x1) / 2, height / 2 - scale * (y0 + y1) / 2];

        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      }
    }

  }, [routeData, startLocation, width, height]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ 
          border: '1px solid #dee2e6', 
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}
      />
    </div>
  );
};

export default D3RouteMap;
