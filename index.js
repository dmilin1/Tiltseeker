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

var quotes = [
	"\"Stats are good, winning is better\"",
	"\"We'll use Tiltseeker for week 2 at Worlds\"",
	"\"Please be our friend\"",
	"\"Camp someone who flames as much as Brand\"",
	"\"Camp someone toxic. Like my sister, Cassiopeia\"",
	"\"Would you like a tent?\"",
	"\"Our midlaner has less vision than I do\"",
	"\"With Tiltseeker, you can transform into something better\"",
	"\"Camp someone who has no mana\"",
	"\"Keep camping. See what happens.\"",
];

var authors = [
	" - Faker, probably",
	" - Every NA Team",
	" - Amumu",
	" - Bjergsen, probably",
	" - Katarina",
	" - Losing Midlaner",
	" - Lee Sin",
	" - Kayn",
	" - Tyler1, maybe",
	" - Someone you should keep camping",
];

var myRand = Math.floor(Math.random() * quotes.length);

document.getElementById("quote").textContent = quotes[myRand];

document.getElementById("author").textContent = authors[myRand];

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



//load administrator message
getAdminMsg().then(
	function success(data) {
		console.log(data);
		if (data != "" && getCookie("lastAdminMsg") != data) {
			console.log(document.getElementById("adminmsg").textContent);
			document.getElementById("adminmsgtext").textContent = data;
			document.getElementById("adminmsg").style.opacity = 1;
		} else {
			document.getElementById("adminmsg").style.display = "none";
		}
	},
	function fail(data) {
		console.log("failed to retrieve admin message");
		document.getElementById("adminmsg").style.display = "none";
	}
);

document.getElementById("adminmsgx").addEventListener("click", function(event) {
	document.getElementById("adminmsg").style.opacity = 0;
	document.getElementById("adminmsg").style.display = "none";
	setCookie("lastAdminMsg", document.getElementById("adminmsgtext").textContent, 30);
});

function getAdminMsg() {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			url: '/adminMsg',
			success: function (data) {
				if (data.error == null) {
					resolve(data);
				} else {
					reject(data.error);
				}
			},
			error: function () {
				console.log("Oops! Ajax messed up.");
			}
		});
	});
	return promiseObj;
}