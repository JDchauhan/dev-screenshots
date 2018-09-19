function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function logout() {
    setCookie("token", "", -1);
}

function isEmail(email) {
    if (email != "" && email.lastIndexOf('.') != -1 && email.lastIndexOf('@') != -1 &&
        email.lastIndexOf('.') - email.lastIndexOf("@") > 2) {
        return true;
    }
    return false;
}

function isMobile(mobile) {
    if (isNaN(mobile) || mobile.length < 5) {
        return false;
    }
    return true;
}

function isText(text) {
    if (text.length > 2) {
        return true;
    }
    return false;
}

function isPass(pass) {
    if (pass.length < 8) {
        return false;
    }
    return true;
}

$(function () {
    $(document).on('click', 'input', function(){
        $('.alert').hide(500);
    });

    $(document).on('click', '', function (e) {
        if ($('.collapsibleNavbar').hasClass('show')) {
            $('#nav-toggler').click();
        }
    });

    $(document).on('mouseover', '#preset_nav_list', function(){
        $('#preset-list').addClass('show');
    });

    $(document).on('mouseout', '#preset_nav_list', function(){
        $('#preset-list').removeClass('show');
    });

    $(document).on('mouseover', '#account-list', function(){
        $('#account-list-menu').addClass('show')
    });

    $(document).on('mouseout', '#account-list', function(){
        $('#account-list-menu').removeClass('show');
    });
});
