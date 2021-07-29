'use strict';
const Path = require('path');
const fs = require('fs');
const utils = require('./public/js/utils');
const Jwt = require('@hapi/jwt');
const cfg = require('./config');
const litedb = require('./db/sqlite');
const Boom = require('@hapi/boom');



module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello world';
        }
    },
    {
        method: 'GET',
        path: '/{param*}',
        options: { auth: false },
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    },
    {
        method: 'GET',
        path: '/login/{usr}/{pwd}',
        options: { auth: false },
        handler: async (request, h) => {
            try {
                let usr = request.params.usr;
                let pwd = request.params.pwd;
                let res = litedb.get(cfg.dblite.userlogin, [usr, pwd]);
                return h.response(utils.newToken(res));
            } catch (err) {
                throw Boom.unauthorized(`invalid credentials`);
            }
        }
    },
    {
        method: 'GET',
        path: '/refresh',
        options: { auth: false },
        handler: async (request, h) => {
            try {
                let hdrs = request.raw.req.headers;
                let tkn = hdrs.authorization.replace('Bearer ', '');;
                let res = litedb.get(cfg.dblite.userByToken, [`${tkn}`]);
                return h.response(utils.newToken(res));
            } catch (err) {
                throw Boom.notFound(err);
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        options: { auth: false },
        handler: async (request, h) => {
            let res;
            try{
                const pl = request.payload;
                res = litedb.get(cfg.dblite.userlogin, [pl.email, pl.pwd]);
                return h.response(utils.newToken(res));
            }catch(err){
                throw Boom.unauthorized(`invalid credentials`);
            }
        }
    },
    {
        method: 'POST',
        path: '/signin',
        options: { auth: false },
        handler: async (request, h) => {
            let res;
            const ts = Date.now();
            const pl = request.payload;
            litedb.begin();
            try {
                //user_status, user_role, user_login, user_pwd, user_time, user_created
                res = litedb.run(cfg.dblite.usrinsert, [pl.role, pl.email, null, ts, ts]);
                let uid = res.lastInsertRowid;
                if (res.changes !== 1) { throw new Error('User insert failed. Rolling back.'); }
                let sql = `INSERT INTO profiles values (${uid},0,'${pl.fname}','${pl.lname}', '${pl.suff}', '${pl.company}', '${pl.position}',  '${pl.companyWeb}', '${pl.contactPhone}', '${pl.country}', '${pl.city}', '${pl.state}', '${pl.addr}')`;
                res = litedb.run(sql, []);
                litedb.commit();
            }
            catch (err) {
                litedb.rollback();
                return h.response(JSON.stringify(err));
            }
            return h.response(JSON.stringify(res));
        }
    }
];
exports.routeset;