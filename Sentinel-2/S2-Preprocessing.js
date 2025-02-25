//Import the region

//Make sure to change the fileId and description before every upload
var fileId = 'projects/wise-scene-427306-q3/assets/Sentinel-2/2022/Processed_S2_Tumkur_July_2022';
var description = 'Processed_S2_Tumkur_July_2022';

var AOI = region;
var START_DATE = '2022-07-01';
var END_DATE = '2022-07-30';

//Make sure to toggle these changes based on ur month input

//For July to September
var CLOUD_FILTER = 80;
var CLD_PRB_THRESH = 50;
var NIR_DRK_THRESH = 0.15;
var CLD_PRJ_DIST = 1;
var BUFFER = 50;

//For October onwards
// var CLOUD_FILTER = 40;
// var CLD_PRB_THRESH = 40;
// var NIR_DRK_THRESH = 0.15;
// var CLD_PRJ_DIST = 1;
// var BUFFER = 100;

var SR_BAND_SCALE = 1e4;

var s2_sr_col = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(AOI)
    .filterDate(START_DATE, END_DATE)
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', CLOUD_FILTER));

var s2_cloudless_col = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
    .filterBounds(AOI)
    .filterDate(START_DATE, END_DATE);

var joined = ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
    primary: s2_sr_col,
    secondary: s2_cloudless_col,
    condition: ee.Filter.equals({
        leftField: 'system:index',
        rightField: 'system:index'
    })
}));

var s2_sr_cld = joined.map(function(img) {
    var cld_prb = ee.Image(img.get('s2cloudless')).select('probability');
    var is_cloud = cld_prb.gt(CLD_PRB_THRESH).rename('clouds');
    return img.addBands(ee.Image([cld_prb, is_cloud]));
});

var s2_sr_cld_shdw = s2_sr_cld.map(function(img) {
    var not_water = img.select('SCL').neq(6);
    var dark_pixels = img.select('B8').lt(NIR_DRK_THRESH * SR_BAND_SCALE)
        .multiply(not_water)
        .rename('dark_pixels');

    var shadow_azimuth = ee.Number(90).subtract(ee.Number(img.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

    var cld_proj = img.select('clouds')
        .directionalDistanceTransform(shadow_azimuth, CLD_PRJ_DIST * 10)
        .reproject({crs: img.select(0).projection(), scale: 100})
        .select('distance')
        .mask()
        .rename('cloud_transform');

    var shadows = cld_proj.multiply(dark_pixels).rename('shadows');
    return img.addBands(ee.Image([dark_pixels, cld_proj, shadows]));
});

var s2_sr_cld_shdw_masked = s2_sr_cld_shdw.map(function(img) {
    var is_cld_shdw = img.select('clouds')
        .add(img.select('shadows'))
        .gt(0);

    is_cld_shdw = is_cld_shdw.focalMin(2)
        .focalMax(BUFFER * 2 / 20)
        .reproject({crs: img.select([0]).projection(), scale: 20})
        .rename('cloudmask');

    return img.addBands(is_cld_shdw);
});

var s2_sr_clean = s2_sr_cld_shdw_masked.map(function(img) {
    var not_cld_shdw = img.select('cloudmask').not();
    return img
        .select(['B2', 'B3', 'B4', 'B5', 'B8', 'B11'])
        .updateMask(not_cld_shdw);
});

var s2_sr_median = s2_sr_clean.median().clip(AOI);
var center = AOI.geometry().centroid();
var vizParams = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 2500,
    gamma: 1.1
};

// Visualisation

var center = AOI.geometry().centroid();
var vizParams = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 2500,
    gamma: 1.1
};

Map.centerObject(center, 12);
Map.addLayer(s2_sr_median, vizParams, 'S2 Cloud-Free (Filtered Bands)');

// Export.image.toAsset({
//     image: s2_sr_median,
//     description: description,
//     assetId: fileId,
//     scale: 10,
//     region: AOI,
//     maxPixels: 1e13
// });