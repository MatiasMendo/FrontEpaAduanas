
const { get } = require('./config/config');
const bodyParser = require('body-parser');
const log = require('./middlewares/log');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const fs = require('fs');
const ip = require('ip');
const dotenv = require('dotenv');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require("morgan");

require('dotenv').config();
const app = express()
const logger = log.create(__filename)

// app.use(morgan('combined', {
// 	skip: function (req, res) { return res.statusCode < 400 }
// }));
// // Proxy endpoints

// app.use('/app-8443', createProxyMiddleware({
// 	//target: "https://localhost:8443",
// 	target: "https://encuestas-konexo.sixbell.com:8443",
// 	//target: "https://150.239.166.76localhost:8443",
// 	changeOrigin: true,
// 	pathRewrite: {
// 			[`^/app-8443`]: '',
// 	},
// }));

// app.use('/app-8444', createProxyMiddleware({
// 	target: "https://encuestas-konexo.sixbell.com:8444",
// 	changeOrigin: true,
// 	pathRewrite: {
// 			[`^/app-8444`]: '',
// 	},
// }));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use(require('./routes/app.js'));

dotenv.config({
    path: path.join(__dirname, '.env')
});

// Rutas de los archivos de certificados que has proporcionado
let keyPath = path.join(__dirname,"Certificado Sixbell 2024/Sixbell.com_2024.key");
let certPath = path.join(__dirname,"Certificado Sixbell 2024/Sixbell.com_2024.crt");
let caPath = [
    path.join(__dirname,"Certificado Sixbell 2024/IntermedioAlpha.crt"),
    path.join(__dirname,"Certificado Sixbell 2024/RootAlpha_2024.crt")
];

let credentials = {
    key: fs.readFileSync(keyPath), // Clave privada
    cert: fs.readFileSync(certPath), // Certificado SSL
    ca: caPath.map(path => fs.readFileSync(path)), // Certificados de la cadena
    requestCert: false,
    rejectUnauthorized: false
}

let https = require('https').createServer(credentials, app).listen(process.env.PORT, async function () {
    const cfg = log.initiate(logger, undefined, 'app.listen')
    console.clear()

    log.info(cfg, `server listen >> ${ip.address()}:`, process.env.PORT);

    const connectionString = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}`;

    await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //useCache					: false
    }).then(() => {
        log.info(cfg, 'MongoDB connected [' + process.env.MONGODB_URL + '/' + process.env.MONGODB_DATABASE + ']');
    }).catch(error => {
        log.error(cfg, 'No se ha logrado conectar a MongoDb :', error);
        process.exit(1);
    });
});




