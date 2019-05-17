const express = require('express');
const mysql = require('mysql');
const cred = require('./credentials');

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

app.get('/', (req, res) => {
    res.send('Hello from server');
});

const SELECT_ALL_QUERY = `SELECT * FROM `;
app.get('/purchases', (req, res) => {
    pool.query(SELECT_ALL_PURCHASES_QUERY, (err, results) => {
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
