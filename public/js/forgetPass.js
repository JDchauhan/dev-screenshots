$(function () {
    $('#admin').hide();
    $('#reset_btn').click(function(){
        let data = {};
        data.email = $('#email').val();

        if(!isEmail(data.email)){
            $('.alert').hide(500);
            $('#pass-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Incorrect email' +
                '</div>'
            );
            return;
        }

        $.ajax({
            url: "../password/forget",
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (data) {
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulation! </strong>Please click on the link you have recieved</div>'
                );
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
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>' + errMsg +
                    '</div>'
                );
            }
        });
    });
    setTimeout(function(){
        $('#loader').hide();
        $('nav').show();
        $('.body-container').show();
    }, 100);
});