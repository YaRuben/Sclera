'use strict';

const Path = require('path');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const cfg = require('./config');
const routset = require('./routset');
const litedb = require('./db/sqlite');


const init = async () => {

    const server = new Hapi.Server({
        port: cfg.server.port,
        host: cfg.server.host,
        routes: {
            files: {
                relativeTo: Path.join(__dirname, cfg.server.fileRoot)
            }
        }
    });
    
    litedb.connect();
    await server.register(Inert);

    server.route(routset);

    await server.start();

    console.log('Server running at:', server.info.uri);
};
init();
