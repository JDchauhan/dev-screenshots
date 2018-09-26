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
                $('#name').val(data.results.user.name);
                $('#mobile').val(data.results.user.mobile);
                plan = data.results.user.plan;
                plan = plan.charAt(0).toUpperCase() + plan.substr(1);
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));

                if (plan) {
                    $("#pro").empty();
                    $("#pro").append(plan + " ( " + daysLeft + " Days Left )");
                }
                $("#pro").attr("href", "./payment");

            }).fail(function (xhr, status, error) {
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

    $(document).on('click', '#update-btn', function () {
        let name = $('#name').val();
        let mob = $('#mobile').val();

        if (isText(name) && isMobile(mob)) {
            let data = {};
            data.name = name;
            data.mobile = mob;
            $.ajax({
                url: "../user",
                type: 'PUT',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (result) {
                    $('.alert').hide(500);
                    $('#list-msg').append(
                        '<div class="alert alert-success alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Congratulations! </strong> Your profile has been succesfully updated.' +
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

                        if (errMsg === 'Validation failed.') {
                            errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                        }
                    }

                    $('.alert').hide(500);
                    $('#list-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong> ' + errMsg +
                        '</div>'
                    );
                }
            });
        } else if (!isText(name)) {
            $('.alert').hide(500);
            $('#list-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Invalid name' +
                '</div>'
            );
        } else {
            $('.alert').hide(500);
            $('#list-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Invalid Mobile number' +
                '</div>'
            );
        }
    });

    setTimeout(function () {
        $('#loader').hide();
        $('nav').show();
        $('.body-container').show();
    }, 100);
});