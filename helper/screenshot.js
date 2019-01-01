var puppeteer = require('puppeteer');
var fs = require('file-system');
var responses = require('./responses');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');
var jwt = require('jsonwebtoken');

var config = require('../config');
var AuthoriseUser = require('../helper/authoriseUser');

var visitTime = {};
var screenshotTime = {};
var startupTime;

var start;
var end;
var isGuest = true;

module.exports.screenshotTaker = function (req, res) {
    var token = req.headers.authorization || req.params.token;
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (!err) {
                isGuest = true;
                var plan;
                req.id = decoded.id;
                AuthoriseUser.getUser(req, res, function (user) {
                    plan = user.plan;

                    switch (plan) {
                        case "lite":
                            if (req.body.devices.length > 5) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> your plan can't take more than 3 screenshots.", null);
                            }
                            if (req.body.urls.length > 5) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> your plan can't take choose than 3 viewports.", null);
                            }
                            break;

                        case "professional":
                            if (req.body.devices.length > 15) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> your plan can't take more than 10 screenshots.", null);
                            }
                            if (req.body.urls.length > 15) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> your plan can't take choose than 10 viewports.", null);
                            }
                            break;

                        case "enterprise":
                            break;
                        default:
                            if (req.body.devices.length > 1) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> free version can't request more than 1 screenshots.", null);
                            } else if (req.body.urls.length > 1) {
                                return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> free version can't take choose than 1 viewports.", null);
                            } else {
                                capture(req, res);
                            }
                    }
                    capture(req, res);
                });
            }
        });
    } else {
        if (req.body.devices.length > 1) {
            return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> free version can't request more than 1 screenshots.", null);
        } else if (req.body.urls.length > 1) {
            return responses.errorMsg(res, 400, "Bad Request", "plan upgradation required!<br/> free version can't take choose than 1 viewports.", null);
        } else {
            capture(req, res);
        }
    }
}

function capture(req, res) {

    start = new Date().getTime();

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
        if (!devices[i].width || devices[i].width < 1 || !devices[i].height ||
            devices[i].height < 1) {
            return responses.errorMsg(res, 400, "Bad Request", "improper device dimentions.", null);
        }
    }

    var urls = req.body.urls;
    var uniqueName = "screenshots_" + new Date().getTime().toString() +
        Math.floor((Math.random() * 100000) + 1) + "1";

    async function setViewports(devices, urls) {
        try {
            var time1 = new Date().getTime();
            var browser = await puppeteer.launch({
                args: ['--no-sandbox'],
                timeout: 0,
            });
            var page = await browser.newPage();
            await page.waitFor(500);
            startupTime = new Date().getTime() - time1;

            for (var i = 0; i < urls.length; i++) {
                var startTime = new Date().getTime();
                try {
                    await page.goto(urls[i].url);
                } catch (err) {
                    urls.splice(i, 1);
                    continue;
                }
                var endTime = new Date().getTime();
                visitTime[urls[i].url] = endTime - startTime;

                for (let device of devices) {
                    // Setting-up viewports
                    await page.setViewport({
                        width: device.width,
                        height: device.height
                    });
                    await getScreenshots(device, urls[i].name, page, browser);
                }
                screenshotTime[urls[i].url] = new Date().getTime() - endTime;
            }
            browser.close();
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
    }

    async function getUrlAndResolutions(devices, urls) {
        await setViewports(devices, urls);

        var file = "downloads/" + uniqueName + '.zip';
        //zip the folder
        var time1 = new Date().getTime();
        zipFolder(uniqueName, file, function (err) {
            if (err) {
                console.log('oh no!', err);
                return responses.errorMsg(res, 500, "Internal Server Error", "some error occured preparing your files.", null);
            } else {
                rimraf(uniqueName, function () {});
                setTimeout(function () {
                    rimraf(file, function () {}); //delete file after 5 minutes of creation 
                }, 300000); //5 * 60 * 1000 // 5 min

                end = new Date().getTime();
                var results = {
                    "filename": uniqueName + ".zip",
                    "totalTime": end - start,
                    "chromeStartup": startupTime,
                    "visitTime": visitTime,
                    "screenshotTime": screenshotTime,
                    "zipTime": end - time1
                };

                responses.successMsg(res, results);
            }
        });
    }
    getUrlAndResolutions(devices, urls);
};