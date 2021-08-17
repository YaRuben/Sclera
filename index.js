'use strict';

const Path = require('path');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const cfg = require('./config');
const routset = require('./routset');
const litedb = require('./db/sqlite');
const utils = require('./public/js/utils');


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
    let version = litedb.version();
    console.log(`Database connected to ${cfg.dblite.name}. ${version}`);
    server.state('fwt-token', {
        ttl: null,
        isSecure:  false,
        isHttpOnly: true,
        clearInvalid: false,
        strictHeader: true
  });

    await server.register(Inert);
    await server.register(Jwt);

    // Declare an authentication strategy using the jwt scheme.
    // Use keys: with a shared secret key OR json web key set uri.
    // Use verify: To determine how key contents are verified beyond signature.
    // If verify is set to false, the keys option is not required and ignored.
    // The verify: { aud, iss, sub } options are required if verify is not set to false.
    // The verify: { exp, nbf, timeSkewSec, maxAgeSec } parameters have defaults.
    // Use validate: To create a function called after token validation.

    server.auth.strategy('jwt', 'jwt', {
        keys: () => { return cfg.jwt.secret }, //shared secret
        verify: {
            aud: 'HFR',
            iss: 'HFRAS',
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 14400, // 4 hours
            timeSkewSec: 15
        },
        validate: async (artifacts, request, h) => {
            let usr = artifacts.decoded.payload.user;
            let role = artifacts.decoded.payload.role;
            return {
                isValid: true,
                credentials: { user: artifacts.decoded.payload.user, role: artifacts.decoded.payload.role }
            };
        }
    });
    // Set the strategy
    server.auth.default('jwt');

    server.route(routset);
    await server.start();
    console.log('Server running at:', server.info.uri);
    //console.log(utils.randomStrHex(16));

};
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
init();
