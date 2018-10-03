var plan;
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
                    $('#pro').hide();
                }

                email = data.results.user.email;

                let getPlan = data.results.user.plan;

                $("#pro").attr("href", "./payment");

                if (getPlan) {
                    getPlan = getPlan.charAt(0).toUpperCase() + getPlan.substr(1);
                    let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
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

    var handler = StripeCheckout.configure({
        key: 'pk_test_a09RA0CrRjZQFvHO1gcQ1way',
        // key: 'pk_live_pGVo3Zc9MjioSgQsHEtEJTSA',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        source: function (source) {
            source.plan = plan;
            $.ajax({
                url: "../customer/subscription",
                type: 'POST',
                data: JSON.stringify(source),
                contentType: 'application/json',
                success: function (source) {
                    console.log("success");
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("error");
                }
            });
        }
    });

    $('#subscribe').on('click', function () {
        plan = $('#plan').val();
        if (!document.getElementById("tc").checked === true) {
            console.log("please check");
            return;
        }

        handler.open({
            name: 'Hexerve',
            description: 'Screenshot taker tool',
            zipCode: true,
            email: email
        });
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function () {
        handler.close();
    });

});