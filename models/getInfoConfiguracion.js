var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GetInfoConfiguracion = new Schema({        
    nombre:{type: Schema.Types.String,required: true },
    criterio :[{"color": {type: Schema.Types.String,required: false },
            "umbral": {"inferior": {type: Schema.Types.String,required: false }, "superior": {type: Schema.Types.String,required: false } }
        }
   ]
});

const getInfoConfiguracion = mongoose.model("reportes",  GetInfoConfiguracion);

module.exports =  getInfoConfiguracion;