

const express = require('express');
var axios = require('axios');
const path = require('path');
const fs = require('fs');
const log = require('../middlewares/log');
const moment = require('moment');

var lista = {

	generarLista: async function (parameters) {
		var fileList = [];
		fs.readdirSync(path.join(process.cwd(), 'ReportStorage')).forEach(file => {

			var fileParts = file.replace(".xlsx", "").split("_");
			var creationDateString = fs.statSync(path.join( process.cwd(), 'ReportStorage'), file);
			var creationDate = moment(creationDateString.birthtime);

			var fileDetail = {
				filename: file,
				creationDate: creationDate.format("YYYY-MM-DD HH:mm"),
				reportDate: fileParts[2]
			};

			fileList.push(fileDetail);

		});
		console.log(fileList);
	}
};
module.exports = lista;
