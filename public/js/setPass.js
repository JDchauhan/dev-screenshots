$(function () {
    $('#reset_btn').click(function () {
        if (getCookie("pass_token") === "") {
            window.location.href = "/login?action=login_required";
        } else {
            let new_pass = $("#pass").val();

            if (new_pass !== $("#conf_pass").val()) {
                alert("new password and confirm password does not match");
                return;
            }

            let data = {};
            data.newPassword = new_pass;
            $.ajaxSetup({
                headers: {
                    'authorization': getCookie("pass_token")
                }
            });
            $.ajax({
                url: "../password/set",
                type: 'PUT',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (data) {
                    $('#pass-msg').append(
                        '<div class="alert alert-success alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Congratulation! </strong>Password successfully updated</div>'
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

                    $('#pass-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>' + errMsg +
                        '</div>'
                    );
                }
            });
        }
    });
});