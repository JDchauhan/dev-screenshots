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
    console.log("hi")
    var currDevice = getDevice(deviceName);
    devices.push(currDevice);
    console.log(currDevice);
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
    if(url === "") {
        return false;
    } else {
        console.log(url)
        return true;
    }
}

function submit() {
    filter();
    console.log(devices);
    if (devices.length === 0 || !validateURL()) {
        alert("Improper input");
    } else {
        var xmlhttp = new XMLHttpRequest(); 
        xmlhttp.open("POST", "../");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify({"devices": devices, "url": url }));
    }
}