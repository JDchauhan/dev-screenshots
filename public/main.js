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
    document.getElementById("")
    document.getElementById("download").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("loader").style.display = "block";
    filter();
    if (devices.length === 0 || !validateURL()) {
        
        document.getElementById("message-heading").innerHTML = "Error";
        document.getElementById("message-body").innerHTML = "Improper Input";
        $("#myModal").modal("show");
        
        document.getElementById("loader").style.display = "none";
        document.getElementById("submit").disabled = false;
    
    } else {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (JSON.parse(this.response).results === "URLErr") {
        
                    document.getElementById("message-heading").innerHTML = "Unreachable URL";
                    document.getElementById("message-body").innerHTML = "Make sure you have typed correct URL including http/https";
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
            }else if(this.readyState == 4 && this.status == 0){
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