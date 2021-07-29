'use strict';
const Path = require('path');
const fs = require('fs');
//const cript = require('@hapi/cryptiles');
const utils = require('./public/js/utils');
const Jwt = require('@hapi/jwt');
const cfg = require('./config');
const litedb = require('./db/sqlite');
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const withTimeout = require('async-mutex').withTimeout;
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

            //     if(res){
            //         let init = utils.randomStrHex(32);
            //         const payload = {iss: 'HFR', iat: Date.parse(Date())/1000, aud: 'HFR', iss: 'HFRAS',  user: `${res.user_login}`, role: `${res.user_role}`, nonce: `${res.user_init }`};
            //         let tkn = Jwt.token.generate(payload, cfg.jwt.secret);
            //         let sql = `update users set user_time=${Date.parse(Date())/1000}, user_token='${tkn}', user_init='${init}'  where user_id = ${res.user_id}`;
            //         litedb.run(sql,[]);
            //         return h.response(tkn);
            //     }else{throw 'No such user.';}                
            // }catch(err){
            //    console.log(err); 
            //    return h.response(err)
            // }
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
            // let init = utils.randomStrHex(32);
            // if(res){
            //     const payload = {iss: 'HFR', iat: Date.parse(Date())/1000, aud: 'HFR', iss: 'HFRAS',  user: `${res.user_login}`, role: `${res.user_role}`, nonce: `${init}`};
            //     tkn = Jwt.token.generate(payload, cfg.jwt.secret);
            //     let sql = `update users set user_time=${Date.parse(Date())/1000}, user_token='${tkn}', user_init='${init}'  where user_id = ${res.user_id}`;
            //     litedb.run(sql,[]);
            //     return h.response(tkn);
            // } else{throw 'No such session.';} 
            // }catch(err)
            //     {
            //         console.log(err); 
            //         // return h.response(err).status(400);
            //         throw Boom.notFound(err);
            //     };   
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
               // res = litedb.get(cfg.dblite.userlogin, [pl.email, pl.pwd]);  
            }
            //let extm = Date.parse(Date()) / 1000;
            //let init = utils.randomStrHex(32);
            // try {
            //     const pl = request.payload;
            //     res = litedb.get(cfg.dblite.userlogin, [pl.email, pl.pwd]);
            //     if (res) {
            //         const payload = { iss: 'HFR', iat: extm, aud: 'HFR', iss: 'HFRAS', user: `${res.user_login}`, role: `${res.user_role}`, nonce: `${res.user_init}` };
            //         tkn = Jwt.token.generate(payload, cfg.jwt.secret);
            //         rsp = h.response(tkn);
            //     } else {
            //         rsp = h.redirect('error.html');
            //     };
            //     console.log(`${tkn}\n ${JSON.stringify(Jwt.token.decode(tkn))}`);
            //     let sql = `update users set user_time=${extm}, user_token='${tkn}', user_init='${init}'  where user_id = ${res.user_id}`;
            //     litedb.run(sql, []);
            // }
            // catch (err) { console.log(err); rsp = h.response(err); }
            // return rsp.header('Authorization', `Bearer ${tkn}`);

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