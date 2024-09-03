var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var setUsuarios = new Schema({
    nombre:{
        type: Schema.Types.String,
        required: true
    },
    usuario:{
        type: Schema.Types.String,
        required: true
    },
    contrasenia:{
        type: Schema.Types.String,
        required: true
    }
});

const setUsuario = mongoose.model("usuarios_encuestas", setUsuarios);

module.exports = setUsuario;