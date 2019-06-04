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

app.get('/login', (req, res) => {
    const { rut, password } = req.query;
    const LOGIN_QUERY = `SELECT * FROM usuarios WHERE rut=${rut} AND word='${password}'`;

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

// Console stuff
var port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log('Server listening on port ' + port );
});
