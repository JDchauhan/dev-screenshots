'use strict';
module.exports = function (app) {
    var rimraf = require('rimraf');
    var fs = require('fs');

    var screenshot = require('../helper/screenshot');
    var responses = require('../helper/responses');

    // user Routes
    app.get("/", function (req, res) {
        res.render("index", {
            error: false
        });
    });

    app.post("/", screenshot.capture);

    app.get("/download/:filename", function (req, res) {
        var file = "downloads/" + req.params.filename;
        if (fs.existsSync(file)) {
            res.download(file);
        }else{
            res.render("index", {
                error: true
            });
            //return responses.errorMsg(res, 404, "Not Found", "file not found.", null);
        }
    });

    // star routes
    app.get('*', function (req, res) {
        res.render("index", {
            error: false
        });
    });

    app.put('*', function (req, res) {
        res.render("index", {
            error: false
        });
    });

    app.delete('*', function (req, res) {
        res.render("index", {
            error: false
        });
    });

    app.post('*', function (req, res) {
        res.render("index", {
            error: false
        });
    });

};