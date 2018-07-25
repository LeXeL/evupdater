var express = require('express');
var fs = require('fs');
const axios = require('axios');
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
        console.log(url+name+'-'+version+'.zip')
        axios({
            url: url+name+'-'+version+'.zip',
            method: 'GET',
            responseType: 'arraybuffer' // important
        })
        .then((response) => {
            fs.writeFileSync(name+'-'+version+'.zip', response.data)
            return name+'-'+version+'.zip'
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
    }
    else{
        let version = await getRemoteVersion(addonVersion)
        axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer' // important
        })
        .then((response) => {
            fs.writeFileSync(name+'-'+version+'.zip', response.data)
            return name+'-'+version+'.zip'
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
    }
    
}




downloadFile('https://www.tukui.org/downloads/','elvui','https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc')
downloadFile('https://www.tukui.org/addons.php?download=3','AddonSkins', 'https://git.tukui.org/Azilroka/AddOnSkins/raw/master/AddOnSkins.toc')
downloadFile('https://www.tukui.org/addons.php?download=38','SEL', 'https://git.tukui.org/Darth_Predator/elvui-shadowandlight/raw/master/ElvUI_SLE/ElvUI_SLE.toc')