$(function () {
    $('#reset_btn').click(function(){
        let data = {};
        data.email = $('#email').val();

        $.ajax({
            url: "../password/forget",
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (data) {
                setCookie("token", data.results.token, 1);
                window.location.href = "/";
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg;
                if (xhr.status === 0) {
                    errMsg = "Network error.";
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                    if (errMsg === 'Validation failed.') {
                        errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                    }
                }
                $('#pass-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>' + errMsg +
                    '</div>'
                );
            }
        });
    });
});