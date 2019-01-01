$(function () {
    $('#admin').hide();
    $(".guest").show();
    $(".logged").hide();

    if (getCookie("token") === "") {
        showBody();
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
                $('#name').val(data.results.user.name);
                $('#mobile').val(data.results.user.mobile);
                plan = data.results.user.plan;
                let getPlan;
                if (plan) {
                    getPlan = plan.charAt(0).toUpperCase() + plan.substr(1);
                }
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
                $("#pro").attr("href", "/payment");

                if (getPlan) {
                    $("#pro").empty();
                    if (data.results.user.subscription && data.results.user.subscription.stripeSubsId) {
                        $("#pro").append(getPlan);
                        $("#pro").attr("href", "/subscribe");
                    } else {
                        $("#pro").append(getPlan + " ( " + daysLeft + " Days Left )");
                    }
                }

                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }
                showBody();
                $(".guest").hide();
                $(".logged").show();

            }).fail(function (xhr, status, error) {
            if (xhr.status === 0) {
                showBody();
                return;
            }
        });
    }

});