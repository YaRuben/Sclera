'use strict';
const Path = require('path');
const fs = require('fs');
//const cript = require('@hapi/cryptiles');
const util = require('./public/js/utils');
const Jwt = require('@hapi/jwt');
const cfg = require('./config');
const litedb = require('./db/sqlite');
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const withTimeout = require('async-mutex').withTimeout;
const utils = require('./public/js/utils');


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
        path: '/token',
        options: { auth: false },
        handler: async (request, h) => {
            let hdrs = request.raw.req.headers;
            let tkn = hdrs.authorization;
            tkn = tkn.replace('Bearer ', '');
            let decoded = Jwt.token.decode(tkn);
           let vR = await utils.validateToken(decoded,request,h);
          return h.response(vR);
        }
    },
    {
        method: 'GET',
        path: '/refresh',
        options: { auth: false },
        handler: async (request, h) => {
            let res;
            let rsp;
            let hdrs = request.raw.req.headers;
            let tkn = hdrs.authorization.replace('Bearer ', '');;
            res = litedb.get(cfg.dblite.userByToken, [`${tkn}`]);
            if(res){
                let extm = Date.parse(Date())/1000;
                let init = utils.randomStrHex(32);
                const payload = {iss: 'HFR', iat: extm, aud: 'HFR', iss: 'HFRAS',  user: `${res.user_login}`, role: `${res.user_role}`, nonce: `${res.user_init }`};
                tkn = Jwt.token.generate(payload, cfg.jwt.secret);
                rsp = h.response(res);
                let sql = `update users set user_time=${extm}, user_token='${tkn}', user_init='${init}'`;
            litedb.run(sql,[]);
            } else 
            {
                rsp = h.redirect('error.html');
            };   
          return h.response(rsp);
        }
    },
    {
        method: 'POST',
        path: '/login',
        options: { auth: false },
        handler: async (request, h) => {
            let res;
            let tkn;
            let rsp;
            let extm = Date.parse(Date())/1000;
            let init = utils.randomStrHex(32);
            try{
            const pl = request.payload;
            res = litedb.get(cfg.dblite.userlogin, [pl.email,pl.pwd]);
            if(res){
                const payload = {iss: 'HFR', iat: extm, aud: 'HFR', iss: 'HFRAS',  user: `${res.user_login}`, role: `${res.user_role}`, nonce: `${res.user_init }`};
                tkn = Jwt.token.generate(payload, cfg.jwt.secret);
                rsp = h.response(res);
            } else 
            {
                rsp = h.redirect('error.html');
            };   
            console.log(`${tkn}\n ${JSON.stringify(Jwt.token.decode(tkn))}`);
            let sql = `update users set user_time=${extm}, user_token='${tkn}', user_init='${init}'`;
            litedb.run(sql,[]);
            }
            catch(err){console.log(err); rsp = h.response(err);}
            return rsp.header('Authorization',`Bearer ${tkn}`);
            
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
            try{
                //user_status, user_role, user_login, user_pwd, user_time, user_created
            res = litedb.run(cfg.dblite.usrinsert,[pl.role, pl.email,null,ts,ts]);
            let uid = res.lastInsertRowid;
            if (res.changes !== 1) {throw new Error('User insert failed. Rolling back.');}
            let sql = `INSERT INTO profiles values (${uid},0,'${pl.fname}','${pl.lname}', '${pl.suff}', '${pl.company}', '${pl.position}',  '${pl.companyWeb}', '${pl.contactPhone}', '${pl.country}', '${pl.city}', '${pl.state}', '${pl.addr}')`;
            res = litedb.run(sql,[]);
            litedb.commit(); 
            }
            catch(err){
                litedb.rollback();
                return h.response(JSON.stringify(err));
            }
            return h.response(JSON.stringify(res));
        }  
    }
];
exports.routeset;