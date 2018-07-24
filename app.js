var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function getRemoteVersion(url){
    var re = /Version: \d+.\d/;
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            let version = $.text().match(re)
            console.log(version[0].split(' ')[1]) //
        }
    }); 
}


getRemoteVersion('https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc')
getRemoteVersion('https://git.tukui.org/Azilroka/AddOnSkins/raw/master/AddOnSkins.toc')
getRemoteVersion('https://git.tukui.org/Darth_Predator/elvui-shadowandlight/raw/master/ElvUI_SLE/ElvUI_SLE.toc')
