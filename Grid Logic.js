//Import the Image

var region = image.geometry(); // Get image boundary

// Extract bounding box properly
var bounds = ee.Geometry(region.bounds()).coordinates().get(0); // Get list of 5 points (rectangle coordinates)
var coords = ee.List(bounds); // Explicitly cast to list

var minLon = ee.Number(ee.List(coords.get(0)).get(0)); // Bottom-left longitude
var minLat = ee.Number(ee.List(coords.get(0)).get(1)); // Bottom-left latitude
var maxLon = ee.Number(ee.List(coords.get(2)).get(0)); // Top-right longitude
var maxLat = ee.Number(ee.List(coords.get(2)).get(1)); // Top-right latitude

// Define tile size in degrees (~0.025° ≈ 2560m for Sentinel-2 resolution)
var tileSize = 0.041;  

// Generate a grid of tiles
var lonLatGrid = ee.FeatureCollection(
    ee.List.sequence(minLon, maxLon, tileSize)
      .map(function(lon) {
          lon = ee.Number(lon);  // Ensure lon is an ee.Number
          return ee.List.sequence(minLat, maxLat, tileSize)
            .map(function(lat) {
                lat = ee.Number(lat);  // Ensure lat is an ee.Number
                return ee.Feature(ee.Geometry.Rectangle([lon, lat, lon.add(tileSize), lat.add(tileSize)]));
            });
      }).flatten()
);
Map.addLayer(image, {
    min: 0,
    max: 3000,
    bands: ['B4', 'B3', 'B2'], // True color visualization
}, 'Sentinel-2 Image');


Map.addLayer(lonLatGrid.style({color: 'gray', width: 1, fillColor: '00000040'}), {}, 'Grid')
