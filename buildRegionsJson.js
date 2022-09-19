const fs = require('fs');
let base = '/Users/simon/Documents/Dev/node/adopteUnPM/map-my-pms/public';
const centroid = require('@turf/centroid');
const turf = require('@turf/turf');
let stats = JSON.parse(fs.readFileSync(base+'/stats_deploiement.json', 'utf-8'));
let ain = JSON.parse(fs.readFileSync(base+'/ain_api.json', 'utf-8'));
let apiGeo = JSON.parse(fs.readFileSync(base+'/communes?fields=centre.1'));
let ain_old = JSON.parse(fs.readFileSync(base+'/ain.json', 'utf-8'));
let pms = JSON.parse(fs.readFileSync(base+'/pms.json', 'utf-8'));
console.log(apiGeo);
let olds_communes = {"01300":"01204","01119":"01080", "01409": "01187", "01312":"01426","01316":"01098","01271":"01286","01340":"01015","01172":"01095"};







stats.aggregations.Commune.buckets.forEach(async (c) => {
    let center;
    let find = apiGeo.find(f => f.code == c.key);

    if (find == undefined) {
        let r = await fetch('https://geo.api.gouv.fr/communes?code='+c.key+'&fields=centre').then(r => r.json());
        
        if (r.length == 0) {
            console.log(c.key);
            console.log(olds_communes[c.key]);

            /*let find_2 = ain_old.features.find(f => f.properties.code == c.key);
            if (find_2) {
                //console.log(find_2.geometry.coordinates);
                let polygon = turf.polygon(find_2.geometry.coordinates);
                let centroid = turf.centroid(polygon);
                center = centroid.geometry;
                //console.log(center);
            } else {
                console.log(c.key);
                console.log(pms.find(pm => pm.commune.insee == c.key));
                
               
            }*/
        } else {
            center = r[0].centre;
            console.log(center);
        }
        
        
    } else {
        center = find.centre;
    }
    c.center = center;
   // console.log(find.geometry);
    
});
fs.writeFileSync('enrich_stats_deploiement.json', JSON.stringify(stats), () => {});
