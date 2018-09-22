var plan = "";

$(function () {
    $('#admin').hide();
    if (getCookie("token") === "") {
        window.location.href = "/login?action=login_required";
    } else {
        $.ajaxSetup({
            headers: {
                'authorization': getCookie("token")
            }
        });
        $.get("../user", {},
            function (data, status, xhr) {
                console.log(data);
                let name = data.results.user.name;
                if (data.results.user.isAdmin) {
                    $('#admin').show();
                }
                email = data.results.user.email;

                name = name.charAt(0).toUpperCase() + name.substr(1);
                plan = data.results.user.plan;
                if (plan) {
                    $("#pro").empty();
                    $("#pro").append("Plan (" + plan + ")");
                }
                $("#pro").attr("href", "./payment");

            }).fail(function (xhr, status, error) {
            var errMsg;

            if (xhr.status === 0) {
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>Network error.</div>'
                );
                return;
            }

            setCookie("token", "", -1);
            window.location.href = "/login?action=login_required";
        });
    }

    $('#reset_btn').click(function () {
        let old_pass = $("#curr_pass").val();
        let new_pass = $("#pass").val();

        if (isText(old_pass) && isText(new_pass)) {
            $('.alert').hide(500);
            $('#pass-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Password must be 8 character long'  +
                '</div>'
            );
        } else {
            return;
        }

        if (new_pass !== $("#conf_pass").val()) {
            alert("new password and confirm password does not match");
            return;
        }

        if (new_pass === old_pass) {
            alert("new password mush not be the current password");
            return;
        }

        let data = {};
        data.password = old_pass;
        data.newPassword = new_pass;

        $.ajax({
            url: "../password/reset",
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (data) {
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    'Your password has been successfully updated</div>'
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