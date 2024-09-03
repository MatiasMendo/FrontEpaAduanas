//const callcenter = require('../models/view_callcenter');
const ReporteConsolidado = require('./ReporteConsolidado');
const ReporteNPS = require('./ReporteNPS');
const setUsuario = require('../models/setUsuarios');
const SetEncuestas = require('../models/setEncuestas');
const axios      = require("axios");
const bodyParser = require('body-parser');
const express    = require('express');
const moment     = require('moment');
const lr         = require('readline');
const async      = require('async');
const fs         = require('fs');
const path       = require('path');
const router     = express.Router();

var logger = fs.createWriteStream('./log/log.log', {
	flags: 'a'
});


router.use('/assets', express.static('WebInterface/assets'));
router.use('/css', express.static('WebInterface/css'));

router.use('/assets', express.static('app-8444/WebInterface/assets'));
router.use('/css', express.static('app-8444/WebInterface/css'));
//router.use('/Reportes', express.static('../Reportes'));
router.use('/ReportStorage', express.static('ReportStorage'));

router.post('/api/reporteExcel', async function (req, res) {

	console.log("reporteExcel => inicio peticion");

	/***
	 * Validate HTTP Request data about dates range for report
	 */
	var validRequest = validatePeriod(req);
	if (!validRequest.success) {

		//logger.error("Consolidado => petición invalida, " + req);
		res.status(503).send({
			success: false,
			message: validRequest.message
		});
		return;
	}

	var startDateFileName = validRequest.startDate.format("YYYYMMDD");
	var finalDateFileName = validRequest.finalDate.format("YYYYMMDD");
	var fileName          = "Reporte_EPA_" + req.body.datoCampania + "_" + startDateFileName + "_" + finalDateFileName + ".xlsx";
	if(req.body.reporte == "nps"){
		fileName = fileName.replace('_EPA_', '_NPS_');
		//fileName          = "Reporte_NPS_Encuestas-Lealtad-V1_" + startDateFileName + "_" + finalDateFileName + ".xlsx";
	}

	opts = {
		startDate: validRequest.startDate.format('YYYY-MM-DDT00:00:00.000Z'),
		finalDate: validRequest.finalDate.format("YYYY-MM-DDT23:59:59.000Z"),
		fileName : fileName,
		crontab  : false,
		datoEncuesta: req.body.datoCampania
	};

	res.status(200).send({
		success: true,
		message: "Reporte en proceso de generaci&ocute;n"
	});

	if(req.body.reporte == "nps"){
		await ReporteNPS.createReport(opts);
	}else{
		await ReporteConsolidado.createReport(opts);
	}

	//await ReporteConsolidado.createReport(opts);

	/* Secomenta por gneerar error se espera solucionar para la descarga del reporte
	req.app.io.to(req.body.roomUUID).emit('voz_historico_response', {
		filename: '/ReportStorage/' + fileName
	});*/

	//logger.info("ReporteConsolidado => fin peticion");

});

// router.post('/ReportList', async function (req, res) {

// 	var fileList = [];
// 	fs.readdirSync(path.join(process.cwd(), 'ReportStorage')).forEach(file => {

// 		if (file.startsWith(req.body.reportFilter)) {

// 			var fileParts          = file.replace(".xlsx", "").split("_");
// 			var creationDateString = fs.statSync(path.join('ReportStorage', file));
// 			var creationDate       = moment(creationDateString.birthtime);

// 			var fileDetail = {
// 				filename    : file,
// 				creationDate: creationDate.format("YYYY-MM-DD HH:mm"),
// 				reportDate  : fileParts[2]
// 			};

// 			fileList.push(fileDetail);
// 		}
// 	});

// 	res.status(200).send(fileList);

// });

router.post('/ReportList', async function (req, res) {
	console.log("Listado Reportes Buscando " + req.body.reportFilter);
	//console.log("Buscando " + req.body.reportFilter);
	var fileList = [];
	fs.readdirSync('ReportStorage').forEach(file => {
		if (file.startsWith(req.body.reportFilter)) {
			var fileParts          = file.replace(".xlsx", "").split("_");
			var creationDateString = fs.statSync(path.join('ReportStorage', file));
			var creationDate       = moment(creationDateString.birthtime);
			var fileDetail = {
				filename    : file,
				creationDate: creationDate.format("YYYY-MM-DD HH:mm"),
				reportDate  : fileParts[2]
			};

			fileList.push(fileDetail);
		}
	});
  console.log("Listado Reportes Encontrado " + fileList.length);
  res.status(200).send(fileList);
});

function validatePeriod(req) {

	console.log(req.body);

	/***
	 * Validate we receive almost 2 parameters (startDate and finalDate)
	 */
	if (Object.keys(req.body).length !== 4) {

		return {
			sucess : false,
			code   : 503,
			message: 'Debe enviar 2 parametros obligatorios: Fecha Inicial y Fecha Final, ambos con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05'
		};
	}

	/***
	 * Validate one of the parameters called startDate and came in correct format
	 */
	if (req.body.startDate) {

		if (!moment(req.body.startDate, "YYYY-MM-DD HH:mm", true).isValid()) {

			//res.writeHead(503, {'Content-Type': 'text/html'});
			//res.end('El par&aacute;metro <strong>startDate</strong> debe incluirse con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05');
			return {
				sucess : false,
				code   : 503,
				message: 'El par&aacute;metro <strong>Fecha Inicial</strong> debe incluirse con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05'
			};
		}
	}
	else {

		return {
			sucess : false,
			code   : 503,
			message: 'No se encuentra el par&aacute;metro <strong>Fecha Inicial</strong> debe incluirse con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05'
		};
	}

	/***
	 * Validate one of the parameters called finalDate and came in correct format
	 */
	if (req.body.finalDate) {

		if (!moment(req.body.finalDate, "YYYY-MM-DD HH:mm", true).isValid()) {

			return {
				sucess : false,
				code   : 503,
				message: 'El par&aacute;metro <strong>Fecha Final</strong> debe incluirse con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05'
			};
		}
	}
	else {

		return {
			sucess : false,
			code   : 503,
			message: 'No se encuentra el par&aacute;metro <strong>Fecha Final</strong> debe incluirse con formato: yyyy-MM-dd HH:mm, ejemplo: 2021-01-23 17:05'
		};
	}

	var startDate = moment(req.body.startDate, "YYYY-MM-DD HH:mm", true);
	var finalDate = moment(req.body.finalDate, "YYYY-MM-DD HH:mm", true);

	if (!startDate.isBefore(finalDate, 'seconds')) {

		return {
			sucess : false,
			code   : 503,
			message: 'El par&aacute;metro <strong>Fecha Final</strong> debe de ser mayor a la fecha de Fecha Inicial'
		};
	}

	return {
		success  : true,
		code     : 202,
		startDate: startDate,
		finalDate: finalDate
	};
}

router.get('/', async function (req, res) {
	res.sendFile(path.join(process.cwd() + '/WebInterface/reporte.html'));
});



// router.get('/', async function (req, res) {
// 	//console.log('Saludos desde KonexoEncuestas v1.0');
// 	//console.log(typeof req.originalUrl);
// 	if(req.originalUrl == "/?1")
// 	{
// 	res.sendFile(path.join(process.cwd() + '/WebInterface/reporte.html'));

// 	}
// 	else
// 	{
// 	res.sendFile(path.join(process.cwd() + '/WebInterface/index.html'));

// 	}
// });

router.get('/reporte', async function (req, res) {
	console.log('Saludos desde KonexoEncuestas v1.0');
});


router.post('/api/setUsuario', async function (req, res) {
	console.log(req.body);
	var resp = {
	    resultado: "NOK",
	    descripcion: "Error en la asignacion"
	}
	const opciones = new setUsuario( 
      {      
        "nombre"  		: req.body.nombre ,
        "usuario"   	: req.body.usuario ,
        "contrasenia"  	: req.body.contrasenia
      }
    );
    await opciones.save();
    resp.resultado = "OK";
    resp.descripcion = "Registro Exitoso";

  	return res.status(200).json(resp)

});

router.post('/api/getUsuario', async function (req, res) {
	console.log(req.body);
	var resp = {
	    resultado: "NOK",
	    descripcion: "Error en la asignacion"
	}
	var consul = await setUsuario.find({ "usuario": req.body.usuario , "contrasenia": req.body.contrasenia});
	if (consul.length > 0) 
	{
	    resp.resultado = "OK";
	    resp.descripcion = consul;
	}
	else
	{
	    resp.resultado = "NOK";
	    resp.descripcion = "No existe el usuario";
	}
  	return res.status(200).json(resp)

});

router.post('/api/getCampania', async function (req, res) {
	console.log(req.body);
	var resp = {
	    resultado: "NOK",
	    descripcion: "Error en la asignacion"
	}
	
	var consul = await SetEncuestas.distinct("Encuesta");

    resp.resultado = consul;
    resp.descripcion = "Registro Exitoso";

  	return res.status(200).json(resp)

});




module.exports           = router;
//module.exports.cargaAnis = cargaAnis;
