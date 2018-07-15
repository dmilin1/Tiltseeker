// JavaScript Document

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