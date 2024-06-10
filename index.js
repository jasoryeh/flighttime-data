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
async function processSHPs() {
    if (!fs.existsSync(`tmp/shpfeatures`)) {
        fs.mkdirSync(`tmp/shpfeatures`);
    }

    let references = {};

    for (let i = 0; i < shp.features.length; i++) {
        let ident = shp.features[i]["properties"]["IDENT"];
        let name = shp.features[i]["properties"]["NAME"];
        let fn = ident + "_" +  name.replace(/[^a-zA-Z0-9]/g, "-");
        let jsonname = `feature_${fn}_${i}.json`;
        let filename = `tmp/shpfeatures/${jsonname}`;
        let bounds = calculateBounds(shp.features[i]);
        shp.features[i].bounds = bounds;
        console.log(`   Writing ${filename}`);
        references[name] = jsonname;
        try {    
            let asJSON = JSON.stringify(shp.features[i], null, 4);
            fs.writeFileSync(`${filename}`, asJSON);
        } catch(ex) {
            console.error("Could not write " + filename);
            console.error(ex);
            return false;
        }
    }
    let {features: _, ...all} = shp;
    all.features = references;
    fs.writeFileSync(`tmp/shpfeatures/_data.json`, JSON.stringify(all, null, 4));
    return true;
}

async function processDBFs() {
    if (!fs.existsSync(`tmp/dbffeatures`)) {
        fs.mkdirSync(`tmp/dbffeatures`);
    }

    let references = {};

    for (let i = 0; i < dbf.length; i++) {
        let ident = dbf[i]["IDENT"]
        let name = dbf[i]["NAME"]
        let fn = ident + "_" +  name.replace(/[^a-zA-Z0-9]/g, "-");
        let jsonname = `${fn}_${i}.json`;
        let filename = `tmp/dbffeatures/dbf_${jsonname}`;
        console.log(`   Writing ${filename}`);
        references[name] = jsonname;
        try {    
            let asJSON = JSON.stringify(dbf[i], null, 4);
            fs.writeFileSync(`${filename}`, asJSON);
        } catch(ex) {
            console.error("Could not write " + filename);
            console.error(ex);
            return false;
        }
    }
    fs.writeFileSync(`tmp/dbffeatures/_data.json`, JSON.stringify(references, null, 4));
    return true;

}

(async function() {
    console.log("Processing SHPs...");
    await processSHPs();
    console.log("Processing SHPs done.");
    console.log("Processing DBFs...");
    await processDBFs();
    console.log("Processing DBFs done.");

})();