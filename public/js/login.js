$(function(){
    
    if (getCookie("token") !== "") {
        window.location.href = "/";
    }

    $('#register').click(function(){
        $('.login').attr("style","display:none;");
        $('.register').attr("style","display:inline-block;");
    });

    $('#login').click(function(){
        $('.register').attr("style","display:none;");
        $('.login').attr("style","display:inline-block;");
    });

    $('#login-btn').click(function(){
        let data ={};
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
                var errMsg = JSON.parse(xhr.responseText).message;
                errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);
                
                if(errMsg === 'Validation failed.'){
                    errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
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

    $('#register-btn').click(function(){
        let data ={};
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
                $('#register-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong> You have registered successfully. Please verify your account.' +
                    '</div>'
                );
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg = JSON.parse(xhr.responseText).message;
                errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                if(errMsg === 'Validation failed.'){
                    errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                }
                
                $('#register-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong> ' + errMsg  +
                    '</div>'
                );
            }
        });
    });

});