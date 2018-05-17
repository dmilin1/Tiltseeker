// JavaScript Document

var region = "NA";

function getRegionID(theRegion) {
	var regions = ["NA", "EUW", "EUNE", "BR", "TR", "RU", "LAN", "LAS", "OCE", "KR", "JP"];
	var regionIDs = ["na1", "euw1", "eun1", "br1", "tr1", "ru", "la1", "la2", "oc1", "kr", "jp1"];
	return regionIDs[regions.indexOf(theRegion)];
}

//region select button event listeners
var regionObjs = document.getElementsByClassName("region-button");
for(var i = 0; i < regionObjs.length; i++) {
  (function(index) {
    regionObjs[index].addEventListener("click", function() {
		region = this.textContent;
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