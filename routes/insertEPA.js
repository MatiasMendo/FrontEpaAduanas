
const setEncuestas = require('../models/setEncuestas');
const setUsuario = require('../models/setUsuarios');
const ReporteConsolidado = require('./ReporteConsolidado');
const Lista = require('./lista');
const express = require('express');
const moment = require('moment');
var axios = require('axios');
const path = require('path');
const fs = require('fs');
const log = require('../middlewares/log');
const { get } = require('../config/config');
const { appendFile } = require('fs/promises');
const logger = log.create(__filename)
const app = express();


app.use('/assets', express.static('WebInterface/assets'));

app.get('/', async function (req, res) {
	console.log(' v1.0.0');
	res.sendFile(path.join(process.cwd() + '/WebInterface/index.html'));
});


app.use('/Reportes', express.static('../Reportes'));

app.post('/ReportList', async function (req, res) {

	var fileList = [];
	fs.readdirSync('../Reportes').forEach(file => {

		if (file.startsWith(req.body.reportFilter)) {

			var fileParts          = file.replace(".xlsx", "").split("_");
			var creationDateString = fs.statSync(path.join('../Reportes', file));
			var creationDate       = moment(creationDateString.birthtime);

			var fileDetail = {
				filename    : file,
				creationDate: creationDate.format("YYYY-MM-DD HH:mm"),
				reportDate  : fileParts[2]
			};

			fileList.push(fileDetail);
		}
	});
  console.log(fileList);
	res.status(200).send(fileList);

});

app.post('/api/reporteExcel', async function (req, res) {

	logger.info("reporteExcel => inicio peticion");

	/***
	 * Validate HTTP Request data about dates range for report
	 */
	var validRequest = validatePeriod(req);
	if (!validRequest.success) {

		logger.error("Consolidado => petición invalida, " + req);
		res.status(503).send({
			success: false,
			message: validRequest.message
		});
		return;
	}

	var startDateFileName = validRequest.startDate.format("YYYYMMDD");
	var finalDateFileName = validRequest.finalDate.format("YYYYMMDD");
	var fileName          = "Reporte_Custom_" + startDateFileName + "_" + finalDateFileName + ".xlsx";

	opts = {
		startDate: validRequest.startDate.format("YYYY-MM-DD"),
		finalDate: validRequest.finalDate.format("YYYY-MM-DD"),
		fileName : fileName,
		crontab  : false
	};

	res.status(200).send({
		success: true,
		message: "Reporte en proceso de generaci&ocute;n"
	});

	await ReporteConsolidado.createReport(opts);
  //await Lista.generarLista(opts);

	req.app.io.to(req.body.roomUUID).emit('consolidado_response', {
		filename: '/Reportes/' + fileName
	});

	logger.info("ReporteConsolidado => fin peticion");

});


async function  consultaAgente(Conversationid)
{
  const cfg = log.initiate(logger, undefined, 'consultaAgente');
  var encodedData = Buffer.from(process.env.CLIENTID + ':' + process.env.CLIENTSECRET).toString('base64');

	var options = {
		method : 'POST',
			url    : process.env.URLTOKEN,
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + encodedData
			},
			data   : "grant_type=client_credentials"
	};
		var token = "";
		try {

			await axios(options).then(function (result) {

				token = result.data.access_token;

			}).catch(function (error) {

				logger.error(error.response.status + " - " + error.response.statusText);
			});

		}
		catch (error) {

			logger.error(error);
		}
    var agenteNombre = '';
    var optionsAGENTE = {
        method: 'GET',
        url: process.env.URLINTERACCION +  Conversationid,
        headers: {
            'Authorization': 'bearer ' + token
        }
    };
    

    try {			
      await  axios(optionsAGENTE).then(function (response) {
        for (var i = 0; i < response.data.participants.length; i++) {
          
          if(response.data.participants[i].purpose === "agent")
          {
            agenteNombre = response.data.participants[i].name;
          }
        }
      }).catch(function (error) {
        logger.error(error);
      });
    }
    catch (error) {
      logger.error(error);
    }
    
    
    log.info(cfg, optionsAGENTE);
    return agenteNombre


}

function validatePeriod(req) {

	/***
	 * Validate we receive almost 2 parameters (startDate and finalDate)
	 */
	if (Object.keys(req.body).length !== 3) {

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

module.exports = app;
