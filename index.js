/*
 *title: Uptime Monitoring Application
 *Description: A RESTFul API to monitor up or down time of user defined links
 *Date: 24-02-2023
 *
 */

// dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// app-object Module saffolding
const app = {};

// create server
app.init = () => {
    //start the server
    server.init();
    //start the worker
    workers.init();
};

app.init();

//export the app
module.exports = app;
