var devices = [];
var url;
var list = [];

$(function () {
    if (getCookie("token") === "") {
        window.location.href = "../";
    } else {
        $.ajaxSetup({
            headers: {
                'authorization': getCookie("token")
            }
        });
        $.get("http://localhost:3000/user", {},
            function (data, status, xhr) {
                console.log(data);
                // let name = data.results.user.name;
                
                // name = name.charAt(0).toUpperCase() + name.substr(1);

                // $(".username").text(name);

                // currentUserID = data.results.user._id;

            }).fail(function (xhr, status, error) {

            setCookie("token", "", -1);
            window.location.href = "../";
        });
    }
});

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        if (JSON.parse(this.response).results === "URLErr") {

            document.getElementById("message-heading").innerHTML = "Unreachable URL";
            document.getElementById("message-body").innerHTML = "Make sure you have typed correct URL including the protocol " +
                "like <code><b>http://</b></code> or <code><b>https://</b></code>.";
            $("#myModal").modal("show");

            document.getElementById("loader").style.display = "none";
            document.getElementById("body-container").classList.remove("hidden");
            document.getElementById("submit").disabled = false;

        } else {
            var results = JSON.parse(this.response).results;
            var filename = results.filename;
            var url = 'download/' + filename;
            window.open(url);

            var tableData = "";
            for (let i = 0; i < list.length; i++) {
                var key = list[i].url;
                tableData +=
                    "<Tr>" +
                    "<Td class='url_td'>" + key + "</Td>" +
                    "<Td class='visit_time_td'>" + (Math.round(results.visitTime[key] / 100) / 10) + "s </Td>" +
                    "<Td  class='ss_time_td'>" + (Math.round(results.screenshotTime[key] / 100) / 10) + "s </Td>" +
                    "</tr>";
            }

            document.getElementById("message-heading").innerHTML = "Congratulations";
            document.getElementById("message-body").innerHTML =
                "Your file is ready, click on download button.<br/>" +
                "<Table class='timestamps width_60'>" +
                "<Tr>" +
                "<Th>Total Time</Th>" +
                "<Td>" + (Math.round(results.totalTime / 100) / 10) + "s </Td>" +
                "</Tr>" +
                "<Tr>" +
                "<Th>Startup Time</Th>" +
                "<Td>" + (Math.round(results.chromeStartup / 100) / 10) + "s </Td>" +
                "</Tr>" +
                "<Tr>" +
                "<Th>Zip Time</Th>" +
                "<Td>" + (Math.round(results.zipTime / 100) / 10) + "s </Td>" +
                "</Tr>" +
                "<Table>" +

                "<Table class='timestamps table-striped urls_timestamp'>" +
                "<Thead>" +
                "<Tr>" +
                "<Th class='url_td'>URL</Th>" +
                "<Th class='visit_time_td'>Load Time</Th>" +
                "<Th class='ss_time_td'>Screenshot Time</Th>" +
                "</Tr>" +
                "</Thead>" +
                "<Tbody>" +
                tableData +
                "</Tbody>" +
                "<Table>";



            document.getElementById("success_audio").play();
            $("#myModal").modal("show");

            list = [];
            document.getElementById("loader").style.display = "none";
            document.getElementById("body-container").classList.remove("hidden");

            document.getElementById("submit").disabled = false;
            document.getElementById("url").placeholder = 'https://www.hexerve.com';
            document.getElementById("url").disabled = false;
            document.getElementById("addList_icon").className = "fa fa-search-plus";
        }
    } else if (this.readyState == 4 && this.status == 0) {
        document.getElementById("message-heading").innerHTML = "Network Error";
        document.getElementById("message-body").innerHTML = "Can't reach server! Check your Internet connection";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;
    }
};



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

        case "Samsung Galaxy Note 9":
            currDevice.name = "Samsung Galaxy Note 9";
            currDevice.height = 2960;
            currDevice.width = 1440;
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

function validateURL(url) {
    url = url.toLowerCase().replace(/\s/g, "");

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

function removeList(index) {
    list.splice(index, 1);
    viewList();
}

function addList() {
    var name = $('#name_insert').val();
    var url = $('#url_insert').val();
    if (!validateURL(url)) {
        console.log("err");

        $("#url_add_err").empty();
        $("#url_add_err").append(
            '<div class="alert alert-danger fade in alert-dismissible show">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Invalid URL!</strong> Make sure you have include http/https protocol.' +
            '</div>'
        );

        return;
    }
    $('#name_insert').val('');
    $('#url_insert').val('');
    var item = {
        name: name,
        url: url
    };
    list.push(item);
    viewList();
}

function viewList() {
    $("#list").empty();
    $("#list").append(
        "<table class='table table-striped'>" +
        "<thead>" +
        "<tr>" +
        "<th class='sno'>S.No.</th>" +
        "<th class='name'>Folder Name</th>" +
        "<th class='url'>URL</th>" +
        "<th class='remove'>Remove</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='list_table'></tbody>" +
        "</table>"
    );

    for (i = 0; i < list.length; i++) {
        $("#list_table").append(
            "<tr  id='list" + i + "'>" +
            "<td class='sno'>" + (i + 1) + "</td>" +
            "<td class='name'>" + list[i].name + "</td>" +
            "<td class='url'>" + list[i].url + "</td>" +
            "<td class='remove'><button onclick='removeList(" + i + ")' class='close' id='remove_button'>&times;</button></td>" +
            "</tr>"
        );
    }
    $("#listModal").modal("show");
}

function submitList() {
    if (list.length !== 0) {
        document.getElementById("url").value = '';
        document.getElementById("url").placeholder = 'Links copied';
        document.getElementById("url").disabled = true;
        document.getElementById("addList_icon").className = "fa fa-eye";
    } else {
        document.getElementById("url").placeholder = 'https://www.hexerve.com';
        document.getElementById("url").disabled = false;
        document.getElementById("addList_icon").className = "fa fa-search-plus";
    }
}

function addViewports() {
    var height = $('#viewport_height').val();
    var width = $('#viewport_width').val();
    var name = $('#viewport_name').val();
    if (isNaN(height) || isNaN(width)) {
        console.log("err");

        $("#viewport_add_err").empty();
        $("#viewport_add_err").append(
            '<div class="alert alert-danger fade in alert-dismissible show">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Invalid Viewport!</strong> Please enter a correct vieport sizes.' +
            '</div>'
        );

        return;
    }

    if (name === "") {
        name = "test";
    }

    $('#viewport_height').val('');
    $('#viewport_width').val('');
    var item = {
        width: parseInt(width),
        height: parseInt(height),
        name: name
    };
    devices.push(item);
    viewViewports();
}

function removeViewport(index) {
    devices.splice(index, 1);
    viewViewports();
}

function viewViewports() {
    $("#viewportList").empty();
    $("#viewportList").append(
        "<table class='table table-striped'>" +
        "<thead>" +
        "<tr>" +
        "<th class='sno'>S.No.</th>" +
        "<th class='name'>Name</th>" +
        "<th class='height'>Height</th>" +
        "<th class='width'>Width</th>" +
        "<th class='remove'>Remove</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='viewport_list_table'></tbody>" +
        "</table>"
    );

    for (i = 0; i < devices.length; i++) {
        $("#viewport_list_table").append(
            "<tr  id='viewportList" + i + "'>" +
            "<td class='sno'>" + (i + 1) + "</td>" +
            "<td class='name'>" + devices[i].name + "</td>" +
            "<td class='height'>" + devices[i].height + "</td>" +
            "<td class='width'>" + devices[i].width + "</td>" +
            "<td class='remove'><button onclick='removeViewport(" + i + ")' class='close' id='remove_button'>&times;</button></td>" +
            "</tr>"
        );
    }
    $("#devicesListModal").modal("show");
}

function submit() {
    document.getElementById("submit").disabled = true;
    document.getElementById("loader").style.display = "block";
    document.getElementById("body-container").classList.add("hidden");
    filter();
    if (devices.length === 0) {

        document.getElementById("message-heading").innerHTML = "Invalid Input";
        document.getElementById("message-body").innerHTML = "Please atleast select one device from the list.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;

    } else if (list.length === 0 && !validateURL(document.getElementById("url").value)) {
        document.getElementById("message-heading").innerHTML = "Invalid URL";
        document.getElementById("message-body").innerHTML = "Please make sure you have included the protocol " +
            "like <code><b>http://</b></code> or <code><b>https://</b></code>.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;

    } else {
        if (list.length === 0) {
            url = document.getElementById("url").value.toLowerCase().replace(/\s/g, "");
            list = [{
                name: '',
                url: url
            }];
        }

        xmlhttp.open("POST", "../");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify({
            "devices": devices,
            "urls": list
        }));
    }
}

// // Set the date we're counting down to
// var countDownDate = new Date("Sep 5, 2018 15:37:25").getTime();

// // Update the count down every 1 second
// var x = setInterval(function () {

//     // Get todays date and time
//     var now = new Date().getTime();

//     // Find the distance between now an the count down date
//     var distance = countDownDate - now;

//     // Time calculations for days, hours, minutes and seconds
//     var days = Math.floor(distance / (1000 * 60 * 60 * 24));
//     var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//     var seconds = Math.floor((distance % (1000 * 60)) / 1000);

//     // Output the result in an element with id="timer"
//     document.getElementById("timer").innerHTML = days + "d " + hours + "h " +
//         minutes + "m " + seconds + "s ";

//     // If the count down is over, write some text 
//     if (distance < 0) {
//         clearInterval(x);
//         document.getElementById("timer").innerHTML = "EXPIRED";
//     }
// }, 1000);

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();

    // method to add data to list from file
    function addFileToList(data) {
        for (var i = 0; i < data.length; i++) {
            var curr_data = data[i].split(/,/);
            var name = curr_data[0];
            var url = curr_data[1];

            if (!validateURL(url)) {
                console.log("err");

                $("#url_add_err").empty();
                $("#url_add_err").append(
                    '<div class="alert alert-danger fade in alert-dismissible show">' +
                    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                    '<strong>Invalid URLs!</strong> Make sure you have include http/https protocol.' +
                    '</div>'
                );
            } else {
                var item = {
                    name: name,
                    url: url
                };
                list.push(item);
                viewList();
            }
        }
    }


    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', upload, false);

    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(evt) {
        if (!browserSupportFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                var csvData = event.target.result;
                data = csvData.split(/\n/);
                data = data.filter(v => v != '');

                if (data && data.length > 0) {
                    addFileToList(data);
                } else {
                    alert('No data to import!');
                }
            };
            reader.onerror = function () {
                alert('Unable to read ' + file.fileName);
            };
        }
    }
});