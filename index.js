// JavaScript Document

var region = "NA";
if (getCookie('region')) {
	region = getCookie('region');
}

function getRegionID(theRegion) {
	var regions = ["NA", "EUW", "EUNE", "BR", "TR", "RU", "LAN", "LAS", "OCE", "KR", "JP"];
	var regionIDs = ["na1", "euw1", "eun1", "br1", "tr1", "ru", "la1", "la2", "oc1", "kr", "jp1"];
	return regionIDs[regions.indexOf(theRegion)];
}

//region select button event listeners
var regionObjs = document.getElementsByClassName("region-button");
for (var i = 0; i < regionObjs.length; i++) {
	var regions = document.getElementById("region-select").getElementsByTagName("li");
	if (regions[i].textContent == region) {
		document.getElementById(regions[i].textContent).style.backgroundColor = "#111";
	} else {
		document.getElementById(regions[i].textContent).style.backgroundColor = "#333";
	}
	(function (index) {
		regionObjs[index].addEventListener("click", function () {
			region = this.textContent;
			setCookie('region', region, 30);
			console.log(getRegionID(region));
			var regions = document.getElementById("region-select").getElementsByTagName("li");
			for (var i = 0; i < regions.length; i++) {
				if (regions[i].textContent == region) {
					document.getElementById(regions[i].textContent).style.backgroundColor = "#111";
				} else {
					document.getElementById(regions[i].textContent).style.backgroundColor = "#333";
				}
			}
		});
	})(i);
}

//Enter key handler for textbox
document.getElementById("textfield").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submit-button").click();
    }
});

document.getElementById("submit-button").addEventListener("click", function(event) {
	window.location.href = "tiltseek.html?username=" + document.getElementById("textfield").value + "&region=" + getRegionID(region);
});

function selectText(textField) {
	textField.focus();
	textField.select();
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';
}