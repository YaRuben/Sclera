'use strict';
const Path = require('path');
const fs = require('fs');
const util = require('./public/js/utils');
const cfg = require('./config').dblite;
const litedb = require('./db/sqlite');
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const withTimeout = require('async-mutex').withTimeout;


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
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    },
    {
        method: 'POST',
        path: '/signin',
        handler: async (request, h) => {
            let res;
            const ts = Date.now();
            const pl = request.payload;
            litedb.begin();
            try{
            res = litedb.run(cfg.usrinsert,[pl.email,null,ts,ts]);
            let uid = res.lastInsertRowid;
            if (res.changes !== 1) {throw new Error('User insert failed. Rolling back.');}
            let sql = `INSERT INTO profiles values (${uid},0,'${pl.fname}','${pl.lname}', '${pl.suff}', '${pl.company}', '${pl.position}',  '${pl.companyWeb}', '${pl.contactPhone}', '${pl.country}', '${pl.city}', '${pl.state}', '${pl.addr}')`;
            res = litedb.run(sql,[]);
            litedb.commit(); 
            }
            catch(err){
                return h.response(JSON.stringify(err));
                litedb.rollback();
            }
            return h.response(JSON.stringify(res));
        }  
    }
];
exports.routeset;