$(function () {
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

                if (!data.results.user.isAdmin) {
                    window.location.href = "./admin";
                }
                let name = data.results.user.name;

                email = data.results.user.email;

                name = name.charAt(0).toUpperCase() + name.substr(1);

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

    $(document).on('click', '#search-btn', function () {
        let email = $('#email').val();
        $.get("../adminAcesss/user/" + email, {},
            function (data, status, xhr) {
                console.log(data);

                $('#email1').val(data.results.user.email);
                $('#plan').val(data.results.user.plan);
                $('#admin').val(data.results.user.isAdmin);
                $('#days').val(data.results.user.expires);
                // let time = new Date();
                // let expires = time.setDate(time.getDate() + 15);

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
            console.log(xhr);
        });
    });
});
