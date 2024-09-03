const SetEncuestas      = require('../models/setEncuestas');
const getInfoConfiguracion    = require('../models/getInfoConfiguracion');
const estadisticos      = require('./Estadisticos')
const excel = require('excel4node');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const log = require('../middlewares/log');
const { json } = require('body-parser');
const logger = log.create(__filename);



var ReporteConsolidado =
{
    createReport: async function (parameters) {
        //const cfg = log.request(logger, parameters, '/createReport');
        
        console.log('Start createReport: ' + JSON.stringify(parameters));
        var array_consulta;        
        let array_configuracion;
        let flag_MostrarLimiteNPS   = true;
        let indiceUmbral            = 6;
        var startDate               = moment(parameters.startDate, "YYYY-MM-DDTHH:mm").toDate();
        var finalDate               = moment(parameters.finalDate, "YYYY-MM-DDTHH:mm").toDate();
        var EPA_obj_NPS             = new estadisticos(parameters.datoEncuesta,"startDate","finalDate");    
        // Obtener configuracion        
         
        // FIn configuracion
        var objTmpForma;
        if (parameters.crontab) {
            var currentDateFecha = moment().tz("America/Merida").format('YYYY-MM-DD');
            array_consulta = await SetEncuestas.find({ Fecha: currentDateFecha });
            
        }
        else {
           
            array_configuracion = await getInfoConfiguracion.find({nombre : "Reporte_NPS"});                              
            let strobjTmpForma  = JSON.stringify(array_configuracion);
             objTmpForma        = JSON.parse(strobjTmpForma);                         
             var arrayUmbralNPS = objTmpForma[0].criterio;      
            array_consulta      = await SetEncuestas.aggregate(
                [
                    {$match : {  
                        Fecha: {
                            $gte: startDate,
                            $lte: finalDate
                        }, Encuesta: parameters.datoEncuesta

                    } },   
                    {$project: {_id : 0,Agente : 1 , Respuesta1 : 1 }}, 
                    {$group: {_id: {"Agente":"$Agente","Respuesta" : "$Respuesta1"},
                   "Score": {$sum: 1}}
                  
                    }

                  ]

            );
        }
        
        if (array_consulta.length > 0)
        {            
            array_consulta.forEach(consagentes =>{
                EPA_obj_NPS.addScoreAgente(consagentes._id.Agente ,consagentes._id.Respuesta ,consagentes.Score   ) ;
            });            
            EPA_obj_NPS.ordenarScores();
            var wb                      = new excel.Workbook();
            let nombreHoja              = objTmpForma[0].generalidad.nombreHoja ;   
            var options                 =  objTmpForma[0].estilo_hoja ;                  
            var cs                      = wb.addWorksheet("consolidado", options);            
            var ws                      = wb.addWorksheet(nombreHoja, options);            
            var style                   = wb.createStyle({
                font: {
                    color: '#000000',
                    bold: true,
                    name: 'Calibri',
                    size: 12,
                }
            });
            let headerStyle             = objTmpForma[0].estilo_Cabecera;          
            var styleContenido          = objTmpForma[0].estilo_contenido;                    
            let styleContenidoComodin   = JSON.parse(JSON.stringify(objTmpForma[0].estilo_contenido));    
            let arrayEncabezado         = objTmpForma[0].columnas;
            let generalidad             = objTmpForma[0].generalidad;
            let indice                  = generalidad.inicio_columna;   
            let arrayConsolidado        = [];
            cs.cell(indiceUmbral,6,indiceUmbral,7,true).string("Umbrales % NPS").style(headerStyle);indiceUmbral++;
            estadisticos.integrarImagen(cs,[path.join(process.cwd(),'asset/img/LogoPosada_3.png'),2,'0.10in',1,0]);    
            // Cabecera del reporte
                console.log(parameters.datoEncuesta);  
                cs.cell(2, 2, 2, 17, true).string("Net Promoter Score(NPS)").style({ "alignment" : {"horizontal": "center","vertical":"center"} ,font: { bold: true,size :24 } , border :{bottom :{style:"thin"}}});              
                ws.row(1).setHeight(5);
                ws.cell(2, 5, 2, 7, true).string(moment(parameters.startDate).format("DD/MM/YYYY HH:mm:ss") + " - " + moment(parameters.finalDate).format("DD/MM/YYYY")).style({ font: { bold: false } }).style(styleContenido);;                
                ws.cell(2, 4).string("Fecha").style(headerStyle).style({"alignment" : {"horizontal": "left","vertical":"center"}});
                ws.cell(3, 4).string("Encuesta").style(headerStyle).style({"alignment" : {"horizontal": "left","vertical":"center"}});
                ws.cell(3, 5, 3, 7, true).string(parameters.datoEncuesta).style({ font: { bold: false } }).style(styleContenido);;                
                ws.cell(5, 2, 5, 7).style(style).style({ fill: { type: 'pattern', patternType: 'solid', bgColor: '#6bb1fd', fgColor: '#6bb1fd' } });          
                ws.row(4).setHeight(2) ;
                ws.row(6).freeze();  
            // Fin cabecera         
                           
            arrayEncabezado.forEach(elemento => {
                headerStyle.fill.bgColor =  headerStyle.fill.fgColor=elemento.color;    
                ws.column(indice).setWidth(elemento.dimencion.ancho);                           
                ws.cell(generalidad.inicio_Fila, indice++).string(elemento.Cabecera).style(style).style(headerStyle);                 
            })                
            ws.row(generalidad.inicio_Fila).filter();
            estadisticos.integrarImagen(ws,[path.join(process.cwd(),'asset/img/LogoPosada_3.png'),2,'0.10in',1,0]);          

            // Fin generacion de reporte
            
            // Publicar reporte
            if (fs.existsSync(path.join(process.cwd(), 'ReportStorage', parameters.fileName))) {
                parameters.fileName = parameters.fileName.replace('.xl', ' (' + moment().format('ss') + ').xl');
                console.log( "El archivo EXISTE Sobreescribiendo: " + parameters.fileName);
                wb.write(path.join(process.cwd(), 'ReportStorage', parameters.fileName));
            } else {
                wb.write(path.join(process.cwd(), 'ReportStorage', parameters.fileName));
                console.log( "El archivo NO EXISTE creando  " + parameters.fileName);
            }
            var initialRow = 6;
            cs.cell(indiceUmbral,6).string("Color").style(headerStyle);
            cs.cell(indiceUmbral++,7).string("Limites").style(headerStyle);

            EPA_obj_NPS._arrayScoresAsesores.forEach(elementoAS =>{   
                let indiceAtt = 2;
                ws.cell(initialRow, indiceAtt++).string( elementoAS._nombre).style(styleContenido);
                 arrayConsolidado = Object.entries(elementoAS._sumRespuestas);        
                styleContenido.alignment.horizontal='center';      
                arrayConsolidado.forEach(elementosAtributos =>{                     
                    estadisticos.formatoCampo(ws,elementosAtributos,initialRow,indiceAtt,styleContenido,EPA_obj_NPS._maxPromotores,EPA_obj_NPS._max_Detractores);
                    indiceAtt++;                
                })
                styleContenido.alignment.horizontal='left';                                                                       
                let tempimagen      ='promotores.png';                
               

                 arrayUmbralNPS.forEach(umbralElemento =>{
                    if (flag_MostrarLimiteNPS){                     
                       styleContenidoComodin.alignment.horizontal="left";
                       styleContenidoComodin.fill.bgColor=styleContenidoComodin.fill.fgColor=umbralElemento.color;                     
                       cs.cell(indiceUmbral,6).string(umbralElemento.color).style(styleContenidoComodin);
                       styleContenidoComodin.fill.bgColor=styleContenidoComodin.fill.fgColor="white"; 
                       let cadena ="";
                       if (parseInt(umbralElemento.umbral.superior) >=100){
                        cadena = umbralElemento.umbral.inferior.toString() +"+";
                       }
                       else{
                        
                           if (parseInt(umbralElemento.umbral.inferior) <= 0){
                            cadena = umbralElemento.umbral.superior.toString() +"-";
                           }
                           else{
                               cadena = umbralElemento.umbral.inferior.toString()+"-"+ umbralElemento.umbral.superior.toString();
                           }
                       }
                       cs.cell(indiceUmbral++,7).string(cadena).style(styleContenidoComodin);
                    }
                    if ( parseInt(elementoAS._sumRespuestas.NPS) >= parseInt(umbralElemento.umbral.inferior)  && parseInt(elementoAS._sumRespuestas.NPS) <= parseInt(umbralElemento.umbral.superior)) 
                    {
                        styleContenido.fill.bgColor=styleContenido.fill.fgColor=umbralElemento.color; 
                        tempimagen=umbralElemento.img;
                    }
                 });
                 flag_MostrarLimiteNPS=false;                
                 estadisticos.integrarImagen(ws,[path.join(process.cwd(),'asset/img/' + tempimagen),7,'0.67in',initialRow,'0.01in']);           
                ws.cell(initialRow++, 7).style(styleContenido);
                styleContenido.fill.bgColor=styleContenido.fill.fgColor="#FFFFFF";                   
            })
            // consolidar informacion     
            indiceUmbral            = 6;          
            cs.cell(indiceUmbral,2).string("Categoria").style(styleContenido).style(headerStyle); 
            cs.cell(indiceUmbral,3).string("Totales").style(styleContenido).style(headerStyle); 
            cs.cell(indiceUmbral++,4).string("Porcentajes").style(styleContenido).style(headerStyle);
            arrayConsolidado        = Object.entries(EPA_obj_NPS._TotalEstadisticos);           
            let TotalEPAS           = EPA_obj_NPS._TotalEstadisticos.Total;
            arrayConsolidado.forEach( IndicadoresNPS => {
              let arrayValores = IndicadoresNPS;              
                for (i =0; i < arrayValores.length ; i++){
                    styleContenidoComodin.fill.bgColor=styleContenidoComodin.fill.fgColor="white";  
                    if (IndicadoresNPS[0].toUpperCase()=="TOTAL"){
                        styleContenidoComodin.fill.bgColor=styleContenidoComodin.fill.fgColor="#B4C6E7";  
                    }
                   if (typeof arrayValores[i] ===  "string"){
                       styleContenidoComodin.alignment.horizontal="left";                       
                       let elementoEncontrado = arrayUmbralNPS.find(elemento => elemento.nombre.toUpperCase()==IndicadoresNPS[i].toUpperCase() );
                       if (elementoEncontrado != undefined  )
                       {
                        styleContenidoComodin.fill.bgColor=styleContenidoComodin.fill.fgColor=elementoEncontrado.color;                        
                        
                       }                   
                       cs.cell(indiceUmbral,2+i).string(IndicadoresNPS[i]).style(styleContenidoComodin); 
                   }
                   if (typeof arrayValores[i] ===  "number"){                       
                       styleContenidoComodin.alignment.horizontal="center";
                       cs.cell(indiceUmbral,2+i).number(IndicadoresNPS[i]).style(styleContenidoComodin);
                       let calPorcentaje = ((parseFloat(TotalEPAS) > 0 ) ? ((IndicadoresNPS[1])/parseFloat(TotalEPAS))*100 :0).toFixed(2);
                       cs.cell(indiceUmbral,4).string(calPorcentaje.toString() +"%").style(styleContenidoComodin);   
                   }
                }           
             indiceUmbral++;
            });            
            
            // Fin publicar
        }
        else{
            console.log( "[AR] :: No hay registros");
        }
    }
};
module.exports = ReporteConsolidado;