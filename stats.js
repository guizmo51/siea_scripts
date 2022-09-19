let actions = ['updateIPE', 'updateVilles', 'process'];
const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const extract = require('extract-zip')
let communes = [];
let data = {};
let globalData = {cible: 0, encours: 0, deploye: 0, signe: 0};
let file = './DL/LIAIN_01_SIEA_PM_IPEZMD_V20_20220620_00_PBOOK.csv';
const StreamZip = require('node-stream-zip');
if (actions.includes(process.argv[2])){

    if (process.argv[2] == 'updateVilles') {

        fs.readFile(file , 'UTF-8', (e,f) => {
            if (!e) {
                
                let rows = f.split('\n');
                let headers = rows.splice(0,1)[0].split(';');
                rows.forEach((r) => {
                    let row_split = r.split(';');
                    let insee = row_split[headers.indexOf('CodeInseeImmeuble')];
                    let commune = row_split[headers.indexOf('CommuneImmeuble')];
                    let zipcode = row_split[headers.indexOf('CodePostalImmeuble')];
                    let find = communes.filter(c => c.insee == insee && c.commune == commune && c.zipcode == zipcode);
                   
                    if (find.length == 0) {
                        communes.push({commune: commune, zipcode: zipcode, insee: insee});
                    }
                });
                fs.writeFile('communes.json', JSON.stringify(communes), (e,f) => {
                    if(!e){
                        console.log('villes écrites');
                    }
                })
                
            }
        })

    } else if (process.argv[2] == 'updateIPE') {
        request('https://operateurs.liain.fr/ipe/', (e,r,b) => {
   
   const $ = cheerio.load(b);
    $('table  a').each(function(index, item) {
        if(/LIAIN_01_SIEA_PM_IPEZMD_V20_\d{8}_00_PBOOK\.zip/.test($(item).attr('href'))){
            fs.unlink('./DL/siea.zip', () => {
                request('https://operateurs.liain.fr/ipe/'+$(item).attr('href')).pipe(fs.createWriteStream('./DL/siea.zip')).on('close', async () => {
                    console.log('file written');
                    /*const zip = new StreamZip({ file: './DL/siea.zip' });
                    zip.on('ready', async () => {
                        const entriesCount = zip.entriesCount;
                        const entries = zip.entries();
                        for (const entry of Object.values(entries)) {
                            if (/LIAIN_01_SIEA_PM_IPEZMD_V20_\d{8}_00_PBOOK\.csv/.test(entry.name)) {
                                const data = zip.entryDataSync(entry.name).toString('utf8');
                                console.log(data);
                                //readCSV(data);
                            }   
                        }
                        await zip.close();
    

                    })*/
                    extract('./DL/siea.zip', { dir: '/Users/simon/Documents/Dev/node/adopteUnPM/scripts/DL' }).then((x) => {

                        console.log(x);
                        console.log('done');
                    })
                   
                })
            });
            
        }
    });
})
    } else if (process.argv[2] == 'process') {
         fs.readFile(file , 'UTF-8', (e,f) => {
            if (!e) {
                
                let rows = f.split('\n');
                let headers = rows.splice(0,1)[0].split(';');
                console.log(rows.length);
                rows.forEach((r) => {
                    let row_data = r.split(';');
                    let insee = row_data[headers.indexOf('CodeInseeImmeuble')];
                    if (!data[insee]){
                            data[insee] = {cible: 0, deploye: 0, encours: 0, signe: 0};
                    }
                   
                    if (row_data[headers.indexOf('EtatImmeuble')] == 'DEPLOYE' ) {
                        data[insee].deploye  = data[insee].deploye + 1;
                        globalData.deploye = globalData.deploye + 1;
                    } else if (row_data[headers.indexOf('EtatImmeuble')] == 'EN COURS DE DEPLOIEMENT') {
                        data[insee].encours  = data[insee].encours + 1;
                        globalData.encours = globalData.encours + 1;
                    } else if (row_data[headers.indexOf('EtatImmeuble')] == 'CIBLE'){
                        data[insee].cible  = data[insee].cible + 1;

                        globalData.cible = globalData.cible + 1;
                    }
                    else if (row_data[headers.indexOf('EtatImmeuble')] == 'SIGNE'){
                        data[insee].signe  = data[insee].signe + 1;

                        globalData.signe = globalData.signe + 1;
                    }
                   
                })
                fs.writeFile('data.json', JSON.stringify(data), (e, f) => {

                });
                
               
              

            } else {
                console.log(e);
            }
        });


    }


}