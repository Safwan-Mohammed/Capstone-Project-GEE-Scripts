// Import the processed Image and the Region

var WCM = function(image) {
    var A = 0.12;
    var B = 0.04;
    var Omega = 0.3;

    var VV = image.select('VV');
    var VH = image.select('VH');
    var VH_VV = image.select('VVVH_ratio');  

    var VWC = VV.subtract(A).divide(B).multiply(Omega).rename('VWC');  

    return image.addBands(VWC);
};

var processedImageWCM = WCM(processedImage);

var regionStats = processedImageWCM.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: region,  
  scale: 10,
  maxPixels: 1e13
});

print('Mean VV, VH & VWC over Tumkur:', regionStats);

var visParamsVVVH = {bands: ['VV', 'VH', 'VVVH_ratio'], min: -25, max: 0};
var visParamsVWC = {bands: ['VWC'], min: 0, max: 1, palette: ['blue', 'green', 'yellow', 'red']};  

Map.centerObject(region, 10);
Map.addLayer(processedImage.clip(region), visParamsVVVH, 'Processed S1 VV & VH');
Map.addLayer(processedImageWCM.clip(region), visParamsVWC, 'Estimated VWC (Water Cloud Model)');
