var devices = [];
var url;

function getDevice(deviceName) {
    var currDevice = {};
    switch (deviceName) {
        case "Laptop HD":
            currDevice.name = "Laptop HD";
            currDevice.height = 1080;
            currDevice.width = 1920;
            break;


        case "Laptop large":
            currDevice.name = "Laptop large";
            currDevice.height = 768;
            currDevice.width = 1366;
            break;


        case "Laptop wxga–wide":
            currDevice.name = "Laptop wxga–wide";
            currDevice.height = 800;
            currDevice.width = 1280;
            break;


        case "iPad Pro":
            currDevice.name = "iPad Pro";
            currDevice.height = 1024;
            currDevice.width = 1366;
            break;

        case "iPad Mini":
            currDevice.name = "iPad Mini";
            currDevice.height = 768;
            currDevice.width = 1024;
            break;

        case "iPhone X":
            currDevice.name = "iPhone X";
            currDevice.height = 812;
            currDevice.width = 375;
            break;

        case "iPhone 8 Plus":
            currDevice.name = "iPhone (8-7-6-6S) Plus";
            currDevice.height = 736;
            currDevice.width = 414;
            break;

        case "iPhone 8":
            currDevice.name = "iPhone 8-7-6-6S";
            currDevice.height = 667;
            currDevice.width = 375;
            break;

        case "iPhone 5":
            currDevice.name = "iPhone 5";
            currDevice.height = 558;
            currDevice.width = 320;
            break;

        case "Nexus 6P":
            currDevice.name = "Nexus 6P";
            currDevice.height = 731;
            currDevice.width = 411;
            break;

        case "Samsung Galaxy Note 5":
            currDevice.name = "Samsung Galaxy Note 5";
            currDevice.height = 853;
            currDevice.width = 480;
            break;

        case "Samsung Galaxy S9":
            currDevice.name = "Samsung Galaxy S9";
            currDevice.height = 740;
            currDevice.width = 360;
            break;

        case "Samsung Galaxy S7":
            currDevice.name = "Samsung Galaxy S7";
            currDevice.height = 640;
            currDevice.width = 360;
            break;

        default:
            currDevice = null;
    }
    return currDevice;
}

function add(deviceName) {
    var currDevice = getDevice(deviceName);
    devices.push(currDevice);
}

function remove(deviceName) {
    index = devices.findIndex(x => x.name === deviceName);
    if (index > -1) {
        devices.splice(index, 1);
    }
}

function handleChange(deviceName) {
    if (document.getElementById(deviceName).checked) {
        add(deviceName);
    } else {
        remove(deviceName);
    }
}

function filter() {
    temp = [];

    for (let i of devices)
        i && temp.push(i); // copy each non-empty value to the 'temp' array

    devices = temp;
    delete temp;
}

function validateURL() {
    url = document.getElementById("url").value.toLowerCase().replace(/\s/g, "");

    if (url === "") {
        return false;
    }

    if (url.indexOf(".") === -1) {
        return false;
    }

    var test = url.split(":");

    if (test[0] !== "http" && test[0] !== "https" && test[0] !== "ftp") {
        return false; //hostname err
    }

    if (test[1].slice(0, 2) !== "//") {
        return false;
    }

    return true;
}

function submit() {
    document.getElementById("")
    document.getElementById("download").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("loader").style.display = "block";
    filter();
    if (devices.length === 0) {

        document.getElementById("message-heading").innerHTML = "Invalid Input";
        document.getElementById("message-body").innerHTML = "Please atleast select one device from the list.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        document.getElementById("submit").disabled = false;

    } else if (!validateURL()) {
        document.getElementById("message-heading").innerHTML = "Invalid URL";
        document.getElementById("message-body").innerHTML = "Please make sure you have included the protocol " +
            "like <code><b>http://</b></code> or <code><b>https://</b></code>.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        document.getElementById("submit").disabled = false;

    } else {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (JSON.parse(this.response).results === "URLErr") {

                    document.getElementById("message-heading").innerHTML = "Unreachable URL";
                    document.getElementById("message-body").innerHTML = "Make sure you have typed correct URL including the protocol " +
                        "like <code><b>http://</b></code> or <code><b>https://</b></code>.";
                    $("#myModal").modal("show");

                    document.getElementById("loader").style.display = "none";
                    document.getElementById("submit").disabled = false;

                } else {
                    var filename = JSON.parse(this.response).results.filename;
                    document.getElementById("download").setAttribute("onclick",
                        "window.open('download/" + filename + "','_self')");

                    document.getElementById("download").disabled = false;
                    document.getElementById("message-heading").innerHTML = "Congratulations";
                    document.getElementById("message-body").innerHTML = "Your file is ready, click on download button.";
                    $("#myModal").modal("show");

                    document.getElementById("loader").style.display = "none";
                    document.getElementById("submit").disabled = false;

                }
            } else if (this.readyState == 4 && this.status == 0) {
                document.getElementById("message-heading").innerHTML = "Network Error";
                document.getElementById("message-body").innerHTML = "Can't reach server! Check your Internet connection";
                $("#myModal").modal("show");

                document.getElementById("loader").style.display = "none";
                document.getElementById("submit").disabled = false;
            }
        };
        xmlhttp.open("POST", "../");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify({
            "devices": devices,
            "url": url
        }));
    }
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});