var resend_link;
$(function () {
    $('#resend_link').hide();
    if (getCookie("token") !== "") {
        window.location.href = "/";
    }

    $('#register').click(function () {
        $('.login').attr("style", "display:none;");
        $('#email1').val($('#email').val());
        $('#pass1').val($('#pass').val());
        $('.register').attr("style", "display:inline-block;");
    });

    $('#login').click(function () {
        $('.register').attr("style", "display:none;");
        $('#email').val($('#email1').val());
        $('#pass').val($('#pass1').val());
        $('.login').attr("style", "display:inline-block;");
    });

    $('#login-btn').click(function () {
        let data = {};
        data.email = $('#email').val();
        data.password = $('#pass').val();

        $.ajax({
            url: "../login",
            type: 'POST',
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
                $('#login-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>' + errMsg +
                    '</div>'
                );
            }
        });
    });

    $('#register-btn').click(function () {
        let data = {};
        data.email = $('#email1').val();
        data.password = $('#pass1').val();
        data.name = $('#name').val();
        data.mobile = $('#mobile').val();

        $.ajax({
            url: "../register",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                $('.register').attr("style", "display:none;");
                $('.login').attr("style", "display:inline-block;");

                $('#login-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong> You have registered successfully. Please verify your account.' +
                    '</div>'
                );
                $('#resend_link').attr('onclick', 'resend_link("' + result.results.email + '")');
                $('#resend_link').show();
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

                $('#register-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong> ' + errMsg +
                    '</div>'
                );
            }
        });
    });

    if (window.location.search.substr(1).split("=")[1] === "login_required") {
        $('#login-msg').append(
            '<div class="alert alert-danger alert-dismissible fade show">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<strong>Oops! </strong> Login Required.' +
            '</div>'
        );
    }

    if (window.location.search.substr(1).split("=")[1] === "logout") {
        $('#login-msg').append(
            '<div class="alert alert-success alert-dismissible fade show">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<strong>Congratulation! </strong> You have been successfully Logged out.' +
            '</div>'
        );
    }

    resend_link = function (email) {
        let data = {};
        data .email = email;
        $.ajax({
            url: "../reverify",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                $('#login-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong> Link has been sended successfully.' +
                    '</div>'
                );
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg;
                if (xhr.status === 0) {
                    errMsg = "Network error.";
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);
                }

                $('#login-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong> ' + errMsg +
                    '</div>'
                );
            }
        });
    }

});