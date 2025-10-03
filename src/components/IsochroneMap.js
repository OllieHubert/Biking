import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const IsochroneMap = ({ startLocation, isochroneData, loading, error }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!startLocation || !isochroneData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create projection centered on start location
    const projection = d3.geoMercator()
      .center([startLocation.lng, startLocation.lat])
      .scale(15000) // Increased scale for better detail
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create main group
    const g = svg.append("g");

    // Add satellite-style background with gradient
    const defs = svg.append("defs");
    
    // Create gradient for satellite-like appearance
    const gradient = defs.append("linearGradient")
      .attr("id", "satelliteGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2d5016")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "30%")
      .attr("stop-color", "#4a7c59")
      .attr("stop-opacity", 0.6);

    gradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "#8fbc8f")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f0f8f0")
      .attr("stop-opacity", 0.3);

    // Add satellite-style background
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#satelliteGradient)")
      .attr("stroke", "#2d5016")
      .attr("stroke-width", 2);

    // Add grid lines for satellite map effect
    const gridSize = 20;
    for (let i = 0; i < width; i += gridSize) {
      g.append("line")
        .attr("x1", i)
        .attr("y1", 0)
        .attr("x2", i)
        .attr("y2", height)
        .attr("stroke", "#4a7c59")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }
    
    for (let i = 0; i < height; i += gridSize) {
      g.append("line")
        .attr("x1", 0)
        .attr("y1", i)
        .attr("x2", width)
        .attr("y2", i)
        .attr("stroke", "#4a7c59")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }

    // Add isochrone regions with more detailed styling
    if (isochroneData.features && isochroneData.features.length > 0) {
      console.log('Rendering isochrone features:', isochroneData.features);
      
      // Enhanced color scale with more colors for better differentiation
      const colorScale = d3.scaleOrdinal()
        .domain(isochroneData.ranges)
        .range([
          "#e3f2fd", // Light blue
          "#bbdefb", // Light blue 2
          "#90caf9", // Light blue 3
          "#64b5f6", // Blue
          "#42a5f5", // Blue 2
          "#2196f3", // Blue 3
          "#1e88e5", // Blue 4
          "#1976d2"  // Blue 5
        ]);

      isochroneData.features.forEach((feature, index) => {
        console.log(`Rendering feature ${index}:`, feature);
        
        g.append("path")
          .datum(feature)
          .attr("d", path)
          .attr("fill", colorScale(feature.properties.value))
          .attr("fill-opacity", 0.7)
          .attr("stroke", "#1976d2")
          .attr("stroke-width", 2.5)
          .attr("stroke-opacity", 0.9)
          .on("mouseover", function() {
            d3.select(this)
              .attr("fill-opacity", 0.9)
              .attr("stroke-width", 3);
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("fill-opacity", 0.7)
              .attr("stroke-width", 2.5);
          });
      });
    } else {
      console.log('No isochrone features to render');
    }

    // Add start location marker (enhanced red dot)
    const startPoint = projection([startLocation.lng, startLocation.lat]);
    
    // Add pulsing effect
    g.append("circle")
      .attr("cx", startPoint[0])
      .attr("cy", startPoint[1])
      .attr("r", 15)
      .attr("fill", "#f44336")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none");

    g.append("circle")
      .attr("cx", startPoint[0])
      .attr("cy", startPoint[1])
      .attr("r", 10)
      .attr("fill", "#f44336")
      .attr("fill-opacity", 0.6)
      .attr("stroke", "none");

    // Main red dot
    g.append("circle")
      .attr("cx", startPoint[0])
      .attr("cy", startPoint[1])
      .attr("r", 6)
      .attr("fill", "#f44336")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3);

    // Add start location label with background
    const labelGroup = g.append("g")
      .attr("transform", `translate(${startPoint[0] + 20}, ${startPoint[1] - 15})`);

    labelGroup.append("rect")
      .attr("x", -5)
      .attr("y", -15)
      .attr("width", 120)
      .attr("height", 20)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#f44336")
      .attr("stroke-width", 1)
      .attr("rx", 3);

    labelGroup.append("text")
      .attr("x", 5)
      .attr("y", 0)
      .attr("font-family", "Arial, sans-serif")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#f44336")
      .text("Start Location");

    // Enhanced legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 180}, 30)`);

    // Legend background
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 170)
      .attr("height", 200)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 1)
      .attr("rx", 5);

    legend.append("text")
      .attr("x", 75)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Arial, sans-serif")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#1976d2")
      .text("Cycling Ranges");

    isochroneData.ranges.forEach((range, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(10, ${20 + index * 25})`);

      legendItem.append("rect")
        .attr("width", 20)
        .attr("height", 15)
        .attr("fill", d3.scaleOrdinal()
          .domain(isochroneData.ranges)
          .range([
            "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", 
            "#42a5f5", "#2196f3", "#1e88e5", "#1976d2"
          ])(range))
        .attr("stroke", "#1976d2")
        .attr("stroke-width", 1)
        .attr("rx", 2);

      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "#333")
        .text(`${Math.round(range / 60)} min (${Math.round(range / 1000)}km)`);
    });

    // Add title with background
    const titleGroup = g.append("g")
      .attr("transform", `translate(${width / 2}, 25)`);

    titleGroup.append("rect")
      .attr("x", -120)
      .attr("y", -15)
      .attr("width", 240)
      .attr("height", 25)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 1)
      .attr("rx", 5);

    titleGroup.append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Arial, sans-serif")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#1976d2")
      .text("Cycling Accessibility Map");

  }, [startLocation, isochroneData, dimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: Math.min(800, container.clientWidth - 40),
          height: 600
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Generating accessibility map...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error generating map: {error}
      </Alert>
    );
  }

  if (!startLocation || !isochroneData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400,
        border: '2px dashed #ccc',
        borderRadius: 2
      }}>
        <Typography variant="body1" color="text.secondary">
          Enter a start location to generate the accessibility map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ 
          display: 'block',
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      />
    </Box>
  );
};

export default IsochroneMap;
