var nodemailer = require('nodemailer');
module.exports = {
    'secret': 'noScam'
};

module.exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chauhanarjun00@gmail.com',
      pass: 'CHAUHAN jagdish'
    }
});