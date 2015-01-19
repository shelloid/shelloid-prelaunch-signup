var $ = jQuery;
var JSON = JSON || {};

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"' + obj + '"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n];
			t = typeof(v);
			if (t == "string") v = '"' + v + '"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

function showToast(msg) {
	//type: danger info success
	var options = {duration: 3000, sticky: false, type: "info"};
	$.toast(msg, options);
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function submitUserInfo() {
	var name = $('#username').val();
	var email = $('#email').val();
	if (name == "" || email == "" || !ValidateEmail(email)) {
		showToast("Please input correct email and username")
		return;
	} else {
		$.post("/interest", {name: name, email: email, who_invited: getParameterByName("id")}, function (resp) {
			if (resp.status == 200) {
				$("#username").val("");
				$("#email").val("");
				$( "#dialog" ).dialog( "open" );						
			} else {
				console.log(resp);
				showToast("Error: " + resp.msg);
			}
		}).fail(function (xhr, status, err) {
			showToast("Couldn't post the information to the server. Please try again.");
			console.log("ajax status: " + status + " err: " + err + " xhr.status: " + xhr.status);
		});
	}
}

$(function () {
	$("#go").click(function (e) {
		e.preventDefault();
		submitUserInfo()
	});
});
function ValidateEmail(mail)
{
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
	{
		return (true)
	}
	return (false)
}

