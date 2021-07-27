'use strict';

const cfg = require('../../config');
const Jwt = require('@hapi/jwt');

module.exports = { 
    inspectObject: (o) => {return Object.entries(o);},
    mapObject: (o) => {return new Map(Object.entries(o));},
    properyValues: (o) => {return Object.values(o).reduce( (acc,v) => {acc += ` '${v}',`; return acc;},'').slice(0,-1)},
    randomStrHex: (l) => {return require("crypto").randomBytes(l).toString('hex');},

    validateToken: async (artifacts, request, h) => {
        let raw = artifacts.raw;
        let decoded = artifacts.decoded;
        let valid;
        try{
        await Jwt.token.verifySignature(artifacts, cfg.jwt.secret);
        await Jwt.token.verifyTime(artifacts);
        valid = true;    
    }
    catch(err){valid =false;} 
        return {
            isValid: valid,
            credentials: { user: decoded.payload.user, role: decoded.payload.role }
        };
    }
}
