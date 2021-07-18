'use strict';
const Path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
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
        method: 'GET',
        path: '/sqlite',
        handler: async (request, h) => {
            let rt;
            let rs;
            let lock = new Mutex();
            let release = await lock.acquire();
            var db = new sqlite3.Database(':memory:');
           db.serialize(function () {
                db.run("CREATE TABLE lorem (info TEXT)");
                var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
                for (var i = 0; i < 10; i++) {
                    stmt.run("Ipsum " + i);
                }
            stmt.finalize();
            db.all("SELECT rowid AS id, info FROM lorem", 
            //async (err, rows) => { rt = JSON.stringify(rows);release();});
            async (err, rows) => { rt = rows;release();});                
            });
            db.close();
            await lock.runExclusive(async () => {
               rs =  h.response(rt).state(200);
            });
            return rs.type('application/json');
        }
        
    }
];
exports.routeset;