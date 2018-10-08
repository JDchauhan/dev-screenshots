$(function () {
    $('#admin').hide();
    if (getCookie("token") !== "") {
        window.location.href = "/";
    }

    $(document).on('click', '.payment', function(){
        window.location.href = "/login?action=login_required";
    });
    
    showBody();
    
});