var devices = [];
var url;

function getDevice(deviceName) {
    var currDevice = {};
    switch (deviceName) {
        case "small":
            currDevice.name = "small";
            currDevice.height = 360;
            currDevice.width = 480;
            break;

        case "medium":
            currDevice.name = "medium";
            currDevice.height = 480;
            currDevice.width = 640;
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
    url = document.getElementById("url").value;
    if (url === "") {
        return false;
    } else {
        return true;
    }
}

function submit() {
    document.getElementById("download").disabled = true;
    filter();
    if (devices.length === 0 || !validateURL()) {
        document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<strong>Error!</strong> Improper Input.' +
            '</div>';
    } else {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (JSON.parse(this.response).results === "URLErr"){
                    document.getElementById("message").innerHTML =
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Error!</strong> Unreachable URL. Make sure you have typed correct URL including http/https' +
                        '</div>';
                }else {
                    var filename = JSON.parse(this.response).results.filename;
                    document.getElementById("download").setAttribute("onclick",
                        "window.open('download/" + filename + "','_self')");
                    document.getElementById("download").disabled = false;
                    document.getElementById("message").innerHTML =
                        '<div class="alert alert-success alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Success!</strong> File is ready, click on download button.' +
                        '</div>';
                }
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