/*
 *title: Server library
 *Description: Server related flie
 *Date: 22-03-2023
 *
 */

// dependencies
const http = require('node:http');
const { handleReqRes } = require('../helpers/HandleReqRes');

// Server-object Module saffolding
const server = {};

//configuration
server.config = {
    port: 9000,
}
// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`listening port ${server.config.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = ()=> {
    server.createServer();
};

//export
module.exports = server;

