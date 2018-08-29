var config = require('../config');
var transporter = config.transporter;
module.exports.verification_mail = function (email, link) {
    var mailOptions = {
        to: email,
        subject: 'Account Verification',
        html: '<p>Please visit the following link to verify your account</p> <br/>' + link
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};