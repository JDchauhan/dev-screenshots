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

                plan = data.results.user.plan;
                plan = plan.charAt(0).toUpperCase() + plan.substr(1);
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));

                if (plan) {
                    $("#pro").empty();
                    $("#pro").append(plan + " ( " + daysLeft + " Days Left )");
                }
                $("#pro").attr("href", "./payment");

                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }
                showBody();
            }).fail(function (xhr, status, error) {
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

    $.get("../user/transaction", {},
        function (data, status, xhr) {
            console.log(data);

            if(data.results.length === 0){
                $('.alert').hide(500);
                $('#err-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>No record found.</div>'
                );
                return;    
            }

            for(let i = 0; i < data.results.length; i++){
                $('tbody').append(
                    '<tr>' +
                        '<td>' + i + '</td>' +
                        '<td class="break">' + data.results[i].txnID + '</td>' +
                        '<td class=""><b>$ ' + (parseInt(data.results[i].amount) / 100) + '</b></td>' +
                        '<td>' + (String)(new Date(data.results[i].generation_timestamp)).split(' GMT')[0] + '</td>' +
                    '</tr>'
                );
            }

        }).fail(function (xhr, status, error) {
        if (xhr.status === 0) {
            $('.alert').hide(500);
            $('#err-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Network error.</div>'
            );
            return;
        }
    });
});