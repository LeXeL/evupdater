var express = require('express');
var fs = require('fs');
var unzip = require('unzip');
const axios = require('axios');
var rimraf = require('rimraf');
var cheerio = require('cheerio');
var app     = express();

function getRemoteVersion(url){
    var re = /Version: \d+.\d+/;
    return new Promise((resolve, reject)=>{
        axios.get(url)
        .then((res)=>{
            var $ = cheerio.load(res.data);
            let version = $.text().match(re)
            resolve(version[0].split(' ')[1])
        })
        .catch(function (error) {
            reject(error)
        })
    })
    
}

async function downloadFile(url,name,addonVersion){
    if (name === 'elvui'){
        let version = await getRemoteVersion(addonVersion)
        axios({
            url: url+name+'-'+version+'.zip',
            method: 'GET',
            responseType: 'arraybuffer' 
        })
        .then((response) => {
            fs.writeFileSync(name+'-'+version+'.zip', response.data)
            const stats = fs.statSync(name+'-'+version+'.zip')
            if (stats.size == response.headers['content-length']){
                deleteAndExtractZipToLocation(name+'-'+version+'.zip')
            }
        })
        .catch(function (error) {
            console.log(error);
        })
    }
    else{
        let version = await getRemoteVersion(addonVersion)
        axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer' 
        })
        .then((response) => {
            fs.writeFileSync(name+'-'+version+'.zip', response.data)
            const stats = fs.statSync(name+'-'+version+'.zip')
            if (stats.size == response.headers['content-length']){
                deleteAndExtractZipToLocation(name+'-'+version+'.zip')
            }
        })
        .catch(function (error) {
            console.log(error);
        })
    }
    
}

function deleteAndExtractZipToLocation(name){
    let split_name = name.split('-')[0]
    if (split_name === 'AddonSkins'){
        rimraf('C:/Program Files (x86)/World of Warcraft/Interface/AddOns/AddOnSkins', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: 'C:/Program Files (x86)/World of Warcraft/Interface/AddOns' }));
        });
    }
    else if (split_name === 'elvui'){
        rimraf('C:/Program Files (x86)/World of Warcraft/Interface/AddOns/ElvUI', (err) => {
            if (err) console.log(err);
        });
        rimraf('C:/Program Files (x86)/World of Warcraft/Interface/AddOns/ElvUI_Config', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: 'C:/Program Files (x86)/World of Warcraft/Interface/AddOns' }));
        });
    }
    else if (split_name === 'SEL'){
        rimraf('C:/Program Files (x86)/World of Warcraft/Interface/AddOns/ElvUI_SLE', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: 'C:/Program Files (x86)/World of Warcraft/Interface/AddOns' }));
        });
    }
    

}

downloadFile('https://www.tukui.org/downloads/','elvui','https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc')
downloadFile('https://www.tukui.org/addons.php?download=3','AddonSkins', 'https://git.tukui.org/Azilroka/AddOnSkins/raw/master/AddOnSkins.toc')
downloadFile('https://www.tukui.org/addons.php?download=38','SEL', 'https://git.tukui.org/Darth_Predator/elvui-shadowandlight/raw/master/ElvUI_SLE/ElvUI_SLE.toc')