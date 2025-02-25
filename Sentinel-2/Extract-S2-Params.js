//import the s2_image

var B2 = s2_image.select('B2');
var B3 = s2_image.select('B3');
var B4 = s2_image.select('B4');
var B5 = s2_image.select('B5');  
var B8 = s2_image.select('B8');  
var B11 = s2_image.select('B11'); 

var NDVI = B8.subtract(B4).divide(B8.add(B4)).rename('NDVI');

var EVI = s2_image.expression(
    '2.5 * (NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1)', {
        'NIR': B8,
        'RED': B4,
        'BLUE': B2
}).rename('EVI');

var GNDVI = B8.subtract(B3).divide(B8.add(B3)).rename('GNDVI');

var SAVI = B8.subtract(B4).divide(B8.add(B4).add(0.5)).multiply(1.5).rename('SAVI');

var NDWI = B3.subtract(B8).divide(B3.add(B8)).rename('NDWI');

var NDMI = B8.subtract(B11).divide(B8.add(B11)).rename('NDMI');

var RENDVI = B5.subtract(B4).divide(B5.add(B4)).rename('RENDVI');

var indices = NDVI.addBands([EVI, NDWI, SAVI, GNDVI, NDMI, RENDVI]);

// Map.centerObject(s2_image, 10); // Center the map on the image

// Map.addLayer(NDVI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI');
// Map.addLayer(EVI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'EVI');
// Map.addLayer(GNDVI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'GNDVI');
// Map.addLayer(SAVI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'SAVI');
// Map.addLayer(NDWI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDWI');
// Map.addLayer(NDMI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDMI');
// Map.addLayer(RENDVI, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'RENDVI');
