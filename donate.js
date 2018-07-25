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

function selectText(textField) {
	textField.focus();
	textField.select();
}

//Enter key handler for textbox
document.getElementById("textfield").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submit-button").click();
    }
});

document.getElementById("submit-button").addEventListener("click", function(event) {
	//Just so no one judges me, I know this security is shit. It doesn't really have to be secure.
	console.log(document.getElementById("textfield").value);
	var pass = document.getElementById("textfield").value;
	for(var i = 0; i < 1000; i++) {
		pass = sha256(pass + "tiltseeker");
	}
	console.log(pass);
	if (pass == "9d7a631ee50b24b61a7d985718aa4b0245b5082ef98a79bbe7267f3098d4c9d0") {
		eraseCookie("curseOfDraven");
		setCookie("donated", true, 365);
		alert("Thank you so much for donating! You shouldn't see adblock whitelist popups anymore. Now go win some games :D")
	} else {
		setCookie("curseOfDraven", true, 0.5);
		alert("Are you trying to hax me? For the next 12 hours, you have been cursed by DRAAAAAVEN!");
	}
})

var sha256=function a(b){function c(a,b){return a>>>b|a<<32-b}for(var d,e,f=Math.pow,g=f(2,32),h="length",i="",j=[],k=8*b[h],l=a.h=a.h||[],m=a.k=a.k||[],n=m[h],o={},p=2;64>n;p++)if(!o[p]){for(d=0;313>d;d+=p)o[d]=p;l[n]=f(p,.5)*g|0,m[n++]=f(p,1/3)*g|0}for(b+="\x80";b[h]%64-56;)b+="\x00";for(d=0;d<b[h];d++){if(e=b.charCodeAt(d),e>>8)return;j[d>>2]|=e<<(3-d)%4*8}for(j[j[h]]=k/g|0,j[j[h]]=k,e=0;e<j[h];){var q=j.slice(e,e+=16),r=l;for(l=l.slice(0,8),d=0;64>d;d++){var s=q[d-15],t=q[d-2],u=l[0],v=l[4],w=l[7]+(c(v,6)^c(v,11)^c(v,25))+(v&l[5]^~v&l[6])+m[d]+(q[d]=16>d?q[d]:q[d-16]+(c(s,7)^c(s,18)^s>>>3)+q[d-7]+(c(t,17)^c(t,19)^t>>>10)|0),x=(c(u,2)^c(u,13)^c(u,22))+(u&l[1]^u&l[2]^l[1]&l[2]);l=[w+x|0].concat(l),l[4]=l[4]+w|0}for(d=0;8>d;d++)l[d]=l[d]+r[d]|0}for(d=0;8>d;d++)for(e=3;e+1;e--){var y=l[d]>>8*e&255;i+=(16>y?0:"")+y.toString(16)}return i};

function displayDraven() {
	console.log(getCookie("curseOfDraven"));
	if (Math.random() > 0.99 || getCookie("curseOfDraven")) {
		var x = Math.random()*(window.innerWidth-180);
		var y = Math.random()*(window.innerHeight-220);
		//Move the image to the new location
		document.getElementById("draven").style.top = y + 'px';
		document.getElementById("draven").style.left = x + 'px';
		$(".draven").addClass("dravenVis");
		window.setTimeout(function() {
			$(".draven").removeClass("dravenVis");
		}, 500);
	}
}

window.setInterval('displayDraven()', 3000);