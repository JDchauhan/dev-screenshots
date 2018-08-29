'use strict';
module.exports = function (app) {
    var rimraf = require('rimraf');
    var fs = require('fs');

    var screenshot = require('../helper/screenshot');
    var responses = require('../helper/responses');

    // user Routes
    app.get("/", function (req, res) {
        res.render("login");
    });

    app.post("/login", function (req, res) {
        res.send(req.body);
    });

    app.post("/register", function (req, res) {
        res.send(req.body);
    });

    app.get("/dashboard", function (req, res) {
        var error;
        if(req.query.fileErr &&  req.query.fileErr ==="true" ){
            error = true;
        }else{
            error = false;
        }
        res.render("dashboard", {
            error: error
        });
    });

    app.post("/", screenshot.capture);

    app.get("/download/:filename", function (req, res) {
        var file = "downloads/" + req.params.filename;
        if (fs.existsSync(file)) {
            res.download(file);
        }else{
            res.redirect(301, "../?fileErr=true");
        }
    });

    // star routes
    app.get('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.put('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.delete('*', function (req, res) {
        res.redirect(301, "../");
    });

    app.post('*', function (req, res) {
        res.redirect(301, "../");
    });

};