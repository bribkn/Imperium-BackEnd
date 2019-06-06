const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cred = require('./config/credentials');

const app = express();

const pool  = mysql.createPool({
    user: cred.db.user,
    host: cred.db.host,
    database: cred.db.name,
    password: cred.db.pass,
    port: cred.db.port,
});

pool.on('connection', function (connection) {
    console.log('Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
    });
});

app.use(cors());
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    var allowedOrigins = ['http://localhost:3000', 'https://localhost:3000'];
    var origin = req.headers.origin;

    if(allowedOrigins.indexOf(origin) > -1)
       res.setHeader('Access-Control-Allow-Origin', origin);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.get('/', (req, res) => {
    res.send('Hello from server');
});

//LOGIN

app.get('/login', (req, res) => {
    const { rut, password } = req.query;
    const LOGIN_QUERY = `SELECT * FROM usuarios WHERE rut=${rut} AND password='${password}'`;

    pool.query(LOGIN_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

app.get('/students', (req, res) => {
    const STUDENTS_QUERY = `SELECT * FROM alumnos`;

    pool.query(STUDENTS_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

app.get('/users', (req, res) => {
    const USERS_QUERY = `SELECT * FROM usuarios`;

    pool.query(USERS_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR ALUMNOS TRANSPORTADOS POR UN TÍO

app.get('/alumnosdetio', (req, res) => {
    const {rut} = req.query;
    const ADET_QUERY = `SELECT * FROM alumnos WHERE patente_furgon = (SELECT patente FROM furgones WHERE rut_tio=${rut})`;

    pool.query(ADET_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR ALUMNOS DE UN APODERADO
app.get('/alumnosdeapoderado', (req, res) => {
    const {rut} = req.query;
    const ADEA_QUERY = `SELECT * FROM alumnos WHERE id = (SELECT alumno_id FROM tiene WHERE usuario_rut=${rut})`;

    pool.query(ADEA_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR UN TÍO POR SU NOMBRE Y/O APELLIDO

app.get('/tiopornombre', (req, res) => {
    const {nombre, apellido} = req.query;
    const TXN_QUERY = `SELECT * FROM usuarios WHERE nombre='${nombre}' AND apellido='${apellido}' AND rol=${2}`;

    pool.query(TXN_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR A UN TÍO POR ALGUNO DE SUS ALUMNOS TRANSPORTADOS

app.get('/tioporalumno', (req, res) => {
    const {rut} = req.query;
    const TXA_QUERY = `SELECT * FROM usuarios WHERE rut= (SELECT rut_tio FROM furgones WHERE patente = (SELECT patente_furgon FROM alumnos WHERE rut=${rut}))`;

    pool.query(TXA_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR EL NUMERO DE TELEFONO DE UN USUARIO
app.get('/modificartelefono', (req, res) => {
    const {rut, telefono} = req.query;
    const TEL_QUERY = `UPDATE usuarios SET telefono = ${telefono} WHERE rut=${rut}`;

    pool.query(TEL_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR EL NUMERO DE TELEFONO DE USUARIO

//MODIFICAR EL FURGÓN DE UN ALUMNO

//MODIFICAR EL FURGÓN DE UN TÍO

//REGISTRAR UN TÍO

//REGISTRAR UN APODERADO

//REGISTRAR UN ALUMNO

// Console stuff
var port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log('Server listening on port ' + port );
});
