var puppeteer = require('puppeteer');
var fs = require('file-system');
var responses = require('./responses');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');

module.exports.capture = function (req, res) {
    if (req.body.devices === undefined || req.body.devices === null ||
        req.body.devices === [] || req.body.devices === "") {
        return responses.errorMsg(res, 400, "Bad Request", "devices not provided.", null);
    }

    if (req.body.url === undefined || req.body.url === "" || req.body.url === null) {
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

    var url = req.body.url;
    var uniqueName = "dev-screenshots_" + new Date().getTime().toString() +
        Math.floor((Math.random() * 100000) + 1) + "1";

    async function setViewports(device, url) {
        var browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            timeout: 10000,
        });
        var page = await browser.newPage();
        await page.waitFor(500);
        try {
            let test = await page.goto(url);
        } catch (err) {
            return "URLErr"
        }

        // Setting-up viewports 
        await page.setViewport({
            width: device.width,
            height: device.height
        });
        await getScreenshots(device, url, page, browser);
    }


    async function getScreenshots(device, url, page, browser) {
        var new_location = uniqueName;
        fs.mkdir(new_location, function (err) {
            if (err) {
                console.log(err);
            }
        });

        await page.screenshot({
            path: new_location + '/' + device.name + '(' + device.width + ' x ' + device.height + ')' + '.png',
            fullPage: true
        });
        browser.close();
    }

    async function getUrlAndResolutions(devices, url) {
        for (let device of devices) {
            let test = await setViewports(device, url);
            if (test === "URLErr")
                return responses.successMsg(res, "URLErr");
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
    getUrlAndResolutions(devices, url);
};