var express = require('express');
var fs = require('fs');
var unzip = require('unzip');
const axios = require('axios');
var rimraf = require('rimraf');
var cheerio = require('cheerio');
var app     = express();
const wowLocation = "C:/Program Files (x86)/World of Warcraft/_retail_/Interface/AddOns"

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
function getLocalVersion(){

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
                extractZipFile(name+'-'+version+'.zip')
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
                extractZipFile(name+'-'+version+'.zip')
            }
        })
        .catch(function (error) {
            console.log(error);
        })
    }
    
}

function deleteFile(name){
    fs.unlink(name, (err) => {
        if (err) throw err;
        console.log(`[!] file: ${name} was deleted` );
    });
}
function extractZipFile(name){
    let split_name = name.split('-')[0]
    if (split_name === 'AddonSkins'){
        rimraf(wowLocation + '/AddOnSkins', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
        });
        deleteFile(name)
    }
    else if (split_name === 'elvui'){
        rimraf(wowLocation + '/ElvUI', (err) => {
            if (err) console.log(err);
        });
        rimraf(wowLocation + '/ElvUI_Config', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
        });
        deleteFile(name)
    }
    else if (split_name === 'SEL'){
        rimraf(wowLocation + '/ElvUI_SLE', (err) => {
            if (err) console.log(err);
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
        });
        deleteFile(name)
    }
    

}

downloadFile('https://www.tukui.org/downloads/','elvui','https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc')
downloadFile('https://www.tukui.org/addons.php?download=3','AddonSkins', 'https://git.tukui.org/Azilroka/AddOnSkins/raw/master/AddOnSkins.toc')
downloadFile('https://www.tukui.org/addons.php?download=38','SEL', 'https://git.tukui.org/Darth_Predator/elvui-shadowandlight/raw/master/ElvUI_SLE/ElvUI_SLE.toc')