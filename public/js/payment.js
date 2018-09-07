var email = '';

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
                let name = data.results.user.name;

                email = data.results.user.email;

                name = name.charAt(0).toUpperCase() + name.substr(1);

            }).fail(function (xhr, status, error) {
            if (xhr.status === 0) {
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
        key: 'pk_test_a09RA0CrRjZQFvHO1gcQ1way',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function (token) {
            $.ajax({
                url: "../payment/stripe",
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

    document.getElementById('stripeBtn').addEventListener('click', function (e) {
        // Open Checkout with further options:
        handler.open({
            name: 'Hexerve',
            description: 'Screenshot taker tool',
            zipCode: true,
            amount: 599,
            email: email
        });
        e.preventDefault();
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function () {
        handler.close();
    });
});