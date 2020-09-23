let ALERT_BUTTON_TEXT = "ok";

// level should be one of ["Fehler", "Warnung", "Info", "Erfolg", "Debug"]
function createCustomAlert(txt, level) {
    if (level == undefined)
        level = "Fehler"

	if(document.getElementById("modalContainer")) return;
	let mObj = document.body.appendChild(document.createElement("div"));
	mObj.id = "modalContainer";
	mObj.style.height = document.documentElement.scrollHeight + "px";

	let alertObj = mObj.appendChild(document.createElement("div"));
    alertObj.id = "alertBox";
    alertObj.classList.add(`${level.toLowerCase()}-alert`);
	if(document.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	alertObj.style.left = (document.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";

	let h1 = alertObj.appendChild(document.createElement("h1"));
	h1.appendChild(document.createTextNode(level));

	let msg = alertObj.appendChild(document.createElement("p"));
	msg.innerHTML = txt;
	
	let btn = alertObj.appendChild(document.createElement("a"));
	btn.id = "closeBtn";
	btn.appendChild(document.createTextNode(ALERT_BUTTON_TEXT));
	btn.href = "#";
	btn.onclick = function() { removeCustomAlert();return false; }

	
}

function removeCustomAlert() {
	document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}

module.exports = {createCustomAlert};