var fs = require('fs')
var unzip = require('unzip')
var rimraf = require('rimraf')
var cheerio = require('cheerio')
const axios = require('axios')
const wowLocation = "C:/Program Files (x86)/World of Warcraft/_retail_/Interface/AddOns"
const versionFileName = 'version.json'

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
    let rawdata = fs.readFileSync(versionFileName)
    return JSON.parse(rawdata) 
}

function updateLocalVersion(newcontent){
    let data = JSON.stringify(newcontent);  
    fs.writeFileSync(versionFileName, data);  
}

async function downloadFile(url,name,gitUrl){
    let localVersions = await getLocalVersion()
    if (name === 'elvui'){
        let remoteVersion = await getRemoteVersion(gitUrl)
        if(localVersions['elvui'] == 0 || localVersions < remoteVersion){
            let version = remoteVersion
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
                    localVersions['elvui']=version
                    updateLocalVersion(localVersions)
                }
            })
            .catch(function (error) {
                console.log(`error in download: ${error}`);
            })
        }
        
    }
    else{
        let version = await getRemoteVersion(gitUrl)
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
            console.log(`error in download: ${error}`);
        })
    }
    
}

function deleteFile(name){
    fs.unlink(name, (err) => {
        if (err) console.log(`Error in deleting ${err}`)
        console.log(`[!] file: ${name} was deleted` );
    });
}
function extractZipFile(name){
    let split_name = name.split('-')[0]
    if (split_name === 'AddonSkins'){
        rimraf(wowLocation + '/AddOnSkins', (err) => {
            if (err) console.log(`Error in extracting ${err}`)
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
            deleteFile(name)
        });
    }
    else if (split_name === 'elvui'){
        rimraf(wowLocation + '/ElvUI', (err) => {
            if (err) console.log(`Error in extracting ${err}`)            
        });
        rimraf(wowLocation + '/ElvUI_Config', (err) => {
            if (err) console.log(`Error in extracting ${err}`)            
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
            deleteFile(name)
        });
    }
    else if (split_name === 'SEL'){
        rimraf(wowLocation + '/ElvUI_SLE', (err) => {
            if (err) console.log(`Error in extracting ${err}`)            
            console.log(`Extracting file: ${name}`)
            fs.createReadStream(name).pipe(unzip.Extract({ path: wowLocation }));
            deleteFile(name)
        });
    }
    

}

downloadFile('https://www.tukui.org/downloads/','elvui','https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc')
downloadFile('https://www.tukui.org/addons.php?download=3','AddonSkins', 'https://git.tukui.org/Azilroka/AddOnSkins/raw/master/AddOnSkins.toc')
downloadFile('https://www.tukui.org/addons.php?download=38','SEL', 'https://git.tukui.org/Darth_Predator/elvui-shadowandlight/raw/master/ElvUI_SLE/ElvUI_SLE.toc')