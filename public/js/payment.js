var email = '',
    planID = 1;
let pay;
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

                // name = name.charAt(0).toUpperCase() + name.substr(1);

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

    var handler = StripeCheckout.configure({
        //key: 'pk_test_a09RA0CrRjZQFvHO1gcQ1way',
        key: 'pk_live_pGVo3Zc9MjioSgQsHEtEJTSA',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function (token) {
            $.ajax({
                url: "../payment/stripe/" + planID,
                type: 'POST',
                data: JSON.stringify(token),
                contentType: 'application/json',
                success: function (result) {
                    console.log("success");
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("error");
                }
            });
        }
    });

    $('.payment').on('click', function (e) {
        planID = parseInt(e.currentTarget.getAttribute("planId"));
        $('#payContinue').attr('onclick', 'pay(' + planID + ')');
        $("#myModal").modal("show");
    });

    pay = function(planID){
        planID = parseInt(planID);
        let planAmount = 499;
        switch (planID) {
            case 1:
                break;
            case 2:
                planAmount = 999;
                break;
            case 3:
                planAmount = 1999;
                break;
            default:
                alert("error");
                return;
        }
        //Open Checkout with further options:
        handler.open({
            name: 'Hexerve',
            description: 'Screenshot taker tool',
            zipCode: true,
            amount: planAmount,
            email: email
        });
    };

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function () {
        handler.close();
    });

    setTimeout(function () {
        $('#loader').hide();
        $('nav').show();
        $('.body-container').show();
    }, 100);
});