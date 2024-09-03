// socket.on('voz_historico_response', function (msg) {

// 	$('#rep_marcas_list').DataTable().ajax.reload();
// 	setTimeout(function () {

// 		$.ajax({
// 			url    : msg.filename,
// 			type   : 'HEAD',
// 			error  : function () {
// 				console.log("Reporte no disponible");
// 			},
// 			success: function () {
// 				window.location.href = msg.filename;
// 			}
// 		});

// 	}, 3000);

// });

$(document).ready(function ($) {
	console.log("V 1.0");
	var datos = {};
	$.post("/app-8445/api/getCampania", datos)
		.done(function (response, status, error) {
			if (response.resultado.length > 0) {
				$("#lineas option").remove();
				$("#lineas").append('<option value="">Seleccione Encuesta</option>');
				for (var i = 0; response.resultado.length > i; i++) {
					if (response.resultado[i] == "prueba" || response.resultado[i] == "Encuesta: ask dos") {
						console.log(response.resultado[i]);
					}
					else {
						$("#lineas").append('<option value="' + response.resultado[i] + '">' + response.resultado[i] + '</option>');
					}

				}
			}
			else {
				$("#lineas option").remove();
				$("#lineas").append('<option value="">No hay Encuestas</option>');
			}
		})
		.fail(function (response, status, error) {
			console.log(response);
		});
	var rep_marcas_list = $("#rep_marcas_list").on('error.dt', function (e, settings, techNote, message) {
		console.log('An error has been reported by DataTables: ', message);
	}).DataTable({
		sPaginationType: "full_numbers",
		bprocessing: false,
		bServerSide: false,
		bLengthChange: true,
		bInfo: true,
		paging: true,
		searching: true,
		bDestroy: true,
		dom: 'lfrtip',
		order: [[1, "desc"]],
		lengthMenu: [
			[
				10,
				25,
				50,
				-1
			],
			[
				"Mostrar 10 registros  ",
				"Mostrar 25 registros  ",
				"Mostrar 50 registros  ",
				"Todos los registros  "
			]
		],
		language: {
			url: "/app-8445/assets/libs/datatables/1.10.15/js/spanish.json"
		},
		ajax: {
			url: "/app-8445/ReportList",
			//url: "/app-8445/ReportList"+$('#reporte').val(),
			type: "POST",
			data: {
				//reportFilter: 'Reporte'
				reportFilter: $('#reporte').val() == "epa" ? 'Reporte_EPA' : 'Reporte_NPS' 
			},
			dataSrc: ""
		},
		columns: [
			{
				data: "filename",
				sTitle: "Nombre de archivo",
				defaultContent: "---",
				bSortable: true
			},
			{
				data: "creationDate",
				sTitle: "Creaci&oacute;n de reporte",
				defaultContent: "---",
				bSortable: false
			},
			// {
			// 	data: "reportDate",
			// 	sTitle: "Rango Reporte",
			// 	defaultContent: "---",
			// 	bSortable: false
			// },
			{
				data: "filename",
				render: function (data, type, row) {

					return "<button type='button' class='btn btn-red btn-icon btn-icon-standalone btn-xs' onClick='window.location.href = \"/app-8445/ReportStorage/" + data + "\"'>" +
						"<i class='far fa-download'></i>" +
						"<span>Descargar</span>" +
						"</button>";
				},
				bSortable: false,
				sTitle: "",
				width: "180px",
				defaultContent: "---"
			}
		]
	}).on('click', 'button', function (evt) {

		var data = rep_marcas_list.row($(this)).data();
		if ($(evt.target).is("i") || $(evt.target).is("span") || $(evt.target).is("button") || evt.currentTarget.innerHTML.startsWith("<th")) {
			return;
		}

		window.location.href = "/Reportes/" + data.filename;

	});

	$('#rep_epa_submit').click(function () {
		$('#reporte').val("epa");
		$('#nameReport').html("<h2>Reportes Encuestas</h2>");
		
		$('#reps').click();
		console.log("[ARM] reporte --EPA");
	});

	$('#rep_nps_submit').click(function () {
		$('#reporte').val("nps");
		$('#nameReport').html("<h2>Reportes NPS</h2>");
		$('#reps').click();
		console.log("[ARM] Reporte ----NPS");
	});

	$('#reps_act').click(function () {
		console.log("Recargando");
		setTimeout(function(){
			$('#reps').click();
		}, 5000);
		console.log("[ARM] Reportes Reloaded");
	});

	$('#reps').click(function () {
		console.log("[ARM] Actualizar Reportes:: " + $('#reporte').val());
		//rep_marcas_list.ajax.reload();
		$("#rep_marcas_list").on('error.dt', function (e, settings, techNote, message) {
			console.log('An error has been reported by DataTables: ', message);
		}).DataTable({
			sPaginationType: "full_numbers",
			bprocessing: false,
			bServerSide: false,
			bLengthChange: true,
			bInfo: true,
			paging: true,
			searching: true,
			bDestroy: true,
			dom: 'lfrtip',
			order: [[1, "desc"]],
			lengthMenu: [
				[
					10,
					25,
					50,
					-1
				],
				[
					"Mostrar 10 registros  ",
					"Mostrar 25 registros  ",
					"Mostrar 50 registros  ",
					"Todos los registros  "
				]
			],
			language: {
				url: "/app-8445/assets/libs/datatables/1.10.15/js/spanish.json"
			},
			ajax: {
				url: "/app-8445/ReportList",
				//url: "/app-8445/ReportList"+$('#reporte').val(),
				type: "POST",
				data: {
					//reportFilter: 'Reporte'
					reportFilter: $('#reporte').val() == "epa" ? 'Reporte_EPA' : 'Reporte_NPS' 
				},
				dataSrc: ""
			},
			columns: [
				{
					data: "filename",
					sTitle: "Nombre de archivo",
					defaultContent: "---",
					bSortable: true
				},
				{
					data: "creationDate",
					sTitle: "Creaci&oacute;n de reporte",
					defaultContent: "---",
					bSortable: false
				},
				// {
				// 	data: "reportDate",
				// 	sTitle: "Rango Reporte",
				// 	defaultContent: "---",
				// 	bSortable: false
				// },
				{
					data: "filename",
					render: function (data, type, row) {
	
						return "<button type='button' class='btn btn-red btn-icon btn-icon-standalone btn-xs' onClick='window.location.href = \"/app-8445/ReportStorage/" + data + "\"'>" +
							"<i class='far fa-download'></i>" +
							"<span>Descargar</span>" +
							"</button>";
					},
					bSortable: false,
					sTitle: "",
					width: "180px",
					defaultContent: "---"
				}
			]
		}).on('click', 'button', function (evt) {
	
			var data = rep_marcas_list.row($(this)).data();
			if ($(evt.target).is("i") || $(evt.target).is("span") || $(evt.target).is("button") || evt.currentTarget.innerHTML.startsWith("<th")) {
				return;
			}
	
			window.location.href = "/Reportes/" + data.filename;
	
		});
		console.log("[ARM] Actualizados Reportes " + $('#reporte').val());
	});

	$('#rep_marcas_submit').click(function () {
		console.log($('select[name="lineas"] option:selected').text());
		if ($('select[name="lineas"] option:selected').text() == "Seleccione Encuesta") {
			$('#custom_seleccion_modal').modal('show', modal_opts).detach().appendTo("body");
		}
		else {
			$('#overlay_page').css("display", 'block');

			var startDate = $('#start_date_rep_marcas').val();
			var finalDate = $('#final_date_rep_marcas').val();
			var datoCampania = $('select[name="lineas"] option:selected').text();
			var data = {
				reporte : $('#reporte').val(),
				startDate: startDate,
				finalDate: finalDate,
				//roomUUID: roomUUID,
				datoCampania: datoCampania
			};

			console.log(data);

			$.post("/app-8445/api/reporteExcel", data)
				.done(function (response, status, error) {
					$('#overlay_page').css("display", 'none');
					$('#start_execution_modal').modal('show', modal_opts).detach().appendTo("body");
					console.log("Recargando");
					setTimeout(function(){
						$('#reps').click();
					}, 5000);
					console.log("[ARM] Reportes Reloaded");
				})
				.fail(function (response, status, error) {
					console.log(response);
					console.log(status);
					$('#overlay_page').css("display", 'none');
					$('#custom_error').html(response.responseJSON.message);
					$('#custom_error_modal').modal('show', modal_opts).detach().appendTo("body");
				});
		}


	});

	$('#start_date_rep_marcas, #final_date_rep_marcas').val(today.format('YYYY-MM-DD, HH:mm'));

	$('#start_range_label_rep_marcas').attr("placeholder",
		todayOneWeekAgo.format("MMM DD, YYYY, HH:mm") + " --- " + today.format("MMM DD, YYYY, HH:mm")
	);

	$('#start_date_rep_marcas').val(todayOneWeekAgo.format('YYYY-MM-DD HH:mm'));
	$('#final_date_rep_marcas').val(today.format('YYYY-MM-DD HH:mm'));

	$('#start_range_triggerMarcas').daterangepicker({
		parentEl: "title_div",
		showDropdowns: true,
		minYear: "2021",
		minDate: "2021-01-29",
		timePicker: false,
		timePickerIncrement: 5,
		timePicker24Hour: true,
		ranges: {
			"Hoy": [
				moment(),
				moment()
			],
			"Ayer": [
				moment().subtract(1, 'd'),
				moment().subtract(1, 'd')
			],
			"Últimos 7 días": [
				moment().subtract(7, 'd'),
				moment()
			],
			"Últimos 30 días": [
				moment().subtract(30, 'd'),
				moment()
			],
			"Este mes": [
				moment().startOf('month'),
				moment()
			],
			"Mes pasado": [
				moment().subtract(1, 'month').startOf('month'),
				moment().subtract(1, 'month').endOf('month')
			]
		},
		locale: {
			format: "YYYY-MM-DD HH:mm",
			separator: " al ",
			applyLabel: "Aplicar Filtro",
			cancelLabel: "Cancelar",
			fromLabel: " De ",
			toLabel: " Al ",
			customRangeLabel: "Personalizado",
			weekLabel: "S",
			daysOfWeek: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sa"],
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Augosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			firstDay: 1
		},
		alwaysShowCalendars: true,

		startDate: todayOneWeekAgo,
		endDate: today,
		opens: "center"
	}, function (start, end, label) {

		$('#start_range_label_rep_marcas').attr("placeholder",

			start.format("MMM DD, YYYY, HH:mm") + " --- " + end.format("MMM DD, YYYY, HH:mm")
		);

		$('#start_date_rep_marcas').val(start.format('YYYY-MM-DD HH:mm'));
		$('#final_date_rep_marcas').val(end.format('YYYY-MM-DD HH:mm'));
	});
});
