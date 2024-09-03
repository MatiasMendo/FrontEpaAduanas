//  Fecha : 16-02-2023
//  Autor : Alberto Barboza Herrera
//  Descripcion 
//  Este modulo crea objetos para imprecion en los reportes
class reporteNPS{
    constructor(epa_nombre,epa_fechaInicio,epa_fechaFin){
        this._nombre                    = epa_nombre;
        this._fechaInicio               = epa_fechaInicio;
        this._fechaFin                  = epa_fechaFin;
        this._TotalEstadisticos         = {"Promotores" : 0 , "Neutros" : 0 , "Detractores" : 0 , "Total" : 0 };
        this._maxPromotores             = 0;
        this._max_Detractores           = 0;
        this._arrayScoresAsesores       = []
    }
   ordenarScores(){
    this._arrayScoresAsesores.sort( function(a,b) {
        if ( parseFloat(a._sumRespuestas.NPS) > parseFloat(b._sumRespuestas.NPS)) {
            return 1;
          }
          if (parseFloat(a._sumRespuestas.NPS) < parseFloat(b._sumRespuestas.NPS)) {
            return -1;
          }          
          return 0;
     })
   }
static  integrarImagen(hoja,arreglo){
    hoja.addImage({
        path: arreglo[0],
        type: 'picture',
        position: {
            type: 'oneCellAnchor',
            from: {
              col: arreglo[1],
              colOff: arreglo[2],
              row: arreglo[3],
              rowOff: arreglo[4],
            } 
        },
        })        ;
}
  static formatoCampo(ws,elemetoEvaluar,i,j,styleContenido,maxPromotores,maxDetractores){
    styleContenido.fill.bgColor=styleContenido.fill.fgColor="white";
    let valor = elemetoEvaluar[1];
    switch(elemetoEvaluar[0])
    {
        case "promotores" :
            if ( parseFloat(elemetoEvaluar[1]) >=maxPromotores )
            styleContenido.fill.bgColor=styleContenido.fill.fgColor="#C6EFCE";  
        break
        case "detractores" :
            if ( parseFloat(elemetoEvaluar[1]) >=maxDetractores )
            styleContenido.fill.bgColor=styleContenido.fill.fgColor="#FFC7CE";  
        break
        case "NPS" :
            valor=  elemetoEvaluar[1] +"%";
        break
    }
    if (typeof valor ==="number"){
        ws.cell(i, j).number( valor).style(styleContenido); 
    }
    else{
        ws.cell(i, j).string(valor).style(styleContenido); 
    }
    
  }

    addScoreAgente(nombre,score,total_Score){
        let umbralRespuesta ={"promotor" : 0 ,"neutro" : 0 , "detractores" :0  };
        let numericoScore   = parseInt(score);
        let totalScore      = parseInt(total_Score);
        if ( numericoScore >= 8 && numericoScore <=9){
            umbralRespuesta.promotor=totalScore;
          
        }
        else
        {
            if ( numericoScore >= 6 && numericoScore <=7){
                umbralRespuesta.neutro=totalScore;
            }
            else{
                umbralRespuesta.detractores=totalScore; 
            }
        }
        if (( nombre != undefined) && nombre !="")
        { 
            // Calulo del total
            
            this._TotalEstadisticos.Promotores      += umbralRespuesta.promotor;
            this._TotalEstadisticos.Neutros         += umbralRespuesta.neutro;
            this._TotalEstadisticos.Detractores     += umbralRespuesta.detractores;
            this._TotalEstadisticos.Total           += umbralRespuesta.promotor+ umbralRespuesta.neutro +umbralRespuesta.detractores;

            // Fin calculo
            let objScoreAsesores    = this._arrayScoresAsesores.find( elemento => elemento._nombre== nombre);
            let maxPromotor     =0;
            let maxDetractores  =0;
            if (objScoreAsesores==undefined)
            {
             let temp_Agente            = new agentesScore(nombre,totalScore,umbralRespuesta.promotor,umbralRespuesta.neutro,umbralRespuesta.detractores);
             maxPromotor                = umbralRespuesta.promotor;
             maxDetractores             = umbralRespuesta.detractores;
             this._arrayScoresAsesores.push(temp_Agente);
              temp_Agente.calcaularNPS();
            }
            else{
                objScoreAsesores._sumRespuestas.promotores      +=    umbralRespuesta.promotor;
                maxPromotor=objScoreAsesores._sumRespuestas.promotores;
                objScoreAsesores._sumRespuestas.neutros         +=    umbralRespuesta.neutro;
                objScoreAsesores._sumRespuestas.detractores     +=  umbralRespuesta.detractores
                maxDetractores = objScoreAsesores._sumRespuestas.detractores;
                objScoreAsesores._sumRespuestas.total += umbralRespuesta.promotor+umbralRespuesta.neutro+umbralRespuesta.detractores;
                objScoreAsesores.calcaularNPS();
            }
            if (parseInt(this._maxPromotores) < parseInt(maxPromotor)){                
                this._maxPromotores = maxPromotor;
            }
            if (parseInt(this._max_Detractores) < parseInt(maxDetractores)){                
                this._max_Detractores = maxDetractores;
            }
        }
    }
}
class agentesScore{
    constructor(nombre,score,promotores,neutro, detractores){
         this._nombre                = nombre;
         this._score                 = score;
         this._sumRespuestas         = {"promotores" : promotores , "neutros" : neutro , "detractores" : detractores , "total" : score, "NPS" : 0 };
        
    }
    calcaularNPS(){
      if (this._sumRespuestas.total > 0){
        let tmp_nps= ((this._sumRespuestas.promotores - this._sumRespuestas.detractores)/this._sumRespuestas.total)*100;
        tmp_nps = tmp_nps.toFixed(2)
        this._sumRespuestas.NPS = tmp_nps > 0 ? tmp_nps : 0;
      }
   }
   
 }


module.exports= reporteNPS;