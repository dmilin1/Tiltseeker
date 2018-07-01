// JavaScript Document
'use strict';

var testingvar = 0;

restartServer();
function restartServer() {

//requires
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var path = require('path');
var querystring = require('querystring');
var async = require('async');
var cron = require('node-cron');
var fs = require('fs');
var AWS = require('aws-sdk');
require('heroku-self-ping')("https://tiltseeker.com/",{verbose: true});

//express module setup for calls
var app = express();
var currentTime = Date.now();
var deployTime = process.env.START_TIME;
var cacheTime = 86400000; // cache for 1 day
if (currentTime - deployTime >= cacheTime) {
	app.use(express.static(__dirname + '/', { maxAge: cacheTime}));
	console.log("caching");
} else {
	app.use(express.static(__dirname + '/', { maxAge: 0}));
	console.log("not caching");
	setTimeout(function() {
		console.log("restartingServer");
		console.log(".");
		console.log(".");
		console.log(".");
		console.log("~~~~~~~~~~~~~~~~~~~");
		server.close();
		restartServer();
	}, cacheTime);
}


app.set('view engine', 'html');

//set AWS credentials
var s3 = new AWS.S3({
	accessKeyId: process.env.AWSACCESSKEYID,
	secretAccessKey: process.env.AWSSECRETACCESSKEY,
});


//set variables
var apikey = process.env.RIOTTILTSEEKERAPIKEY;
console.log(apikey);
var regions = ["na1", "euw1", "eun1", "br1", "tr1", "ru", "la1", "la2", "oc1", "kr", "jp1"];
var awsLoaded = false;
var adminMsg = "";
var awsSaving = false;


//sets up and loads the static champ data from file
var staticChampData = [{}];
loadStaticChampData();


//loads savedMatches from file
//Edit: initialize savedMatches
var savedMatches = {"na1" : {}, "euw1" : {}, "eun1" : {}, "br1" : {}, "tr1" : {}, "ru" : {}, "la1" : {}, "la2" : {}, "oc1" : {}, "kr" : {}, "jp1" : {}};
//loadSavedMatches();

//Matches that need to be analyzed for stats data
var queuedMatches = [];

//stats data such as champion winrates, kda, etc.
var stats = {};
//loads stats from file
loadStats();

//stats averaged over multiple stat categories
var avgStats = {};
calcAvgStats();

//match IDs of matches that have been analyzed
var analyzedIds = [];
analyzedIds = stats.matchIds;

//start server
console.log(getMemory() + 'Listening on 8888');
var server = app.listen(process.env.PORT || 8888);


//cron schedules

//refresh staticChamp data for all regions every 15 minutes
cron.schedule('*/15 * * * *', function () {
	for (var i = 0; i < regions.length; i++) {
		refreshStaticChamp(regions[i]);
	}
	console.log(getMemory() + 'staticChamp data refreshed');
	loadStaticChampData();
});

//save recorded matches to disk every 15 minutes
//cron.schedule('*/15 * * * *', function () {
//	var totalGames = 0;
//	for (var i = 0; i < regions.length; i++) {
//		writeSavedMatches(regions[i]);
//		totalGames += Object.keys(savedMatches[regions[i]]).length;
//	}
//	console.log('Matches saved to disk. Total: ' + totalGames);
//});


//save stats to AWS once an hour if stats have been previously loaded
cron.schedule('0 * * * *', function () {
	awsSaving = true;
	//delay for current stats writes to finish before saving
	setTimeout(saveStats,5000);
});

//if stats failed to load, retries once an hour
cron.schedule('30 * * * *', function () {
	loadStats();
});

//recalculate average stats every 24 hours
cron.schedule('10 0 * * *', function () {
	calcAvgStats();
});

//check if queued matches is too long and needs to be analyzed early every 20 seconds
//matches are 0.05 MB each
cron.schedule('*/20 * * * * *', function () {
	if (queuedMatches.length > 10) {
		analyzeMatches(true);
	}
});

//prunes savedMatches to a maximum length every 1 minute
//matches are 0.05 MB each
cron.schedule('*/1 * * * *', function () {
	var maxSize = 8000;
	var currentSize = Object.keys(savedMatches["na1"]).length;
	if (currentSize > maxSize) {
		var theKeys = Object.keys(savedMatches["na1"]).slice(0,currentSize - maxSize);
		for (var i = 0; i < theKeys.length; i++) {
			delete savedMatches["na1"][theKeys[i]];
		}
		console.log(getMemory() + "savedMatches have been pruned");
	}
});


//API call limiters

var callList1 = [];
var maxCalls1 = 1500;
var perTimeMs1 = 10000;

var callList2 = [];
var maxCalls2 = 90000;
var perTimeMs2 = 600000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiLimit1(req, res, next) {
	var theTime = (new Date()).getTime();
	if (callList1.length < maxCalls1) {
		callList1.push(theTime);
		next();
	} else if (callList1.length >= maxCalls1 && callList1[0] < theTime - perTimeMs1) {
		callList1.push(theTime);
		callList1.shift();
		next();
	} else {
		await sleep(theTime-callList1[0]);
		apiLimit1(req, res, next);
	}
}

async function apiLimit2(req, res, next) {
	var theTime = (new Date()).getTime();
	if (callList2.length < maxCalls2) {
		callList2.push(theTime);
		next();
	} else if (callList2.length >= maxCalls2 && callList2[0] < theTime - perTimeMs2) {
		callList2.push(theTime);
		callList2.shift();
		next();
	} else {
		var tempDelay = theTime-callList2[0];
		console.log(getMemory() + "API rate limit reached. Waiting " + tempDelay + "ms");
		await sleep(tempDelay);
		apiLimit2(req, res, next);
	}
}

//filter for getMatch to check for local match data first
function getMatchFilter(req, res, next) {
	var theMatch = savedMatches[req.query.region][req.query.matchId];
	if (theMatch) {
		res.send(theMatch);
		return;
	} else {
		next();
	}
}

//apply API limits to all direct API requests
app.use(/\/summonerByName|\/currentGame|\/getChampList|\/matchList|\/getMastery|\/getLeague/,apiLimit1, apiLimit2);

//apply API limits with local check to getMatch requests
app.use('/getMatch', getMatchFilter, apiLimit1, apiLimit2);




//local file loads and writes

//loads file data into staticChampData variable
function loadStaticChampData() {
	for (var i = 0; i < regions.length; i++) {
		var rawdata = fs.readFileSync('staticData/' + regions[i] + '/staticChamp.json');
		var staticChamp = JSON.parse(rawdata);
		staticChampData[regions[i]] = staticChamp;
	}
}

//updates a staticChamp json file
function refreshStaticChamp(region) {
	var URL = "https://" + region + ".api.riotgames.com/lol/static-data/v3/champions?dataById=true&api_key=" + apikey;
	var filePath = 'staticData/' + region + '/staticChamp.json';
	//ensures that a filepath exists
	ensureDirectoryExistence(filePath);
	
	function ensureDirectoryExistence(filePath) {
		var dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		ensureDirectoryExistence(dirname);
		fs.mkdirSync(dirname);
	}

	return async.waterfall([
			function (callback) {
				request(URL, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						callback(null, json);
					} else {
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							console.log("No Response");
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				return {
					"error": err
				};
				return;
			}
			//update and write staticChamp to file
			var theFile = 'staticData/' + region + '/staticChamp.json';
			var data = JSON.stringify(data, null, 2);
			fs.writeFileSync(theFile, data);
			return data;
		});
}


//loads file data into savedMatches variable
function loadSavedMatches() {
	for (var i = 0; i < regions.length; i++) {
		var rawdata = fs.readFileSync('matchData/' + regions[i] + '/matchData.json');
		var savedMatchesRegion = JSON.parse(rawdata);
		savedMatches[regions[i]] = savedMatchesRegion;
	}
}

//writes savedMatches to file
function writeSavedMatches(region) {
	var theFile = 'matchData/' + region + '/matchData.json';
	var data = JSON.stringify(savedMatches[region], null, 2);
	fs.writeFileSync(theFile, data);
}


//loads stats from AWS
function loadStats() {
	if (!awsLoaded) {
		var params = {
			Bucket: "tiltseeker",
			Key: "statsData.json",
		};

		s3.getObject(params, function (err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				var rawdata = data.Body.toString();
				stats = JSON.parse(rawdata);
				awsLoaded = true;
				console.log(getMemory() + "AWS loaded");
				calcAvgStats();
				analyzedIds = stats.matchIds;
			}
		});
	}
}

//saves stats to AWS
function saveStats() {
	if (awsLoaded && process.env.DEV_OR_PRODUCTION == "production") {
		
		var stream = fs.createReadStream(__dirname + "/stats/statsData.json");
		var params = {
			Bucket: "tiltseeker",
			Key: "statsData.json",
			Body: stream,
		};
		
		s3.upload(params, function(err, data) {
			if (err) {
				console.log(getMemory() + "AWS error:" + err);
				awsSaving = false;
			} else {
				console.log(getMemory() + "AWS saved");
				awsSaving = false;
			}
		});
		
	} else {
		console.log("AWS not saved. Load status:" + awsLoaded);
		awsSaving = false;
	}
	if (process.env.DEV_OR_PRODUCTION != "production") {
		console.log("AWS not saved in development");
	}
}

	
//writes stats variable to file
function writeStats() {
	if (!awsSaving) {
		var theFile = 'stats/statsData.json';
		var data = JSON.stringify(stats, null, 2);
		fs.writeFileSync(theFile, data);
	} else {
		console.log("Stats not written while uploading to AWS");
	}
}


//analyze queued match data and add analysis to stats file
function analyzeMatches(early = false) {
	var timestamp;
	//get time in epoch milliseconds
	if (early == false) {
		timestamp = new Date().getTime();
		stats[timestamp] = {};
	} else {
		//if an early update, add to the previous timestamp
		timestamp = Object.keys(stats)[Object.keys(stats).length - 1];
		//check if previous timestamp exists
		if (isNaN(timestamp)) {
			timestamp = new Date().getTime();
			stats[timestamp] = {};
		}
	}
	//adds matchCount key if it does not exist
	if (stats[timestamp].matchCount == undefined) {
		stats[timestamp].matchCount = 0;
	}
	//iterate through matches
	for (var theMatch in queuedMatches) {
		//check if map is summoners rift and skips if it isn't
		if (queuedMatches[theMatch].mapId != 11) {continue;}
		//checks if the match has been analyzed yet and skips if it has
		if (analyzedIds.indexOf(queuedMatches[theMatch].gameId) != -1) {
			continue;
		} else {
			analyzedIds.push(queuedMatches[theMatch].gameId);
		}
		//increment matchCount
		stats[timestamp].matchCount += 1;
		//iterate through each champion's game stats
		for (var j = 0; j < queuedMatches[theMatch].participants.length; j++) {
			var theChamp = queuedMatches[theMatch].participants[j].championId;
			//check if stats for champ exists yet
			if (stats[timestamp][theChamp] && stats[timestamp][theChamp].total) {
				stats[timestamp][theChamp].total = stats[timestamp][theChamp].total + 1;
				addStats(stats[timestamp][theChamp], queuedMatches[theMatch].participants[j].stats);
			} else if (stats[timestamp][theChamp]) {
				stats[timestamp][theChamp].total = 1;
				addStats(stats[timestamp][theChamp], queuedMatches[theMatch].participants[j].stats);
			} else {
				stats[timestamp][theChamp] = {};
				stats[timestamp][theChamp].total = 1;
				addStats(stats[timestamp][theChamp], queuedMatches[theMatch].participants[j].stats);
			}
		}
	}
	//add stats for the match to permanant storage
	function addStats(savedStats, matchStats) {
		if (savedStats.win != undefined) {
			savedStats.win += matchStats.win ? 1 : 0;
		} else {
			savedStats.win = matchStats.win ? 1 : 0;
		}
		
		//combine first tower kill and first tower assist
		if (savedStats.firstTowerParticipate != undefined) {
			savedStats.firstTowerParticipate += (matchStats.firstTowerKill || matchStats.firstTowerAssist) ? 1 : 0;
		} else {
			savedStats.firstTowerParticipate = matchStats.win ? 1 : 0;
		}
		
		//Champion damage stats
		if (savedStats.magicDamage != undefined) {
			savedStats.magicDamage += matchStats.magicDamageDealtToChampions;
		} else {
			savedStats.magicDamage = matchStats.magicDamageDealtToChampions;
		}
		
		if (savedStats.physicalDamage != undefined) {
			savedStats.physicalDamage += matchStats.physicalDamageDealtToChampions;
		} else {
			savedStats.physicalDamage = matchStats.physicalDamageDealtToChampions;
		}
		
		if (savedStats.trueDamage != undefined) {
			savedStats.trueDamage += matchStats.trueDamageDealtToChampions;
		} else {
			savedStats.trueDamage = matchStats.trueDamageDealtToChampions;
		}
		
		
		if (savedStats.kills != undefined) {
			savedStats.kills += matchStats.kills;
		} else {
			savedStats.kills = matchStats.kills;
		}
		
		if (savedStats.deaths != undefined) {
			savedStats.deaths += matchStats.deaths;
		} else {
			savedStats.deaths = matchStats.deaths;
		}
		
		if (savedStats.assists != undefined) {
			savedStats.assists += matchStats.assists;
		} else {
			savedStats.assists = matchStats.assists;
		}
		
		if (savedStats.wardsPlaced != undefined) {
			savedStats.wardsPlaced += matchStats.wardsPlaced;
		} else {
			savedStats.wardsPlaced = matchStats.wardsPlaced;
		}
		
	}
	console.log(getMemory() + "Analyzed " + queuedMatches.length + " matches");
	//clear matches queue
	queuedMatches = [];
	//store analyzedIds in json
	stats.matchIds = analyzedIds;
	//write stats to file
	writeStats();
}



//averages stats over multiple timestamps
function calcAvgStats() {
	
	// 3 WEEKS: 1000ms * 60sec * 60min * 24hrs * 21days
	var historyLength = 1000 * 60 * 60 * 24 * 21
	
	var currentTime = (new Date()).getTime();
	var theTimes = Object.keys(stats);
	for (var i = theTimes.length - 1; i >= 0; i--) {
		//skip if not a timestamp
		if (isNaN(theTimes[i])) {continue;}
		if (avgStats.matchCount == null) {avgStats.matchCount = 0;}
		avgStats.matchCount += stats[theTimes[i]].matchCount;
		if (currentTime - theTimes[i] > historyLength) {break;}
		var listChamps = Object.keys(stats[theTimes[i]]);
		for (var j = 0; j < listChamps.length; j++) {
			var theStats = Object.keys(stats[theTimes[i]][listChamps[j]]);
			if (avgStats[listChamps[j]] == null) {avgStats[listChamps[j]] = {};}
			for (var k = 0; k < theStats.length; k++) {
				if (avgStats[listChamps[j]][theStats[k]] == null) {avgStats[listChamps[j]][theStats[k]] = 0;}
				avgStats[listChamps[j]][theStats[k]] += stats[theTimes[i]][listChamps[j]][theStats[k]];
			}
		}
	}
}



//returns system memory in use
function getMemory() {return Math.round(process.memoryUsage().rss/(1024*1024)*10)/10 + "MB: ";}


//client call listeners

//call to get a summoner's info by summoner name
app.get('/summonerByName', function (req, res) {
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/summoner/v3/summoners/by-name/" + querystring.escape(req.query.username) + "?api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						json.name = decodeURIComponent(json.name);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});

//call to get the current game of a summoner by summonerId
app.get('/currentGame', function (req, res) {
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/spectator/v3/active-games/by-summoner/" + req.query.summonerId + "?api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});

//updates a staticChamp json file
app.get('/getChampList', function (req, res) {
	req.query.region;
	res.send(staticChampData[req.query.region]);
});

//returns the admin message
app.get('/adminMsg', function (req, res) {
	res.send(adminMsg);
});
	
//returns the admin message
app.get('/setAdminMsg', function (req, res) {
	if (req.query.pass == process.env.ADMIN_PASS) {
		adminMsg = req.query.message;
		console.log("Admin Message: " + adminMsg);
		res.send("1");
	} else {
		res.send("0");
	}
});

//returns the stats file with just requested champions
app.get('/getStats', function (req, res) {
	var champIdList = req.query.champList;
	var tempStats = {};
	tempStats.matchCount = avgStats.matchCount;
	for (var i = 0; i < champIdList.length; i++) {
		tempStats[champIdList[i]] = avgStats[champIdList[i]];
	}
	res.send(tempStats);
});

//call to get a match list history for a summoner
app.get('/matchList', function (req, res) {
	//summoners rift only
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/match/v3/matchlists/by-account/" + req.query.accountId + "?queue=400&queue=420&queue=430&queue=440&api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});

//call to get match info
app.get('/getMatch', function (req, res) {
	
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/match/v3/matches/" + req.query.matchId + "?api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						savedMatches[req.query.region][req.query.matchId] = json;
						queuedMatches.push(json);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});

//call to get a summoner's mastery on a champion
app.get('/getMastery', function (req, res) {
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/" + req.query.summonerId + "/by-champion/" + req.query.championId + "?api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						json.name = decodeURIComponent(json.name);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});

//call to get a summoner's ranked league stats
app.get('/getLeague', function (req, res) {
	var URL = "https://" + req.query.region + ".api.riotgames.com/lol/league/v3/positions/by-summoner/" + req.query.summonerId + "?api_key=" + apikey;
	async.waterfall([
			function myFunction(callback, attempt = 0) {
				request({uri: URL,timeout: 1500}, function (err, response, body) {
					if (!err && response.statusCode == 200) {
						var json = JSON.parse(body);
						json.name = decodeURIComponent(json.name);
						callback(null, json);
					} else {
						//check if server responded
						if (response) {
							callback(response.statusCode, JSON.parse(body));
						} else {
							if (attempt >= 3) {
								callback(777, JSON.parse("{}"));
							} else {
								console.log("empty response");
								myFunction(callback, attempt + 1);
							}
						}
					}
				});
			}
		],
		function (err, data) {
			if (err) {
				console.log(getMemory() + err);
				res.send({
					"error": err
				});
				return;
			}
			res.send(data);
		});
});
}