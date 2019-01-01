module.exports.errorMsg = function (res, statusCode, statusMessage, message, errors) {
    res.statusCode = statusCode;
    res.statusMessage = statusMessage;
    res.send({
        "status": statusCode,
        "message": message,
        "errors": errors
    });
};

module.exports.successMsg = function (res, results) {
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.send({
        "status": 200,
        "message": "OK",
        "results": results
    });
}