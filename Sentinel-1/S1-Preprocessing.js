//Import the Region

var wrapper = require('users/adugnagirma/gee_s1_ard:wrapper');
var helper = require('users/adugnagirma/gee_s1_ard:utilities');

//Make sure to change the file names for every download

var fileId = 'projects/wise-scene-427306-q3/assets/Sentinel-1/2018/Processed_S1_Tumkur_July_2018';
var description = 'Processed_S1_Tumkur_July_2018';

// Define Parameters
var parameter = {
    START_DATE: '2018-07-01',
    STOP_DATE: '2018-07-30',
    POLARIZATION: 'VVVH',
    GEOMETRY: region,
    ORBIT: 'BOTH',
    APPLY_ADDITIONAL_BORDER_NOISE_CORRECTION: true,
    APPLY_SPECKLE_FILTERING: true,
    SPECKLE_FILTER_FRAMEWORK: 'MULTI',
    SPECKLE_FILTER: 'REFINED LEE',
    SPECKLE_FILTER_KERNEL_SIZE: 15,
    SPECKLE_FILTER_NR_OF_IMAGES: 10,
    APPLY_TERRAIN_FLATTENING: true,
    DEM: ee.Image('USGS/SRTMGL1_003'),
    TERRAIN_FLATTENING_MODEL: 'VOLUME',
    TERRAIN_FLATTENING_ADDITIONAL_LAYOVER_SHADOW_BUFFER: 0,
    FORMAT: 'DB',
    CLIP_TO_ROI: true,
    SAVE_ASSETS: false
};

var s1_preprocces = wrapper.s1_preproc(parameter);
var s1 = s1_preprocces[0]
s1_preprocces = s1_preprocces[1]

var visparam = {};
var s1_preprocces_view = s1_preprocces.map(function(image) { 
    return image.addBands(image.expression('VH / VV', { 'VH': image.select('VH'), 'VV': image.select('VV') }).rename('VH_VV_ratio')); 
}).map(helper.lin_to_db2);

var s1_view = s1.map(function(image) { 
    return image.addBands(image.expression('VH / VV', { 'VH': image.select('VH'), 'VV': image.select('VV') }).rename('VH_VV_ratio')); 
}).map(helper.lin_to_db2);

visparam = {bands:['VV','VH','VH_VV_ratio'],min: [-20, -25, 1],max: [0, -5, 15]}

// Export.image.toAsset({
//   image: s1_preprocces_view.median().clip(parameter.GEOMETRY),
//   description: description,
//   assetId: fileId,
//   scale: 10,
//   region: parameter.GEOMETRY,
//   maxPixels: 1e13
// });


Map.centerObject(region, 12);
// // Map.addLayer(s1_view.median(), visparam, 'First image in the input S1 collection', true);
Map.addLayer(s1_preprocces_view.median(), visparam, 'First image in the processed S1 collection', true);