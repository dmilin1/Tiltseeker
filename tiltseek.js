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
	processData,
	loadDisplay
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

//Load static data for champs in current game and historical matches
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
			
			summonersLeague = data;

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
			wards += matches[i][j].participants[participant].stats.wardsPlaced;
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
		console.log(summonersUsername[i] + ":\t" + champList.data[currentGame.participants[i].championId].name + ":\t" + campScore[i])
	}
	
	//run next async function
	if (runList[index + 1]) {
		runList[index + 1](runList, index + 1);
	}
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
	
	for (var i = 0; i < currentGame.participants.length/2; i++) {
		var temp = document.getElementsByTagName("template")[0].content.querySelector("div");
		var a = document.importNode(temp, true);
		//picture
		a.querySelectorAll("img")[0].src = "https://ddragon.leagueoflegends.com/cdn/8.10.1/img/champion/" + champList.data[summonersChampIds[i]].key + ".png";
		//username
		a.querySelectorAll("div")[0].textContent = summonersUsername[i];
		//make font smaller if username is long
		
		//losingStreak
		a.querySelectorAll("div")[2].textContent = losingStreak[i];
		a.querySelectorAll("div")[2].style.color = "rgb(" + getRed(losingStreakSigmoid(losingStreak[i])) + "," + getGreen(losingStreakSigmoid(losingStreak[i])) + ",0)";
		
		//winrate
		a.querySelectorAll("div")[4].style.whiteSpace = "pre"
		a.querySelectorAll("div")[4].textContent = Math.round(10000*winRate[i])/100 + "% \r\n" + wins[i] + "W/" + losses[i] + "L";
		a.querySelectorAll("div")[4].style.color = "rgb(" + getRed(winRateSigmoid(winRate[i])) + "," + getGreen(winRateSigmoid(winRate[i])) + ",0)";
		if (isNaN(winRate[i])) {
			a.querySelectorAll("div")[4].textContent = "Not Enough \r\n Games";
		}
		//mastery
		a.querySelectorAll("div")[6].textContent = masteryPoints[i];
		a.querySelectorAll("div")[6].style.color = "rgb(" + getRed(masterySigmoid(masteryPoints[i])) + "," + getGreen(masterySigmoid(masteryPoints[i])) + ",0)";
		
		//daysSincePlayed
		a.querySelectorAll("div")[8].textContent = Math.round(timeSincePlayed[i]) + " days ago";
		a.querySelectorAll("div")[8].style.color = "rgb(" + getRed(daysSincePlayedSigmoid(timeSincePlayed[i])) + "," + getGreen(daysSincePlayedSigmoid(timeSincePlayed[i])) + ",0)";
		
		//agr
		a.querySelectorAll("div")[10].textContent = Math.round(100*aggressiveness[i]) + "%";
		a.querySelectorAll("div")[10].style.color = "rgb(" + getRed(aggrSigmoid(aggressiveness[i])) + "," + getGreen(aggrSigmoid(aggressiveness[i])) + ",0)";
		
		//warding
		a.querySelectorAll("div")[12].textContent = Math.round(100*warding[i]) + "%";
		a.querySelectorAll("div")[12].style.color = "rgb(" + getRed(wardSigmoid(warding[i])) + "," + getGreen(wardSigmoid(warding[i])) + ",0)";
		
		//campScore
		a.querySelectorAll("div")[14].textContent = Math.round(campScore[i]);
		a.querySelectorAll("div")[14].style.color = "rgb(" + getRed(campScoreSigmoid(campScore[i])) + "," + getGreen(campScoreSigmoid(campScore[i])) + ",0)";
		if (isNaN(campScore[i])) {
			a.querySelectorAll("div")[14].textContent = "X";
		}

		document.getElementById("displayBox").appendChild(a);

	}
	
	for (var i = currentGame.participants.length/2; i < currentGame.participants.length; i++) {
		var temp = document.getElementsByTagName("template")[0].content.querySelector("div");
		var a = document.importNode(temp, true);
		//picture
		a.querySelectorAll("img")[0].src = "https://ddragon.leagueoflegends.com/cdn/8.10.1/img/champion/" + champList.data[summonersChampIds[i]].key + ".png";

		//username
		a.querySelectorAll("div")[0].textContent = summonersUsername[i];
		
		//losingStreak
		a.querySelectorAll("div")[2].textContent = losingStreak[i];
		a.querySelectorAll("div")[2].style.color = "rgb(" + getRed(losingStreakSigmoid(losingStreak[i])) + "," + getGreen(losingStreakSigmoid(losingStreak[i])) + ",0)";
		
		//winrate
		a.querySelectorAll("div")[4].style.whiteSpace = "pre"
		a.querySelectorAll("div")[4].textContent = Math.round(10000*winRate[i])/100 + "% \r\n" + wins[i] + "W/" + losses[i] + "L";
		a.querySelectorAll("div")[4].style.color = "rgb(" + getRed(winRateSigmoid(winRate[i])) + "," + getGreen(winRateSigmoid(winRate[i])) + ",0)";
		if (isNaN(winRate[i])) {
			a.querySelectorAll("div")[4].textContent = "Not Enough \r\n Games";
		}
		//mastery
		a.querySelectorAll("div")[6].textContent = masteryPoints[i];
		a.querySelectorAll("div")[6].style.color = "rgb(" + getRed(masterySigmoid(masteryPoints[i])) + "," + getGreen(masterySigmoid(masteryPoints[i])) + ",0)";
		
		//daysSincePlayed
		a.querySelectorAll("div")[8].textContent = Math.round(timeSincePlayed[i]) + " days ago";
		a.querySelectorAll("div")[8].style.color = "rgb(" + getRed(daysSincePlayedSigmoid(timeSincePlayed[i])) + "," + getGreen(daysSincePlayedSigmoid(timeSincePlayed[i])) + ",0)";
		
		//agr
		a.querySelectorAll("div")[10].textContent = Math.round(100*aggressiveness[i]) + "%";
		a.querySelectorAll("div")[10].style.color = "rgb(" + getRed(aggrSigmoid(aggressiveness[i])) + "," + getGreen(aggrSigmoid(aggressiveness[i])) + ",0)";
		
		//warding
		a.querySelectorAll("div")[12].textContent = Math.round(100*warding[i]) + "%";
		a.querySelectorAll("div")[12].style.color = "rgb(" + getRed(wardSigmoid(warding[i])) + "," + getGreen(wardSigmoid(warding[i])) + ",0)";
		
		//campScore
		a.querySelectorAll("div")[14].textContent = Math.round(campScore[i]);
		a.querySelectorAll("div")[14].style.color = "rgb(" + getRed(campScoreSigmoid(campScore[i])) + "," + getGreen(campScoreSigmoid(campScore[i])) + ",0)";
		if (isNaN(campScore[i])) {
			a.querySelectorAll("div")[14].textContent = "X";
		}
		
		//set border to red
		a.style.borderColor = "#BC2525";
		
		console.log(document.getElementById("displayBox2"));
		document.getElementById("displayBox2").appendChild(a);

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


