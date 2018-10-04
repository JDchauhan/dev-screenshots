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

                email = data.results.user.email;

                name = name.charAt(0).toUpperCase() + name.substr(1);
                plan = data.results.user.plan;
                if (plan) {
                    getPlan = plan.charAt(0).toUpperCase() + plan.substr(1);
                }
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
                $("#pro").attr("href", "./payment");

                if (getPlan) {
                    $("#pro").empty();
                    if (!data.results.user.stripeCustId) {
                        $("#pro").append(getPlan + " ( " + daysLeft + " Days Left )");
                    } else {
                        $("#pro").append(getPlan);
                        $("#pro").attr("href", "#");
                    }
                }

                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }
                showBody();
            }).fail(function (xhr, status, error) {
            var errMsg;

            if (xhr.status === 0) {
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>Network error.</div>'
                );
                showBody();
                return;
            }

            setCookie("token", "", -1);
            window.location.href = "/login?action=login_required";
        });
    }

    $('#reset_btn').click(function () {
        let old_pass = $("#curr_pass").val();
        let new_pass = $("#pass").val();



        if (isPass(old_pass) && isPass(new_pass)) {

        } else {
            $('.alert').hide(500);
            $('#pass-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Password must be 8 character long' +
                '</div>'
            );
            return;
        }

        if (new_pass !== $("#conf_pass").val()) {
            console.log("2");
            $('.alert').hide(500);
            $('#pass-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>new password and confirm password does not match.</div>'
            );
            return;
        }

        if (new_pass === old_pass) {
            console.log("3");
            $('.alert').hide(500);
            $('#pass-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>new password mush not be the current password.</div>'
            );
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

});