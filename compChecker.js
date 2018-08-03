// JavaScript Document

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


//set borders on ads
window.setInterval(function fixBorders() {
	var ads = document.getElementsByClassName("ad");
	for (var i = 0; i < ads.length; i++) {
		console.log(ads[i].children[0].children.length);
		if (ads[i].children[0].children.length  <= 0) {
			ads[i].style.borderStyle = "none";
			ads[i].style.padding = "0px";
			document.getElementsByClassName("leftBanner")[0].style.borderStyle = "none";
			document.getElementsByClassName("rightBanner")[0].style.borderStyle = "none";
		} else {
			ads[i].style.borderStyle = "solid";
			ads[i].style.padding = "10px";
			document.getElementsByClassName("leftBanner")[0].style.borderStyle = "solid";
			document.getElementsByClassName("rightBanner")[0].style.borderStyle = "solid";
		}
	}
}, 200);