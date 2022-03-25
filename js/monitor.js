var jointer = new $().jointer('black', 'grey', !1);
var isList = !1;
var alarmThresholdHi = 1.5;
var alarmThresholdHihi = 2;
var decDigits = 3;
var unit = "µSv";
var drawn = !1;

const getUrl = ()=> {
	let host = "10.0.38.42";
	if (window.location.host === "vpn.cnpem.br") { // If using WEB VPN
			// Capture IPv4 address
			const ipRegExp = /https?\/((?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])))\//;
			const match = ipRegExp.exec(window.location.href);
			if (match && match.length > 1) {
					host = match[1];
			}
	} else {
			host = window.location.host;
	}

	if (host === "10.0.38.50") {
			host = "10.0.38.42";
			console.log("DEBUG SERVER. Setting host to 10.0.38.42");
	}
	return host;
};

var request = "http://" + getUrl() + "/epics2web/caget?";
var options = {url : "ws://" + getUrl() + "/epics2web/monitor"};

con = new jlab.epics2web.ClientConnection(options);

function parseJSON() {
	return new Promise(resolve => {
		setTimeout(() => {
			var leftElements = 0;
			var rightElements = 0;
			var PVs = [18];
			$.getJSON('js/pos.json?' + (new Date()).getTime(), function (data) {
				var largest = 0;
				for (i = 0; i < data.pins.length; i++) {
					PVs[i] = data.pins[i].pv;
					var column = data.pins[i].x > "51%" ? '.column-right' : '.column-left';
					column == '.column-right' ? rightElements++ : leftElements++;

					largest = rightElements > leftElements ? rightElements : leftElements;

					$(column).append('<div class="box" id="b' + i + '">' + '<div class="measure" id="m' + i + '">Indisponível</div>' + '<div class="name" id="n' + i + '">' + data.pins[i].desc + '</div>' + '</div>')
				}

				if(largest > 9)
				{
					$(".box .measure").css('font-size' , (4.3/largest*9 + 'vh'));
					$(".box .name").css({'font-size' : (2.3/largest*9 + 'vh'), 'height': (3.9/largest*9 + 'vh')});
				}
				resolve(PVs)
			})
		}, 100)
	})
}
async function treatJSON() {
	PVs = await parseJSON();
	request = request + replaceColon(PVs[0] + ".PREC&") + replaceColon(PVs[0] + ".HIGH&") + replaceColon(PVs[0] + ".HIHI&" + replaceColon(PVs[0]) + ".EGU");
	con.monitorPvs(await PVs);
	$.getJSON(request, function (data) {
		$.each(data, function (key, val) {
			decDigits = val[0].value ? val[0].value: 3;
			alarmThresholdHi = val[1].value ? val[1].value: 1.5;
			alarmThresholdHihi = val[2].value ? val[2].value: 2;
			unit = val[3].value ? val[3].value : "uSv"
		})
	});
	drawConnections()
}
con.onopen = function (e) {
	treatJSON();
	console.log('Socket Conectada')
};
window.onresize = function (event) {
	if (!isList && drawn) {
		drawConnections()
	}
};

function replaceColon(str) {
	return "pv=" + str.toString().replace(/:/g, "%3A")
}
async function drawConnections() {
	drawn = !1;
	await jointer.clearAllConnection();
	await $.getJSON('js/pos.json', function (data) {
		for (i = 0; i < data.pins.length; i++) {
			jointer.connectElements("#b" + i, data.pins[i].x, data.pins[i].y, i)
		}
	});
	drawn = true;
}

function changeToList() {
	if (document.getElementById('listBtn').innerHTML == "Modo Lista") {
		isList = true;
		document.getElementById('listBtn').innerHTML = "Modo Gráfico";
		document.getElementsByClassName('column-right')[0].style.width = '48%';
		document.getElementsByClassName('container')[0].style.paddingTop = '0';
		document.getElementsByClassName('column-left')[0].style.width = '48%';
		document.getElementsByTagName('body')[0].style.overflowY = 'scroll';
		document.body.style.backgroundImage = 'none'
	} else {
		isList = false;
		$('html,body').scrollTop(0);
		document.getElementById('listBtn').textContent = "Modo Lista";
		document.getElementsByClassName('column-right')[0].style.width = '20%';
		document.getElementsByClassName('container')[0].style.paddingTop = '56.25%';
		document.getElementsByClassName('column-left')[0].style.width = '20%';
		document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
		var asyncRedraw = function (callback) {
			var dC = drawConnections();
			if (dC > 16) {
				callback()
			} else {
				setTimeout(function () {
					asyncRedraw(callback)
				}, 100)
			}
		};
		document.body.style.backgroundImage = "url('resources/planta2.png')"
	}
}
con.onupdate = function (e) {
	var id = PVs.indexOf(e.detail.pv) < 0 ? null : PVs.indexOf(e.detail.pv);
	if (document.getElementById("b" + id) != null && document.getElementById("p" + id) != null) {
		var value = parseFloat(e.detail.value).toFixed(decDigits);
		var colorBox = "#74f87f";
		var colorPin = "green";
		if (value > alarmThresholdHi) {
			colorBox = "#f5f256";
			colorPin = "yellow";
			if (value > alarmThresholdHihi) {
				colorBox = "#a13636";
				colorPin = "red";
			}
		}
		document.getElementById("m" + id).innerHTML = value + ' ' + unit;
		document.getElementById("b" + id).style.backgroundColor = colorBox;
		document.getElementById("p" + id).style.fill = colorPin;
	}
}
