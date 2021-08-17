'use strict';

const cfg = require('../../config');
const Jwt = require('@hapi/jwt');
const litedb = require('../../db/sqlite');
const Boom = require('@hapi/boom');

module.exports = {
    inspectObject: (o) => { return Object.entries(o); },
    mapObject: (o) => { return new Map(Object.entries(o)); },
    properyValues: (o) => { return Object.values(o).reduce((acc, v) => { acc += ` '${v}',`; return acc; }, '').slice(0, -1) },
    randomStrHex: (l) => { return require("crypto").randomBytes(l).toString('hex'); },
    newToken: (u) => {
        try {
            let init = module.exports.randomStrHex(32);
            const payload = { iss: 'HFR', iat: Date.parse(Date()) / 1000, aud: 'HFR', iss: 'HFRAS', user: `${u.user_login}`, nonce: `${u.user_init}`, role: `${u.user_role}`, userfirst: `${u.userFirst}`,userlast: `${u.userLast}`,usersuffix: `${u.userSuffix}`, position: `${u.position}`  };
            let tkn = Jwt.token.generate(payload, cfg.jwt.secret);
            let sql = `update users set user_time=${Date.parse(Date()) / 1000}, user_token='${tkn}', user_init='${init}'  where user_id = ${u.user_id}`;
            litedb.run(sql, []);
            return tkn;
        }
        catch (err) {
            throw Boom.notFound(err);
        }

    },
    DecodeJWT: (token) => {
        try {
            let hdr = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
            let pld = Buffer.from(token.split('.')[1], 'base64').toString('ascii');
            let tkn = `{"Header": ${hdr}, "Payload": ${pld}}`;
            return JSON.parse(tkn);
        } catch (e) {
            return null;
        }
    }

}
