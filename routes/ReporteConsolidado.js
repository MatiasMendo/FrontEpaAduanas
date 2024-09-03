const SetEncuestas = require('../models/setEncuestas');
const excel = require('excel4node');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const log = require('../middlewares/log');
const logger = log.create(__filename);

var ReporteConsolidado =
{
    createReport: async function (parameters) {
        //const cfg = log.request(logger, parameters, '/createReport');
        console.log('Start createReport: ' + JSON.stringify(parameters));
        var array_consulta;

        var startDate = moment(parameters.startDate, "YYYY-MM-DDTHH:mm").toDate();
        var finalDate = moment(parameters.finalDate, "YYYY-MM-DDTHH:mm").toDate();

        /*console.log("parameters.startDate :: ", startDate);
        console.log("parameters.finalDate :: ", finalDate);*/

        if (parameters.crontab) {
            var currentDateFecha = moment().tz("America/Merida").format('YYYY-MM-DD');
            array_consulta = await SetEncuestas.find({ Fecha: currentDateFecha });
        }
        else {
            array_consulta = await SetEncuestas.find({
                Fecha: {
                    $gte: startDate,
                    $lte: finalDate
                }, Encuesta: parameters.datoEncuesta
            });
        }

        if (array_consulta.length > 0) {
            var wb = new excel.Workbook();
            var options = {
                margins: {
                    left: 1.5,
                    right: 1.5,
                },
            };
            // Add Worksheets to the workbook
            var ws = wb.addWorksheet('Sheet1', options);
            // Create a reusable style
            var style = wb.createStyle({
                font: {
                    color: '#000000',
                    bold: true,
                    name: 'Calibri',
                    size: 12,
                }
            });
            let headerStyle = {
                alignment: {
                    horizontal: 'center'
                },
                font: {
                    bold: true
                }
            };

            var styleContenido = wb.createStyle({
                font: {
                    color: 'black',
                    size: 11
                },
                border: {
                    left: {
                        style: 'thin',
                        color: 'black'
                    },
                    right: {
                        style: 'thin',
                        color: 'black'
                    },
                    top: {
                        style: 'thin',
                        color: 'black'
                    },
                    bottom: {
                        style: 'thin',
                        color: 'black'
                    },
                    outline: false
                }
            });

            ws.cell(1, 2, 1, 2, true).string(moment(parameters.startDate).format("DD/MM/YYYY HH:mm:ss") + " - " + moment(parameters.finalDate).format("DD/MM/YYYY")).style({ font: { bold: false } });
            ws.cell(1, 1).string("Fecha: ").style(style).style({ font: { bold: false } });
            console.log(parameters.datoEncuesta);
            ws.cell(2, 2, 2, 2, true).string(parameters.datoEncuesta).style({ font: { bold: false } });
            ws.cell(2, 1).string("Encuesta: ").style(style).style({ font: { bold: false } });

            ws.cell(5, 1, 5, 19).style(style).style({ fill: { type: 'pattern', patternType: 'solid', bgColor: '#6bb1fd', fgColor: '#6bb1fd' } });

            ws.column(1).setWidth(45);
            ws.column(2).setWidth(30);
            ws.column(3).setWidth(30);
            ws.column(4).setWidth(30);
            ws.column(5).setWidth(30);
            ws.column(6).setWidth(30);
            ws.column(7).setWidth(30);

            ws.cell(5, 1).string("Conversationid").style(style).style(headerStyle);
            ws.cell(5, 2).string("Fecha").style(style).style(headerStyle);
            ws.cell(5, 3).string("Ani").style(style).style(headerStyle);
            ws.cell(5, 4).string("Agente").style(style).style(headerStyle);
            ws.cell(5, 5).string("Cola").style(style).style(headerStyle);
            ws.cell(5, 6).string("Division").style(style).style(headerStyle);
            ws.cell(5, 7).string("Idioma").style(style).style(headerStyle);
            ws.cell(5, 8).string("Buzon").style(style).style(headerStyle);
            ws.cell(5, 9).string("Nombre Buzon").style(style).style(headerStyle);
            ws.cell(5, 10).string("Respuesta1").style(style).style(headerStyle);
            ws.cell(5, 11).string("Respuesta2").style(style).style(headerStyle);
            ws.cell(5, 12).string("Respuesta3").style(style).style(headerStyle);
            ws.cell(5, 13).string("Respuesta4").style(style).style(headerStyle);
            ws.cell(5, 14).string("Respuesta5").style(style).style(headerStyle);
            ws.cell(5, 15).string("Respuesta6").style(style).style(headerStyle);
            ws.cell(5, 16).string("Respuesta7").style(style).style(headerStyle);
            ws.cell(5,17).string("Respuesta8").style(style).style(headerStyle);
            ws.cell(5,18).string("Respuesta9").style(style).style(headerStyle);
            ws.cell(5,19).string("Respuesta10").style(style).style(headerStyle);

            var initialRow = 6;
            console.log(array_consulta.length);

            for (let i = 0; i < array_consulta.length; i++) {

                //console.log("Registro Inserta: " + JSON.stringify(array_consulta[i]));

                if (array_consulta[i].Conversationid == "undefined" || array_consulta[i].Conversationid == undefined) {
                    ws.cell(initialRow, 1).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 1).string(array_consulta[i].Conversationid).style(styleContenido);
                }
                if (array_consulta[i].Fecha == "undefined" || array_consulta[i].Fecha == undefined) {
                    ws.cell(initialRow, 2).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 2).string(moment(array_consulta[i].Fecha).format('DD-MM-YYYY  HH:mm:ss')).style(styleContenido);
                }

                if (array_consulta[i].Ani == "undefined" || array_consulta[i].Ani == undefined) {
                    ws.cell(initialRow, 3).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 3).string(array_consulta[i].Ani).style(styleContenido);
                }
                if (array_consulta[i].Agente == "undefined" || array_consulta[i].Agente == undefined || array_consulta[i].Agente == null) {
                    ws.cell(initialRow, 4).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 4).string(array_consulta[i].Agente).style(styleContenido);
                }

                if (array_consulta[i].Cola == "undefined" || array_consulta[i].Cola == undefined || array_consulta[i].Cola == null) {
                    ws.cell(initialRow, 5).string("-").style(styleContenido);
                    //console.log("Col:--" + array_consulta[i].Cola+"--");
                } else {
                    ws.cell(initialRow, 5).string(array_consulta[i].Cola).style(styleContenido);
                }
                if (array_consulta[i].Division == "undefined" || array_consulta[i].Division == undefined || array_consulta[i].Division == null) {
                    ws.cell(initialRow, 6).string("-").style(styleContenido);
                    //console.log("Div:--" + array_consulta[i].Division+"--");
                } else {
                    ws.cell(initialRow, 6).string(array_consulta[i].Division).style(styleContenido);
                }
                if (array_consulta[i].Idioma == "undefined" || array_consulta[i].Idioma == undefined || array_consulta[i].Idioma == null) {
                    ws.cell(initialRow, 7).string("-").style(styleContenido);
                    //console.log("Div:--" + array_consulta[i].Idioma+"--");
                } else {
                    ws.cell(initialRow, 7).string(array_consulta[i].Idioma).style(styleContenido);
                }
                if (array_consulta[i].Buzon == "undefined" || array_consulta[i].Buzon == undefined || array_consulta[i].Buzon == null) {
                    ws.cell(initialRow, 8).string("-").style(styleContenido);
                    //console.log("Div:--" + array_consulta[i].Buzon+"--");
                } else {
                    ws.cell(initialRow, 8).string(array_consulta[i].Buzon).style(styleContenido);
                }
                if (array_consulta[i].NombreBuzon == "undefined" || array_consulta[i].NombreBuzon == undefined || array_consulta[i].NombreBuzon == null) {
                    ws.cell(initialRow, 9).string("-").style(styleContenido);
                    //console.log("Div:--" + array_consulta[i].NombreBuzon+"--");
                } else {
                    ws.cell(initialRow, 9).string(array_consulta[i].NombreBuzon).style(styleContenido);
                }
                if (array_consulta[i].Respuesta1 == "undefined" || array_consulta[i].Respuesta1 == undefined || array_consulta[i].Respuesta1 == null) {
                    ws.cell(initialRow, 10).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 10).string(array_consulta[i].Respuesta1).style(styleContenido);
                }
                if (array_consulta[i].Respuesta2 == "undefined" || array_consulta[i].Respuesta2 == undefined || array_consulta[i].Respuesta2 == null) {
                    ws.cell(initialRow, 11).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 11).string(array_consulta[i].Respuesta2).style(styleContenido);
                }
                if (array_consulta[i].Respuesta3 == "undefined" || array_consulta[i].Respuesta3 == undefined || array_consulta[i].Respuesta3 == null) {
                    ws.cell(initialRow, 12).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 12).string(array_consulta[i].Respuesta3).style(styleContenido);
                }
                if (array_consulta[i].Respuesta4 == "undefined" || array_consulta[i].Respuesta4 == undefined || array_consulta[i].Respuesta4 == null) {
                    ws.cell(initialRow, 13).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 13).string(array_consulta[i].Respuesta4).style(styleContenido);
                }
                if (array_consulta[i].Respuesta5 == "undefined" || array_consulta[i].Respuesta5 == undefined || array_consulta[i].Respuesta5 == null) {
                    ws.cell(initialRow, 14).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 14).string(array_consulta[i].Respuesta5).style(styleContenido);
                }
                if (array_consulta[i].Respuesta6 == "undefined" || array_consulta[i].Respuesta6 == undefined || array_consulta[i].Respuesta6 == null) {
                    ws.cell(initialRow, 15).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 15).string(array_consulta[i].Respuesta6).style(styleContenido);
                }
                if (array_consulta[i].Respuesta7 == "undefined" || array_consulta[i].Respuesta7 == undefined || array_consulta[i].Respuesta7 == null) {
                    ws.cell(initialRow, 16).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 16).string(array_consulta[i].Respuesta7).style(styleContenido);
                }
                if (array_consulta[i].Respuesta8 == "undefined" || array_consulta[i].Respuesta8 == undefined || array_consulta[i].Respuesta8 == null) {
                    ws.cell(initialRow, 17).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 17).string(array_consulta[i].Respuesta8).style(styleContenido);
                }
                if (array_consulta[i].Respuesta9 == "undefined" || array_consulta[i].Respuesta9 == undefined || array_consulta[i].Respuesta9 == null) {
                    ws.cell(initialRow, 18).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 18).string(array_consulta[i].Respuesta9).style(styleContenido);
                }
                if (array_consulta[i].Respuesta10 == "undefined" || array_consulta[i].Respuesta10 == undefined || array_consulta[i].Respuesta10 == null) {
                    ws.cell(initialRow, 19).string("-").style(styleContenido);
                } else {
                    ws.cell(initialRow, 19).string(array_consulta[i].Respuesta10).style(styleContenido);
                }
                initialRow++;
            }

            if (fs.existsSync(path.join(process.cwd(), 'ReportStorage', parameters.fileName))) {
                //log.info(cfg, "El archivo EXISTE Sobreescribiendo: " + parameters.fileName);
                console.log( "El archivo EXISTE Sobreescribiendo: " + parameters.fileName);
                wb.write(path.join(process.cwd(), 'ReportStorage', parameters.fileName));
            } else {
                wb.write(path.join(process.cwd(), 'ReportStorage', parameters.fileName));
                console.log( "El archivo NO EXISTE creando  " + parameters.fileName);
            }
        }
        else {
            console.log( "[AR] :: No hay registros");
        }
    }
};
module.exports = ReporteConsolidado;