//Import the Region

//Make sure to change the file names for every download

var fileId = 'projects/wise-scene-427306-q3/assets/Sentinel-1/2018/Processed_S1_Tumkur_July_2018';
var description = 'Processed_S1_Tumkur_July_2018';

// Define Parameters
var AOI = region;
var START_DATE = '2022-12-01';
var END_DATE = '2022-12-30';

var s1 = ee.ImageCollection('COPERNICUS/S1_GRD_FLOAT').filter(ee.Filter.eq('instrumentMode', 'IW')).filter(ee.Filter.eq('resolution_meters', 10)).filterDate(START_DATE, END_DATE).filterBounds(AOI);

var add_vh_vv_ratio = function(image) {
  var vh_vv_ratio = image.expression('VH / VV', {'VH': image.select('VH'), 'VV': image.select('VV')}).rename('VH_VV_ratio');
  return image.addBands(vh_vv_ratio);
};

var convert_to_db = function(image) {
  var vh_db = image.select('VH').log10().multiply(10).rename('VH_dB');
  var vv_db = image.select('VV').log10().multiply(10).rename('VV_dB');
  var vh_vv_db = image.select('VH_VV_ratio').log10().multiply(10).rename('VH_VV_dB');
  return image.addBands([vh_db, vv_db, vh_vv_db]);
};

var s1_with_ratio = s1.map(add_vh_vv_ratio);
var s1_median = s1_with_ratio.median().clip(AOI);
var s1_median_db = convert_to_db(s1_median);

var visParams = {
  bands: ['VV_dB', 'VH_dB', 'VH_VV_dB'],
  min: [-20, -25, -10],
  max: [0, -5, 10],
};

Map.centerObject(region, 12);
Map.addLayer(s1_median_db, visParams, 'Sentinel-1 dB Composite');

// Export.image.toAsset({
//   image: s1_preprocces_view.median().clip(parameter.GEOMETRY),
//   description: description,
//   assetId: fileId,
//   scale: 10,
//   region: parameter.GEOMETRY,
//   maxPixels: 1e13
// });
