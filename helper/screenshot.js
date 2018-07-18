var puppeteer = require('puppeteer');
var fs = require('file-system');
var responses = require('./responses');

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

    async function setViewports(device, url) {
        var browser = await puppeteer.launch();
        var page = await browser.newPage();
        await page.waitFor(500);
        await page.goto(url);

        // Setting-up viewports 
        await page.setViewport({
            width: device.width,
            height: device.height
        });
        await getScreenshots(device, url, page, browser);
    }


    async function getScreenshots(device, url, page, browser) {
        var new_location = './screenshots/' + device.name + '(' + device.width + '-' + device.height + ')';
        fs.mkdir(new_location, function (err) {
            if (err) { 
            }
        });

        await page.screenshot({
            path: new_location + '/' + "screenshot" + '.png',
            fullPage: true
        });
        browser.close();
    }

    async function getUrlAndResolutions(devices, url) {
        for (let device of devices) {
            await setViewports(device, url);
        }
        responses.successMsg(res, "your files are ready now");
    }
    getUrlAndResolutions(devices, url);
};