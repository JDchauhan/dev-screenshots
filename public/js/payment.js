var RequestData = {
    key: 'eolzYsVq',
    txnid: 'ishfuewouro3u',
    hash: '',
    amount: '425',
    firstname: '',
    email: '',
    phone: '',
    productinfo: 'Bag',
    surl: 'http://localhost/kontact%20services/NoScam/client/pages/payment.html',
    furl: 'http://localhost/kontact%20services/NoScam/client/pages/payment.html',
};

var email = '';

$(function () {
    if (getCookie("token") === "") {
        window.location.href = "/login";
    } else {
        $.ajaxSetup({
            headers: {
                'authorization': getCookie("token")
            }
        });
        $.get("http://localhost:3000/user", {},
            function (data, status, xhr) {
                console.log(data);
                let name = data.results.user.name;

                email = data.results.user.email;
                RequestData.email = data.results.user.email;
                RequestData.firstname = data.results.user.name;
                RequestData.phone = data.results.user.mobile;

                name = name.charAt(0).toUpperCase() + name.substr(1);

                //$(".username").text(fname + " " + lname);

            }).fail(function (xhr, status, error) {

            setCookie("token", "", -1);
            window.location.href = "/login";
        });
    }

    //open payment dialog
    $(document).on('click', '#payment', function () {
        payumoney();
    });


    //get hash for payment
    function payumoney() {
        // Data to be Sent to API to generate hash.
        let data = {
            'txnid': RequestData.txnid,
            'email': RequestData.email,
            'amount': RequestData.amount,
            'productinfo': RequestData.productinfo,
            'firstname': RequestData.firstname
        }

        // API call to get the Hash value
        fetch('http://localhost:3000/payment/payumoney', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(function (a) {
                return a.json();
            })
            .then(function (json) {
                RequestData.hash = json['hash']
                //  With the hash value in response, we are ready to launch the bolt overlay.
                //Function to launch BOLT   
                console.log(RequestData);
                bolt.launch(RequestData, {
                    responseHandler: function (response) {
                        fetch('http://localhost:3000/payment/payumoney/response', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(response.response)
                            })
                            .then(function (a) {
                                return a.json();
                            })
                            .then(function (json) {
                                console.log(json);
                            });
                    },
                    catchException: function (BOLT) {
                        console.log(BOLT);
                    }
                });
            });
    }



    //stripe

    var handler = StripeCheckout.configure({
        key: 'pk_test_a09RA0CrRjZQFvHO1gcQ1way',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function (token) {
            $.ajax({
                url: "http://localhost:3000/payment/stripe",
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

    document.getElementById('customButton').addEventListener('click', function (e) {
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