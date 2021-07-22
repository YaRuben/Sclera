'use strict';
const Path = require('path');
const fs = require('fs');
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
            const ts = Date.now();
            const pl = request.payload;
            let res = litedb.run(cfg.usrinsert,[pl.email,null,ts,ts]);
            let uid = res.lastInsertRowid;
            //(user_id, profile_status, userFirst, userLast, userSuffix, company, position, companyWeb, contactPhone, country, city, state, mailingAddr)
            // let prs = Object.values(pl).splice(0,0,uid);
            //let prs =`'`+ [uid,0,pl.fname,pl.lname, pl.suff, pl.company, pl.position,  pl.companyWeb, pl.contactPhone, pl.country, pl.city, pl.state, pl.addr].join(`','`)+`'`;
            //res = litedb.run(cfg.profileinsert,prs); 
            let sql = `INSERT INTO profiles values (${uid},0,'${pl.fname}','${pl.lname}', '${pl.suff}', '${pl.company}', '${pl.position}',  '${pl.companyWeb}', '${pl.contactPhone}', '${pl.country}', '${pl.city}', '${pl.state}', '${pl.addr}')`;
            res = litedb.run(sql,[]); 
            return h.response(JSON.stringify(res));
        }  
    }
];
exports.routeset;