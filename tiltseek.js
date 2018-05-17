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

//async function list
var runList = [
	loadUser,
	loadCurrentGame,
	loadChampList,
	loadSummoners,
	loadMatchLists,
	loadMatches,
	loadStats,
	loadMastery,
	loadLeague,
	processData
];

//run first async item
runList[0](runList, 0);


//gets parameter from current url
function getQuery(q) {
	return decodeURIComponent((window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1]);
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
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("User not found");
			}
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
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("User not in game");
			}
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
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("User not in game");
			}
		}
	);
}

//Load the summoners in the current game
function loadSummoners(runList, index) {
	getSummoners(currentGame.participants).then(
		function success(data) {
			//sort data properly
			for (var j = 0; j < currentGame.participants.length; j++) {
				for (var i = 0; i < data.length; i++) {
					if (currentGame.participants[j].summonerName == data[i].name) {
						summonersUsername.push(data[i].name);
						summonersAccountId.push(data[i].accountId);
						summonersSummonerId.push(data[i].id);
						break;
					}
				}
			}

			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("Couldn't find all summoners in game");
			}
		}
	);
}

//Load all the users matchlists
function loadMatchLists(runList, index) {
	getMatchLists(summonersAccountId).then(
		function success(data) {
			for (var i = 0; i < data.length; i++) {
				matchLists.push(data[i].matches);
			}
			console.log(matchLists);
			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("User not in game");
			}
		}
	);
}

//Load all the users matches
function loadMatches(runList, index) {
	//set match history length per user (max 100)
	matchHistoryLength = 2;
	
	//intialize matches variable
	for (var i = 0; i < summonersAccountId.length; i++) {
		matches[i] = [];
	}
	for (var i = 0; i < summonersAccountId.length; i++) {
		for (var j = 0; j < matchHistoryLength; j++) {

		}
	}
	
	//loop through all users and their matches
	var i = 0;
	var j = 0;
	myLoop(runList, index);
	function myLoop(runList, index) {
		getMatch(matchLists[i][j].gameId).then(
			function success(data) {
				matches[i].push(data);
				if (j < matchHistoryLength - 1) {
					j++;
					myLoop(runList, index);
				} else if (i < matchLists.length - 1 && j >= matchHistoryLength - 1) {
					i++;
					j = 0;
					myLoop(runList, index);
				} else if (i >= matchLists.length - 1 && j >= matchHistoryLength - 1) {
					console.log(matches);
					//run next async function
					if (runList[index + 1]) {
						runList[index + 1](runList, index + 1);
					}
				}
			},
			function fail(data) {
				console.log("fail: " + data);
				if (data == 400) {
					console.log("Bad request");
				}
				if (data == 429) {
					console.log("Rate limit exceeded");
				}
				if (data == 503) {
					console.log("Rito servers ded");
				}
				if (data == 404) {
					console.log("User not in game");
				}
			}
		);
	}
}

//Load static data for champs in current game
function loadStats(runList, index) {
	var champIds = [];
	for (var i = 0; i < currentGame.participants.length; i++) {
		if (champIds.indexOf(currentGame.participants[i].championId) == -1) {
			champIds.push(currentGame.participants[i].championId);
		}
	}
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
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("User not found");
			}
		}
	);
}

//Load champion masteries for summoner's current champions
function loadMastery(runList, index) {
	for (var i = 0; i < currentGame.participants.length; i++) {
		summonersChampIds.push(currentGame.participants[i].championId);
	}
	getMastery(summonersSummonerId,summonersChampIds).then(
		function success(data) {
			console.log(data);
			summonersMastery = data;

			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("Couldn't find all masteries");
			}
		}
	);
}

//Load summoner ranked league stats
function loadLeague(runList, index) {
	getLeague(summonersSummonerId).then(
		function success(data) {
			console.log(data);

			//run next async function
			if (runList[index + 1]) {
				runList[index + 1](runList, index + 1);
			}
		},
		function fail(data) {
			console.log("fail: " + data);
			if (data == 400) {
				console.log("Bad request");
			}
			if (data == 429) {
				console.log("Rate limit exceeded");
			}
			if (data == 503) {
				console.log("Rito servers ded");
			}
			if (data == 404) {
				console.log("Couldn't find all summoners in game");
			}
		}
	);
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
	
	var losingStreak = [];
	
	for (var i = 0; i < matches.length; i++) {
		losingStreak.push(0);
		var compareTime = (new Date).getTime();
		for (var j = 0; j < matches[i].length; j++) {
			//check if previous match was greater than 3 hours ago
			if (compareTime - matches[i][j].gameCreation > 10800000) {
				break;
			}
			
			//find the participant
			var participant = 0;
			for (var k = 0; k < matches[i][j].participantIdentities.length; k++) {
				if (summonersSummonerId[i] == matches[i][j].participantIdentities[k].player.summonerId) {
					participant = k;
					break;
				}
			}
			if (matches[i][j].participants[participant].stats.win == true) {
				break;
			}
			compareTime = matches[i][j].gameCreation;
			losingStreak[i]++;
		}
	}
	console.log(losingStreak);
	
	console.log(champList);
	for (var i = 0; i < summonersUsername.length; i++) {
		console.log(summonersUsername[i] + ":\t" + champList.data[currentGame.participants[i].championId].name + ":\t" + losingStreak[i])
	}
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
function getSummoners(summoners, asynch = true) {
	//set theSummoners to an array of summoners from the current game
	var theSummoners = [];
	for (var i = 0; i < summoners.length; i++) {
		theSummoners.push(summoners[i].summonerName);
	}
	var completeSummoners = [];
	console.log(theSummoners);
	var promiseObj = new Promise(function (resolve, reject) {
		for (var i = 0; i < theSummoners.length; i++) {
			var username = theSummoners[i];
			$.ajax({
				async: asynch,
				url: '/summonerByName',
				data: {
					"username": username,
					"region": getQuery("region")
				},
				success: function (data) {
					if (data.error == null) {
						completeSummoners.push(data);
						if (completeSummoners.length == summoners.length)
							resolve(completeSummoners);
					} else {
						reject(data.error);
					}
				},
				error: function () {
					console.log("Oops! Ajax messed up.");
				}
			});
		}
	});
	return promiseObj;
}

//Load matchlist by accoundId
function getMatchLists(accountIds, asynch = true) {
	var completeMatchLists = [];
	console.log(accountIds);
	var promiseObj = new Promise(function (resolve, reject) {
		var i = 0;
		myLoop();
		function myLoop() {
			var theAccountId = accountIds[i];
			$.ajax({
				async: asynch,
				url: '/matchList',
				data: {
					"accountId": theAccountId,
					"region": getQuery("region")
				},
				success: function (data) {
					if (data.error == null) {
						completeMatchLists.push(data);
						if (completeMatchLists.length == accountIds.length) {
							console.log(completeMatchLists);
							resolve(completeMatchLists);
						} else {
							i++;
							myLoop();
						}
					} else {
						reject(data.error);
					}
				},
				error: function () {
					console.log("Oops! Ajax messed up.");
				}
			});
		}
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
function getMastery(summonerIds, champions, asynch = true) {
	var completeMasteries = [];
	var promiseObj = new Promise(function (resolve, reject) {
		var i = 0;
		myLoop();
		function myLoop() {
			var sumId = summonerIds[i];
			var champion = champions[i];
			$.ajax({
				async: asynch,
				url: '/getMastery',
				data: {
					"summonerId": sumId,
					"championId": champion,
					"region": getQuery("region")
				},
				success: function (data) {
						if (data.error == null) {
							completeMasteries.push(data);
							if (completeMasteries.length == summonerIds.length) {
								resolve(completeMasteries);
							} else {
								i++;
								myLoop();
							}
						} else {
							if (data.error == '404') {
								completeMasteries.push(data);
								if (completeMasteries.length == summonerIds.length) {
									resolve(completeMasteries);
								} else {
									i++;
									myLoop();
								}
							} else {
								reject(data.error);
							}
						}
				},
				error: function () {
					console.log("Oops! Ajax messed up.");
				}
			});
		}
	});
	return promiseObj;
}

//Load the league stats of summoners
function getLeague(summonerIds, asynch = true) {
	var completeLeagues = [];
	var promiseObj = new Promise(function (resolve, reject) {
		var i = 0;
		myLoop();
		function myLoop() {
			var sumId = summonerIds[i];
			$.ajax({
				async: asynch,
				url: '/getLeague',
				data: {
					"summonerId": sumId,
					"region": getQuery("region")
				},
				success: function (data) {
					if (data.error == null) {
						completeLeagues.push(data);
						if (completeLeagues.length == summonerIds.length) {
							resolve(completeLeagues);
						} else {
							i++;
							myLoop();
						}
					} else {
						reject(data.error);
					}
				},
				error: function () {
					console.log("Oops! Ajax messed up.");
				}
			});
		}
	});
	return promiseObj;
}


