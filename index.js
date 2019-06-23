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
    const STUDENTS_QUERY = `SELECT * FROM alumnos ORDER BY id`;

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
    const USERS_SEARCH_QUERY = `SELECT * FROM usuarios WHERE rut=${rut}`;

    pool.query(USERS_SEARCH_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR ESTUDIANTES TRANSPORTADOS POR UN TÍO
app.get('/students/tio', (req, res) => {
    const { rut } = req.query;
    const STUDENTS_BY_TIO_QUERY = `SELECT * FROM alumnos WHERE patente_furgon = (SELECT patente FROM furgones WHERE rut_tio=${rut}) ORDER BY id`;

    pool.query(STUDENTS_BY_TIO_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR ESTUDIANTES DE UN APODERADO
app.get('/students/apoderado', (req, res) => {
    const {rut} = req.query;
    const STUDENTS_BY_APODERADO_QUERY = `SELECT * FROM alumnos WHERE id = (SELECT alumno_id FROM tiene WHERE usuario_rut=${rut}) ORDER BY id`;

    pool.query(STUDENTS_BY_APODERADO_QUERY, (err, results) => {
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
    const TIO_BY_NAME_QUERY = `SELECT * FROM usuarios WHERE nombre='${nombre}' AND apellido='${apellido}' AND rol=${2}`;

    pool.query(TIO_BY_NAME_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//BUSCAR A UN TÍO POR ALGUNO DE SUS ESTUDIANTES TRANSPORTADOS
app.get('/tio/search', (req, res) => {
    const {id} = req.query;
    const TIO_BY_STUDENT_QUERY = `SELECT * FROM usuarios WHERE rut=(SELECT rut_tio FROM furgones WHERE patente = (SELECT patente_furgon FROM alumnos WHERE id=${id}))`;

    pool.query(TIO_BY_STUDENT_QUERY, (err, results) => {
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
    const MOD_USER_QUERY = `UPDATE usuarios SET password='${password}', nombre='${nombre}', apellido='${apellido}',
    telefono=${telefono}, direccion='${direccion}' WHERE rut=${rut}`;

    pool.query(MOD_USER_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR DATOS DE UN ESTUDIANTE
app.get('/students/modify', (req, res) => {
    const {rut, nombre, apellido, nivel, patente_furgon, curso} = req.query;
    const MOD_STUDENT_QUERY = `UPDATE alumnos SET nombre='${nombre}', apellido='${apellido}', nivel='${nivel}',
    patente_furgon='${patente_furgon}', curso='${curso}' WHERE id=${id}`;

    pool.query(MOD_STUDENT_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//MODIFICAR UN FURGÓN
app.get('/furgon/modify', (req, res) => {
    const {patente, rut_tio, marca, modelo, capacidad, ano} = req.query;
    const MOD_FURGON_QUERY = `UPDATE furgones SET rut_tio=${rut_tio}, marca='${marca}', modelo='${modelo}',
    capacidad=${capacidad}, ano=${ano} WHERE patente=${patente}`;

    pool.query(MOD_FURGON_QUERY, (err, results) => {
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
    const REGISTER_USER_QUERY = `INSERT INTO usuarios (rut, password, nombre, apellido, telefono, direccion) VALUES
    (${rut}, '${nombre}', '${apellido}', '${password}', ${telefono}, '${direccion}')`;

    pool.query(REGISTER_USER_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//REGISTRAR UN ESTUDIANTE
app.get('/students/register', (req, res) => {
    const {id, nombre, apellido, nivel, patente_furgon, curso, tipo_viaje, sector} = req.query;
    const REGISTER_STUDENT_QUERY = `INSERT INTO alumnos (id, nombre, apellido, nivel, patente_furgon, curso, tipo_viaje, sector) VALUES
    (${id}, '${nombre}', '${apellido}', '${nivel}', '${patente_furgon}', '${curso}', '${tipo_viaje}', ${sector})`;

    pool.query(REGISTER_STUDENT_QUERY, (err, results) => {
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
    const REGISTER_FURGON_QUERY = `INSERT INTO furgones (patente, rut_tio, marca, modelo, capacidad, ano) VALUES
    ('${patente}', ${rut_tio}, '${marca}', '${modelo}', ${capacidad}, ${ano})`;

    pool.query(REGISTER_FURGON_QUERY, (err, results) => {
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
    const NOTIFICATIONS_TARGETS_QUERY = `SELECT rut, nombre, apellido FROM usuarios WHERE rut IN (SELECT rut_tio FROM furgones WHERE patente =
        (SELECT patente_furgon FROM alumnos WHERE id IN (SELECT alumno_id FROM tiene WHERE usuario_rut = ${rut})))
        UNION
        SELECT rut, nombre, apellido FROM usuarios WHERE rut IN (SELECT usuario_rut FROM tiene WHERE alumno_id IN (SELECT id FROM alumnos
        WHERE patente_furgon IN (SELECT patente FROM furgones WHERE rut_tio=${rut})))`;

    pool.query(NOTIFICATIONS_TARGETS_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//OBTENER NOTIFICACIONES
app.get('/message/search', (req, res) => {
    const {rut} = req.query;
    const MESSAGES_SEARCH_QUERY = `SELECT mensajes.id, usuarios.nombre, usuarios.apellido, rut_emisor, mensaje, DATE_FORMAT(fecha, '%d/%m/%Y') as fecha FROM mensajes,
    usuarios WHERE rut_receptor=${rut} AND usuarios.rut=mensajes.rut_emisor ORDER BY id DESC`;

    pool.query(MESSAGES_SEARCH_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//NUEVA NOTIFICACION
app.get('/message/new', (req, res) => {
    const { rut_emisor, rut_receptor, mensaje, fecha } = req.query;
    const INSERT_MESSAGE_QUERY = `INSERT INTO mensajes (rut_emisor, rut_receptor, mensaje, fecha) VALUES
    (${rut_emisor}, ${rut_receptor}, '${mensaje}', '${fecha}')`;

    pool.query(INSERT_MESSAGE_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//ELIMINAR FURGON
app.get('/furgon/delete', (req, res) => {
    const { patente } = req.query;
    const DELETE_FURGON_QUERY = `DELETE FROM furgones WHERE patente=${patente})`;

    pool.query(DELETE_FURGON_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//ELIMINAR USUARIO
app.get('/user/delete', (req, res) => {
    const { rut } = req.query;
    const DELETE_USER_QUERY = `DELETE FROM usuarios WHERE rut=${rut})`;

    pool.query(DELETE_USER_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//ELIMINAR ALUMNO
app.get('/students/delete', (req, res) => {
    const { id } = req.query;
    const DELETE_STUDENT_QUERY = `DELETE FROM alumnos WHERE id=${id})`;

    pool.query(DELETE_STUDENT_QUERY, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});










// SUBIR LOCALIZACION TIO
app.get('/subirlltio', (req, res) => {
    const { rut_tio, fecha, hora, latitud, longitud } = req.query;
    const INSERT = `INSERT INTO posiciones(rut_tio, fecha, hora, latitud, longitud) VALUES(${rut_tio}, '${fecha}', '${hora}', ${latitud}, ${longitud})`;

    pool.query(INSERT, (err, results) => {
        if (err) {
            return res.send(err);
        }else{
            return res.json(({
                data: results
            }))
        }
    });
});

//OBTENER LOCALIZACION TIO
app.get('/obtenerlltio', (req, res) => {
    const { rut_tio } = req.query;
    const GET = `SELECT id, latitud as lat, longitud as lng, fecha, hora FROM posiciones WHERE rut_tio=${rut_tio} ORDER BY id DESC`;

    pool.query(GET, (err, results) => {
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
