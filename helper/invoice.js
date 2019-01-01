var ejs = require("ejs");
var config = require('../config');
var transporter = config.transporter;
var rimraf = require('rimraf');

var puppeteer = require('puppeteer');

async function create(email, type, Id, plan, amount, name) {
    var browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        timeout: 0,
    });
    var page = await browser.newPage();
    await page.waitFor(500);
    let email_1 = email.split('@')[0];
    let email_2 = email.split('@')[1];
    let pathval = 'https://screenshot.hexerve.com/invoice/' + email_1 + '/' + email_2 +
        '/' + type + '/' + Id + '/' + plan + '/' + amount;
    console.log(pathval);
    try {
        await page.goto(pathval);
    } catch (err) {
        console.log(err);
    }
    await page.pdf({
        'path': 'downloads/invoice/' + name,
        printBackground: true
    });
    browser.close();
}

module.exports.sendInvoice = async function (email, type, stripeSubsId, plan, amount) {
    let name = new Date().getTime() + Math.round(100000 * Math.random()) + '.pdf';

    await create(email, type, stripeSubsId, plan, amount, name);

    setTimeout(function () {
        rimraf('downloads/invoice/' + name, function () {}); //delete file after 5 minutes of creation 
    }, 300000); //5 * 60 * 1000 // 5 min
    
    ejs.renderFile(__dirname + "/email.ejs", {
        task: 'subscribe',
        plan: plan
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mailOptions = {
                to: email,
                from: 'Hexerve Solutions <info@hexerve.com>',
                subject: 'Plan successfully subscribed',
                html: data,
                attachments: [{
                    filename: 'invoice.pdf',
                    path: 'downloads/invoice/' + name,
                    contentType: 'application/pdf'
                }]
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    });
};