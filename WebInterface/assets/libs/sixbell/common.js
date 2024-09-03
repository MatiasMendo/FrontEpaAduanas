var roomUUID        = "";
var today           = moment();
var todayOneWeekAgo = moment().subtract(7, 'd');

if (sessionStorage.getItem('roomUUID') !== null) {

	roomUUID = sessionStorage.getItem('roomUUID');
}
else {

	roomUUID = getUUID();
	sessionStorage.setItem('roomUUID', roomUUID);
}

var socket = io({
	query: {
		"roomUUID": roomUUID
	}
});

$(document).ready(function ($) {

	$('#voz_historicoB').click(function () {
		console.log('click');
		$('#rep_marcas,#main_container').hide();
		$('#voz_historico').show();
	});
	
	$('#rep_marcasB').click(function () {

		$('#rep_marcas').show();
		$('#voz_historico,#main_container').hide();
	});


});

function getUUID() {

	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
