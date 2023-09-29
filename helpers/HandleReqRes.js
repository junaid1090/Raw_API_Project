/*
 *title: HANDLE REQUEST RESPONSE
 *Description: Handle Request and Response
 *Date: 26-02-2023
 *
 */

// dependencies
const url = require('node:url');
const { StringDecoder } = require('node:string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandlers');
const { parseJson } = require('./Utilities');

// Module saffolding
const handler = {};

// handle Request Response
handler.handleRequest = (req, res) => {
   // console.log(req.body);
    //console.log(req);
    // request handling
    // get the url and parse it
    const parseUrl = url.parse(req.url, true);
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parseUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };
    
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    
    const chooseHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();

        requestProperties.body = parseJson(realData);

        chooseHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            // return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });

    });
};

module.exports = handler;
