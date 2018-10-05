var devices = [];
var url;
var isGuest;
var plan = "";
var list = [];
var preset = [];

$(function () {
    $('#admin').hide();
    $(".guest").show();
    $(".logged").hide();
    if (getCookie("token") === "") {
        isGuest = true;
        showBody();
    } else {
        $.ajaxSetup({
            headers: {
                'authorization': getCookie("token")
            }
        });
        $.get("../user/preset", {},
            function (data, status, xhr) {
                console.log(data);
                // let name = data.results.user.name;

                // name = name.charAt(0).toUpperCase() + name.substr(1);

                // $(".username").text(name);

                // currentUserID = data.results.user._id;
                preset = data.results.user.preset;
                for (let i = 0; i < preset.length; i++) {
                    $('#preset-list').append(
                        '<li class="nav-item logged" id="preset_item_' + preset[i]._id + '">' +
                        '<a class="nav-link d-inline  white" href="#" id="preset_' + preset[i]._id + '"><b>' + preset[i].name + '</b></a>' +
                        '<button id="delete_preset_' + preset[i]._id + '" class="close remove_preset_button">×</button>' +
                        '</li>'
                    );
                    $(document).on('click', '#preset_' + preset[i]._id, function () {
                        let index = preset.findIndex(x => x._id === preset[i]._id);
                        //devices = preset[index].devices;
                        currDevices = preset[index].devices;
                        devices = [];

                        Object.values($('input[type=checkbox]')).map(x => x.checked = false);

                        for (let i = 0; i < currDevices.length; i++) {
                            let device = getDevice(currDevices[i].name);
                            if (device && device.height === currDevices[i].height &&
                                device.width === currDevices[i].width) {

                                if (!document.getElementById(device.name).checked === true) {
                                    document.getElementById(device.name).checked = true;
                                    handleChange(device.name);
                                }
                            } else {
                                let index = devices.findIndex(x => (x.name === currDevices[i].name && x.height === currDevices[i].height &&
                                    x.width === currDevices[i].width));
                                if (index === -1) {
                                    devices.push(currDevices[i]);
                                }
                            }
                        }
                    });

                    $(document).on('click', '#delete_preset_' + preset[i]._id, function () {
                        let data = {
                            id: preset[i]._id
                        };

                        $.ajax({
                            url: "../preset",
                            type: 'DELETE',
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            success: function (response) {
                                $('.alert').hide(500);
                                $('.errorDiv').append(
                                    '<div class="alert alert-success alert-dismissible fade show">' +
                                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                    '<strong>Congratulations! </strong>Preset successfully removed' +
                                    '</div>'
                                );
                                $('#preset_item_' + response.results._id).remove();
                                let index = preset.findIndex(x => x._id === response.results._id);
                                preset.splice(index, 1);
                            },
                            error: function (xhr, textStatus, errorThrown) {
                                let errMsg = xhr.responseJSON.message;
                                errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);
                                $('.alert').hide(500);
                                $('.errorDiv').append(
                                    '<div class="alert alert-danger alert-dismissible fade show">' +
                                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                    '<strong>Oops! </strong>' + errMsg +
                                    '</div>'
                                );
                            }
                        });
                    });
                }
                plan = data.results.user.plan;
                let getPlan;
                if (plan) {
                    getPlan = plan.charAt(0).toUpperCase() + plan.substr(1);
                }
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
                $("#pro").attr("href", "/payment");
                
                if (getPlan) {
                    $("#pro").empty();
                    if (data.results.user.subscription && data.results.user.subscription.stripeSubsId) {
                        $("#pro").append(getPlan);
                        $("#pro").attr("href", "/subscribe");
                    } else {
                        $("#pro").append(getPlan + " ( " + daysLeft + " Days Left )");
                    }
                }
                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }

                $(".guest").hide();
                $(".logged").show();
                isGuest = false;
                showBody();
            }).fail(function (xhr, status, error) {
            if (xhr.status === 0) {
                $('.alert').hide(500);
                $('#pass-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>Network error.</div>'
                );
                showBody();
                return;
            }

            setCookie("token", "", -1);
            showBody();
            isGuest = true;
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
            $("footer").removeClass("no-body");
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
            $("footer").removeClass("no-body");
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
        $("footer").removeClass("no-body");
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;
    } else if (this.readyState == 4) {

        document.getElementById("message-heading").innerHTML = this.statusText;
        document.getElementById("message-body").innerHTML = JSON.parse(this.response).message;
        if (JSON.parse(this.response).message.split("!")[0] === "plan upgradation required") {
            document.getElementById("message-body").innerHTML += '<br/> <a href="./payment">Upgrade your Plan</a>';
        }

        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        $("footer").removeClass("no-body");
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;
    }
};



function getDevice(deviceName) {
    var currDevice = {};
    switch (deviceName) {
        case "iMac Retina 5K Display":
            currDevice.name = "iMac Retina 5K Display";
            currDevice.height = 1440;
            currDevice.width = 2560;
            break;


        case "MacBook Pro 15":
            currDevice.name = "MacBook Pro 15";
            currDevice.height = 900;
            currDevice.width = 1440;
            break;


        case "MacBook Pro 13":
            currDevice.name = "MacBook Pro 13";
            currDevice.height = 800;
            currDevice.width = 1280;
            break;

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

        case "iPhone XR":
            currDevice.name = "iPhone XR";
            currDevice.height = 896;
            currDevice.width = 414;
            break;

        case "iPhone 8 Plus":
            currDevice.name = "iPhone 8 Plus";
            currDevice.height = 736;
            currDevice.width = 414;
            break;

        case "iPhone 8":
            currDevice.name = "iPhone 8";
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
    console.log(devices);
    return currDevice;
}

function limitError(count) {
    document.getElementById("message-heading").innerHTML = "<code>Limitations!</code>";
    document.getElementById("message-body").innerHTML = "You can only choose " + count + " devices.<br/>" +
        "Please <a href='../payment'>Upgrade your Plan</a> version for unlimited access.";
    $("#myModal").modal("show");
}

function checkDeviceLimitations() {
    if (isGuest) {
        if (devices.length > 0) {
            limitError(1);
            return -1;
        }
    } else {
        switch (plan) {
            case "lite":
                if (devices.length > 4) {
                    limitError(5);
                    return -1;
                }
                break;

            case "professional":
                if (devices.length > 14) {
                    limitError(15);
                    return -1;
                }
                break;

            case "enterprise":
                break;
            default:
                if (devices.length > 0) {
                    limitError(1);
                    return -1;
                }
        }
    }
}

function checkUrlLimitations() {
    if (isGuest) {
        if (list.length > 0) {
            return -1;
        }
    } else {
        switch (plan) {
            case "lite":
                if (list.length > 4) {
                    return -1;
                }
                break;

            case "professional":
                if (list.length > 14) {
                    return -1;
                }
                break;

            case "enterprise":
                break;
            default:
                if (list.length > 0) {
                    return -1;
                }
        }
    }
}

function add(deviceName) {
    if (checkDeviceLimitations() == -1) {
        document.getElementById(deviceName).checked = false;
        return;
    }

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
        $('.alert').hide(500);
        $("#url_add_err").append(
            '<div class="alert alert-danger fade in alert-dismissible show">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Invalid URLs!</strong> Make sure you have include http/https protocol.' +
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
    if (checkUrlLimitations() == -1) {
        $('.alert').hide(500);
        $("#url_add_err").append(
            '<div class="alert alert-danger fade in alert-dismissible show">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            '<strong>Oops!</strong> Some of your links are not added due to limitation in current package <a href="./payment">Upgrade your Plan</a>.' +
            '</div>'
        );
        return;
    }
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
        $('.alert').hide(500);
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
    $('#viewport_name').val('');
    var item = {
        width: parseInt(width),
        height: parseInt(height),
        name: name
    };
    if (checkDeviceLimitations() == -1) {
        return;
    }
    let index = devices.findIndex(x => (x.name === item.name && x.height === item.height && x.width === item.width));
    if (index === -1) {
        devices.push(item);
    }
    viewViewports();
}

function removeViewport(index) {
    if (document.getElementById(devices[index].name))
        document.getElementById(devices[index].name).checked = false;
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
    $("footer").addClass("no-body");
    document.getElementById("body-container").classList.add("hidden");
    filter();
    if (devices.length === 0) {

        document.getElementById("message-heading").innerHTML = "Invalid Input";
        document.getElementById("message-body").innerHTML = "Please atleast select one device from the list.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        $("footer").removeClass("no-body");
        document.getElementById("body-container").classList.remove("hidden");
        document.getElementById("submit").disabled = false;

    } else if (list.length === 0 && !validateURL(document.getElementById("url").value)) {
        document.getElementById("message-heading").innerHTML = "Invalid URL";
        document.getElementById("message-body").innerHTML = "Please make sure you have included the protocol " +
            "like <code><b>http://</b></code> or <code><b>https://</b></code>.";
        $("#myModal").modal("show");

        document.getElementById("loader").style.display = "none";
        $("footer").removeClass("no-body");
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
        xmlhttp.setRequestHeader('authorization', getCookie("token"));
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
                console.log(url);
                console.log("err");

                $("#url_add_err").empty();
                $('.alert').hide(500);
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
                if (checkUrlLimitations() == -1) {
                    $('.alert').hide(500);
                    $("#url_add_err").append(
                        '<div class="alert alert-danger fade in alert-dismissible show">' +
                        '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                        '<strong>Oops!</strong> Some of your links are not added due to limitation in current package <a href="./payment">Upgrade your Plan</a>.' +
                        '</div>'
                    );
                    return;
                }
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

    $(document).on('click', '#preset_add', function () {
        if (plan == "enterprise") {

        } else if (plan == "professional" && preset.length < 5) {

        } else {
            document.getElementById("message-heading").innerHTML = "Uprgadation Required";
            document.getElementById("message-body").innerHTML = 'Oops! You just reached the limit <br/> <a href="./payment">Upgrade your Plan</a>';
            $("#myModal").modal("show");
            return;
        }
        let data = {};
        data.name = $('#preset_name').val();
        data.devices = devices;

        $.ajax({
            url: "../preset",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (response) {
                $('.alert').hide(500);
                $('.errorDiv').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong>Preset added successfully' +
                    '</div>'
                );
                data._id = response.results._id;
                preset.push(data);
                $('#preset-list').append(
                    '<li class="nav-item logged" id="preset_item_' + response.results._id + '">' +
                    '<a class="nav-link d-inline  white" href="#" id="preset_' + response.results._id + '"><b>' + data.name + '</b></a>' +
                    '<button id="delete_preset_' + response.results._id + '" class="close remove_preset_button">×</button>' +
                    '</li>'
                );
                $(document).on('click', '#preset_' + response.results._id, function () {
                    let index = preset.findIndex(x => x._id === response.results._id);
                    //devices = preset[index].devices;
                    currDevices = preset[index].devices;
                    devices = [];

                    Object.values($('input[type=checkbox]')).map(x => x.checked = false);

                    for (let i = 0; i < currDevices.length; i++) {
                        let device = getDevice(currDevices[i].name);
                        if (device && device.height === currDevices[i].height &&
                            device.width === currDevices[i].width) {

                            if (!document.getElementById(device.name).checked === true) {
                                document.getElementById(device.name).checked = true;
                                handleChange(device.name);
                            }
                        } else {
                            let index = devices.findIndex(x => (x.name === currDevices[i].name && x.height === currDevices[i].height &&
                                x.width === currDevices[i].width));
                            if (index === -1) {
                                devices.push(currDevices[i]);
                            }
                        }
                    }
                });

                $(document).on('click', '#delete_preset_' + response.results._id, function () {

                    let data = {
                        id: response.results._id
                    };

                    $.ajax({
                        url: "../preset",
                        type: 'DELETE',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        success: function (result) {
                            $('.alert').hide(500);
                            $('.errorDiv').append(
                                '<div class="alert alert-success alert-dismissible fade show">' +
                                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                '<strong>Congratulations! </strong>Preset successfully removed' +
                                '</div>'
                            );
                            $('#preset_item_' + response.results._id).remove();
                            let index = preset.findIndex(x => x._id === response.results._id);
                            preset.splice(index, 1);

                        },
                        error: function (xhr, textStatus, errorThrown) {
                            let errMsg = xhr.responseJSON.message;
                            errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);
                            $('.alert').hide(500);
                            $('.errorDiv').append(
                                '<div class="alert alert-danger alert-dismissible fade show">' +
                                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                '<strong>Oops! </strong>' + errMsg +
                                '</div>'
                            );
                        }
                    });
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg;
                if (xhr.status === 0) {
                    errMsg = "Network error.";
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                    if (errMsg === 'Validation failed.') {
                        errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                    }
                }
                $('.alert').hide(500);
                $('.errorDiv').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>' + errMsg +
                    '</div>'
                );
            }
        });

    });

    $('#url').keypress(function (e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#submit').click();
            return false;
        }
    });
    $('.device-row input').keypress(function (e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#submit').click();
            return false;
        }
    });

});