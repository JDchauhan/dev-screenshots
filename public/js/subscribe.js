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
                }
                $('#pro').hide();
                email = data.results.user.email;

                plan = data.results.user.plan;
                let getPlan;
                if (plan) {
                    getPlan = plan.charAt(0).toUpperCase() + plan.substr(1);
                }

                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }

                if(data.results.user.subscription && data.results.user.subscription.stripeSubsId) {
                    $('.subscribe_plan').hide();
                    $('#planName').text(getPlan);
                    $('.removePlan').show();
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
                    $('.subscribe_plan').hide();
                    
                    $('#planName').text(plan.split("_")[2].charAt(0).toUpperCase() + plan.split("_")[2].substr(1));
                    
                    $('.removePlan').show();
                    $('.alert').hide(500);
                    $('#msg').append(
                        '<div class="alert alert-success alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Congratulation! </strong>Your plan has been subscribed successfully.' +
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
                    $('.alert').hide(500);
                    $('#msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>' + errMsg +
                        '</div>'
                    );
                }
            });
        }
    });

    $('#subscribe').on('click', function () {
        plan = $('#plan').val();
        if (!document.getElementById("tc").checked === true) {
            $('.alert').hide(500);
                    $('#msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>Please accept Terms and Condition by clicking on checkbox.' +
                        '</div>'
                    );
            return;
        }

        handler.open({
            name: 'Hexerve',
            description: 'Screenshot taker tool',
            zipCode: true,
            email: email
        });
    });

    $(document).on('click', '#unsubscribe', function(){
        $.ajax({
            url: "../customer/subscription",
            type: 'DELETE',
            contentType: 'application/json',
            success: function (source) {
                $('.alert').hide(500);
                $('.subscribe_plan').show();
                $('.removePlan').hide();
                $('#msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulation! </strong>Your plan has been unsubscribed successfully.' +
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
                $('.alert').hide(500);
                $('#msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>' + errMsg +
                    '</div>'
                );
            }
        });
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function () {
        handler.close();
    });

});