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
    const STUDENTS_QUERY = `SELECT * FROM alumnos order by id`;

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
    const USERS_QUERY = `SELECT * FROM usuarios ORDER BY rut`;

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

app.get('/users/search', (req, res) => {
    const { rut } = req.query;
    const USERS_QUERY = `SELECT * FROM usuarios WHERE rut = ${rut}`;

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
app.get('/students/tio', (req, res) => {
    const { rut } = req.query;
    const ADET_QUERY = `SELECT * FROM alumnos WHERE patente_furgon = (SELECT patente FROM furgones WHERE rut_tio=${rut}) ORDER BY id`;

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
app.get('/students/apoderado', (req, res) => {
    const {rut} = req.query;
    const ADEA_QUERY = `SELECT * FROM alumnos WHERE id = (SELECT alumno_id FROM tiene WHERE usuario_rut=${rut}) order by id`;

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
app.get('/tio', (req, res) => {
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
app.get('/tio/search', (req, res) => {
    const {id} = req.query;
    const TXA_QUERY = `SELECT * FROM usuarios WHERE rut= (SELECT rut_tio FROM furgones WHERE patente = (SELECT patente_furgon FROM alumnos WHERE id=${id}))`;

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

//MODIFICAR DATOS DEL USUARIO
app.get('/users/modify', (req, res) => {
    const {rut, password, nombre, apellido, telefono, direccion} = req.query;
    const MODUS_QUERY = `UPDATE usuarios SET password = '${password}', nombre = '${nombre}', apellido = '${apellido}',
    telefono = ${telefono}, direccion = '${direccion}' WHERE rut=${rut}`;

    pool.query(MODUS_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR DATOS DE UN ALUMNO
app.get('/students/modify', (req, res) => {
    const {rut, nombre, apellido, nivel, patente_furgon, curso} = req.query;
    const MODAL_QUERY = `UPDATE alumnos SET nombre = '${nombre}', apellido = '${apellido}', nivel = '${nivel}',
    patente_furgon = '${patente_furgon}', curso = '${curso}' WHERE id=${id}`;

    pool.query(MODAL_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR EL FURGÓN DE UN TÍO
app.get('/furgon/modify', (req, res) => {
    const {patente, rut_tio, marca, modelo, capacidad, ano} = req.query;
    const MODFUR_QUERY = `UPDATE furgones SET rut_tio = ${rut_tio}, marca = '${marca}', modelo = '${modelo}',
    capacidad = ${capacidad}, ano = ${ano} WHERE patente=${patente}`;

    pool.query(MODFUR_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//REGISTRAR UN USUARIO
app.get('/users/register', (req, res) => {
    const {rut, password, nombre, apellido, telefono, direccion} = req.query;
    const REGUS_QUERY = `INSERT INTO usuarios (rut, password, nombre, apellido, telefono, direccion) VALUES
    (${rut}, '${nombre}', '${apellido}', '${password}', ${telefono}, '${direccion}')`;

    pool.query(REGUS_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//REGISTRAR UN ALUMNO
app.get('/students/register', (req, res) => {
    const {id, nombre, apellido, nivel, patente_furgon, curso} = req.query;
    const REGAL_QUERY = `INSERT INTO alumnos (id, nombre, apellido, nivel, patente_furgon, curso, tipo_viaje, sector) VALUES
    (${id}, '${nombre}', '${apellido}', '${nivel}', '${patente_furgon}', '${curso}', '${tipo_viaje}', ${sector})`;

    pool.query(REGAL_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//REGISTRAR FURGON
app.get('/furgon/register', (req, res) => {
    const {patente, rut_tio, marca, modelo, capacidad, ano} = req.query;
    const REGFUR_QUERY = `INSERT INTO furgones (patente, rut_tio, marca, modelo, capacidad, ano) VALUES
    ('${patente}', ${rut_tio}, '${marca}', '${modelo}', ${capacidad}, ${ano})`;

    pool.query(REGFUR_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR A QUIÉN PUEDE ENVIAR NOTIFICACIÓN

app.get('/notification/search', (req, res) => {
    const {rut} = req.query;
    const NOTSEA_QUERY = `SELECT nombre, apellido FROM usuarios WHERE rut IN (SELECT rut_tio FROM furgones WHERE patente = 
        (SELECT patente_furgon FROM alumnos WHERE id IN (SELECT alumno_id FROM tiene WHERE usuario_rut = ${rut})))
        UNION
        SELECT nombre, apellido FROM usuarios WHERE rut IN (SELECT usuario_rut FROM tiene WHERE alumno_id IN (SELECT id FROM alumnos 
        WHERE patente_furgon IN (SELECT patente FROM furgones WHERE rut_tio=${rut})))`;

    pool.query(NOTSEA_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

// Console stuff
var port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log('Server listening on port ' + port );
});
