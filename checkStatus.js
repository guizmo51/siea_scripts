//NOR NRO_01074_00004
//0740000A085800101
let nrosToCheck = ['NRO_01074_00004'];
let idToCheck = ['0740000A085800101'];
const cheerio = require('cheerio');
var request = require('request'),
zlib = require('zlib'),
fs = require('fs'),
out = fs.createWriteStream('out');
const StreamZip = require('node-stream-zip');
const { EOL } = require('os');

request('https://operateurs.liain.fr/ipe/', (e,r,b) => {
   
   const $ = cheerio.load(b);
    $('table  a').each(function(index, item) {
        if(/LIAIN_01_SIEA_PM_IPEZMD_V20_\d{8}_00_PBOOK\.zip/.test($(item).attr('href'))){
            fs.unlink('./DL/siea.zip', () => {
                request('https://operateurs.liain.fr/ipe/'+$(item).attr('href')).pipe(fs.createWriteStream('./DL/siea.zip')).on('close', async () => {
                    console.log('file written');
                    const zip = new StreamZip({ file: './DL/siea.zip' });
                    zip.on('ready', async () => {
                        const entriesCount = zip.entriesCount;
                        const entries = zip.entries();
                        for (const entry of Object.values(entries)) {
                                console.log(/LIAIN_01_SIEA_PM_IPEZMD_V20_\d{8}_00_PBOOK\.csv/.test(entry.name));
                            if (/LIAIN_01_SIEA_PM_IPEZMD_V20_\d{8}_00_PBOOK\.csv/.test(entry.name)) {
                                const data = zip.entryDataSync(entry.name).toString('utf8');
                                
                                readCSV(data);
                            }   
                        }
                        await zip.close();
    

                    })
                   
                })
            });
            
        }
    });
})

function readCSV(data){
    let raws = data.split(EOL);
    let headers = raws.shift();
    console.log();
    idToCheck.forEach((v) => {
        let f = raws.find(r => r.split(';')[0] == v);
        if (f) {
            console.log('Etat '+v+' => '+f.split(';')[12]);
        } else {
            console.log('Identifiant '+v+' non trouvé');
        }
    })

    nrosToCheck.forEach((v) => {
        let f = raws.find(r => r.split(';')[headers.split(';').findIndex(v => v =='ReferencePM')] == v);
        if (f) {
            console.log('Etat du PM => '+f.split(';')[headers.split(';').findIndex(v => v =='EtatPM')]);
        } else {
            console.log('NRO non trouvé');
        }
    });

}
