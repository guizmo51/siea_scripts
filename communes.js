// CRée le fichier des communes pour avoir leurs coordonées GPS

const request = require('request');
const fs = require('fs');
request.get('https://geo.api.gouv.fr/departements/01/communes?fields=nom,code,centre', (err, res, body) => {
    fs.writeFile('../files/communes.json', body, (e,f) => {
        if(!e) {
            console.log('fichier ok');
        }
    });
})