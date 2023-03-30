const fs = require('fs');

console.log("Loading shapefile GeoJSON...");
const shp = require('./tmp/Airspace.shp.json');
console.log("Loading dbf file JSON...");
const dbf = require('./tmp/Airspace.dbf.json');
console.log("Loaded.");

function _recurse_bounds(bounds, coords) {
    if (coords instanceof Array && typeof(coords[0]) == 'number' && typeof(coords[1]) == 'number') {
        bounds.minlon = Math.min(bounds.minlon ?? coords[0], coords[0]);
        bounds.minlat = Math.min(bounds.minlat ?? coords[1], coords[1]);
        bounds.maxlon = Math.max(bounds.maxlon ?? coords[0], coords[0]);
        bounds.maxlat = Math.max(bounds.maxlat ?? coords[1], coords[1]);
    } else if (coords instanceof Array) {
        for (let subcoords of coords) {
            _recurse_bounds(bounds, subcoords);
        }
    } else {
        console.warn("??? ");
        console.warn(coords);
    }
}

function calculateBounds(geoJSONFeature) {
    var bounds = {minlon: null, maxlon: null, minlat: null, maxlat: null};
    _recurse_bounds(bounds, geoJSONFeature.geometry.coordinates);
    return bounds;
}

/**
 * Decompose the GeoJSON into a database
 *  so that we can look it up by whatever's
 *  accessible.
 * 
 * Currently: Decomposes it by file, and 
 *  computes the min and max/min Lat and Lon
 *  to get the bounds, so that later we can
 *  use it to compute more data.
 * 
 * TODO: Push this to a database.
 * @returns 
 */
function processSHPs() {
    let running = [];
    for (let i = 0; i < shp.features.length; i++) {
        running.push(new Promise((resolve, reject) => {
            let filename = `tmp/shpfeatures/${i}.json`;
            let bounds = calculateBounds(shp.features[i]);
            shp.features[i].bounds = bounds;
            console.log(`   Writing ${filename}`);
            try {    
                let asJSON = JSON.stringify(shp.features[i], null, 4);
                fs.writeFileSync(`${filename}`, asJSON);
            } catch(ex) {
                reject(ex);
            }
            resolve();
        }));
    }
    let {features: _, ...all} = shp;
    fs.writeFileSync(`tmp/shpfeatures/_data.json`, JSON.stringify(all, null, 4));
    return Promise.all(running);
}

(async function() {
    console.log("Processing SHPs...");
    await processSHPs();
    console.log("Processing SHPs done.");

})();