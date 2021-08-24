'use strict';
const Path = require('path');
const fs = require('fs');
const utils = require('./public/js/utils');
const Jwt = require('@hapi/jwt');
const cfg = require('./config');
const litedb = require('./db/sqlite');
const Boom = require('@hapi/boom');
const { request } = require('http');





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
                let tkn = hdrs.authorization ? hdrs.authorization.replace('Bearer ', '') : request.state.jwt - token;
                if (tkn) {
                    let res = litedb.get(cfg.dblite.userByToken, [`${tkn}`]);
                    return h.response(utils.newToken(res));
                }
            } catch (err) {
                throw Boom.notFound('No Bearer token found');
            }
        }
    },

    {
        method: 'GET',
        path: '/users/{status?}',
        options: { auth: false },
        handler: async (request, h) => {
            try {
                let stat = request.params.status;
                let sp = (stat==='new')?1:0;
                let res = litedb.all(cfg.dblite.userSelect, [sp]);
                res = res.map((x,i) => {let R = {}; R[`section`]=x; return R;});
                let Ro = {'users': res};
                return h.response(Ro);
            } catch (err) {
                throw Boom.notFound('Failed to get users');
            }
        },

    },
    {
        method: 'GET',
        path: '/uflip/{id}',
        options: {auth: false},
        handler: async (request, h) =>{
            try{
            let id = request.params.id;
            let res = litedb.run(cfg.dblite.userFlipStatus, [id]);
            console.log(res);
            if(res.changes == 1){
            return h.redirect('/users.html');
            }else{throw Boom.Boom.badrequest('The user status can not be changed',`User Id: ${id}`);}
            }catch(err){
                throw Boom.notFound('Failed to flip Status');
            }


        }
    },
    {
        method: 'GET',
        path: '/exsql/{qry}',
        options: {auth: false},
        handler: async (request, h) =>{
            try{
            let qry = request.params.qry;
            let res = Array.from(litedb.all(qry,[]));
            return h.response(res);
            }catch(err){
                throw Boom.notFound('Failed to get data');
            }


        }
    },

    // POST requests [START]   
    {
        method: 'POST',
        path: '/login',
        options: { auth: false },
        handler: async (request, h) => {
            let res;
            try {
                const pl = request.payload;
                res = litedb.get(cfg.dblite.userlogin, [pl.email, pl.pwd]);
                let tkn = utils.newToken(res);
                let decoded = utils.DecodeJWT(tkn);
                let rsp = h.response(decoded).state('jwt-token', tkn);
                rsp.header('jwt-token', tkn);
                return rsp;
                //return h.response(decoded).state('jwt-token',tkn);
            } catch (err) {
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