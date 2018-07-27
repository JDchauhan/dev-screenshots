var puppeteer = require('puppeteer');
var fs = require('file-system');
var responses = require('./responses');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');

module.exports.capture = function (req, res) {
    req.setTimeout(0); //no time out
    if (req.body.devices === undefined || req.body.devices === null ||
        req.body.devices === [] || req.body.devices === "") {
        return responses.errorMsg(res, 400, "Bad Request", "devices not provided.", null);
    }

    if (req.body.urls === undefined || req.body.urls === "" || req.body.urls === null) {
        return responses.errorMsg(res, 400, "Bad Request", "url not provided.", null);
    }

    var devices = req.body.devices;

    if (typeof (devices) !== "object" || devices.length < 1 || Object.keys(devices).length === 0) {
        return responses.errorMsg(res, 400, "Bad Request", "improper devices format.", null);
    }
    for (i = 0; i < devices.length; i++) {
        if (!devices[i].name || devices[i].name === "") {
            return responses.errorMsg(res, 400, "Bad Request", "device name not provided.", null);
        }
        if (!devices[i].width || devices[i].width < 140 || !devices[i].height ||
            devices[i].height < 140) {
            return responses.errorMsg(res, 400, "Bad Request", "improper device dimentions.", null);
        }
    }

    var urls = req.body.urls;
    var uniqueName = "screenshots_" + new Date().getTime().toString() +
        Math.floor((Math.random() * 100000) + 1) + "1";

    async function setViewports(device, urls) {
        try {
            var browser = await puppeteer.launch({
                args: ['--no-sandbox'],
                timeout: 0,
            });
            var page = await browser.newPage();
            await page.waitFor(500);

            
            for( var i = 0; i < urls.length; i++){
                try {
                    await page.goto(urls[i].url);
                } catch (err){
                    urls.splice(i, 1);
                    continue;
                }
                
                // Setting-up viewports 
                await page.setViewport({
                    width: device.width,
                    height: device.height
                });
                await getScreenshots(device, urls[i].name, page, browser);
            }
        } catch (err) {
            console.log(err)
            return "URLErr"
        }
    }


    async function getScreenshots(device, location, page, browser) {
        var new_location = uniqueName + '/' + location;
        fs.mkdir(new_location, function (err) {
            if (err) {
                console.log(err);
            }
        });

        await page.screenshot({
            path: new_location + '/' + device.name + '(' + device.width + ' x ' + device.height + ')_' +
                Math.floor((Math.random() * 100000) + 1) + '.png',
            fullPage: true
        });
        browser.close();
    }

    async function getUrlAndResolutions(devices, urls) {
        for (let device of devices) {
            
            let test = await setViewports(device, urls);
            /*if (test === "URLErr")
                return responses.successMsg(res, "URLErr");
            */
        }

        var file = "downloads/" + uniqueName + '.zip';
        //zip the folder
        zipFolder(uniqueName, file, function (err) {
            if (err) {
                console.log('oh no!', err);
                return responses.errorMsg(res, 500, "Internal Server Error", "some error occured preparing your files.", null);
            } else {
                rimraf(uniqueName, function () {});
                var results = {
                    "filename": uniqueName + ".zip"
                };

                setTimeout(function () {
                    rimraf(file, function () {}); //delete file after 5 minutes of creation 
                }, 300000); //5 * 60 * 1000 // 5 min
                responses.successMsg(res, results);
            }
        });
    }
    getUrlAndResolutions(devices, urls);
};