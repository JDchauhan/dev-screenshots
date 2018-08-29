$(function(){
    
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
            url: "http://localhost:3000/login",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                console.log("success");
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("err")
            }
        });
    });

    $('#register-btn').click(function(){
        let data ={};
        data.email = $('#email1').val();
        data.password = $('#pass1').val();
        data.name = $('#name').val();
    
        $.ajax({
            url: "http://localhost:3000/register",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                console.log("success");
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("err")
            }
        });
    });

});