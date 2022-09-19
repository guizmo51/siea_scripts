const fs = require('fs');
let pms = [];
let headers = [];
let communes = [];
let communesData = fs.readFileSync('../files/communes.json', 'utf-8');
let communesJson = JSON.parse(communesData);
const proj4 = require("proj4");
proj4.defs("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

fs.readFile('../files/LIAIN_01_SIEA_PM_IPEZMD_V20_20220914_00_PBOOK.csv', 'utf-8', (e, f) => {
    if (!e) {
        let rows = f.split('\n');
       
        headers = rows.shift().split(';');
        rows.pop();
        rows.forEach(element => {
        
            let row =  element.split(';');
            let c = {
                insee: row[headers.findIndex((e) => e == 'CodeInseeImmeuble')],
                nom: row[headers.findIndex((e) => e == 'CommuneImmeuble')],
                cp: row[headers.findIndex((e) => e == 'CodePostalImmeuble')]
            }
            if (communes.find(comm => comm.insee == c.insee) == null) {
                communes.push(c);
            }
            let pmInsee = row[headers.findIndex((e) => e == 'ReferencePM')].split('_')[1];

            
            let o = {
                id: row[headers.findIndex((e) => e == 'ReferencePM')], 
                etat:  row[headers.findIndex((e) => e == 'EtatPM')],
                coords: {accuracy: null, x: row[headers.findIndex((e) => e == 'CoordonneePMX')], y: row[headers.findIndex((e) => e == 'CoordonneePMY')]},
                commune: {insee: c.insee, nom: row[headers.findIndex((e) => e == 'CommunePM')]}
            };
            
            
            let f = pms.find(p => p.id == o.id);
            if (f == null) {
                pms.push(o);
                
            }

        });
        pms.forEach((element) => {
            if (element.commune.nom.length == 0) {
                element.commune.nom = communes.find( com => com.insee == element.id.split('_')[1])?.nom;
            }
            if (element.coords.x.length > 0 && element.coords.y.length > 0) {
                console.log(element.coords);
                let lng, lat;
            [lng,  lat]  =  proj4('EPSG:2154', 'WGS84', [Number.parseInt(element.coords.x), Number.parseInt(element.coords.y)])
                    element.coords.lat = lat;
                    element.coords.lng = lng;
                element.coords.accuracy = 100;
            } else {
                element.coords.accuracy = 0;
                let findComm = communesJson.find((c) => c.code == element.commune.insee );
                if (findComm) {
                    if (findComm.centre) {
                        element.coords.lat = findComm.centre.coordinates[1];
                        element.coords.lng = findComm.centre.coordinates[0];
                    }
                }
                
            }
        });
        console.log(pms.length);
        console.log(pms.filter(e => e.etat=='EN COURS DE DEPLOIEMENT').length + ' EN COURS');
        console.log(pms.filter(e => e.etat=='DEPLOYE').length + ' DEPLOYE ');
        fs.writeFile('../files/pms.json', JSON.stringify(pms), (e,f) => {
            if(!e) {
                console.log('fichier généré');
            }
        })
        
        /*console.log(pms.length);
        console.log(pms.filter(p => p.etat == 'EN COURS DE DEPLOIEMENT').length);
        console.log(pms.filter(p => p.etat == 'DEPLOYE').length);
        console.log(pms.filter(p => p.etat !== 'DEPLOYE' && p.etat !== 'EN COURS DE DEPLOIEMENT'))*/
        //console.log(pms);
    } else {
        console.error(e);
    }
})