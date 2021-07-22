'use strict';

const cfg = require('../config');
const Path = require('path');
const sqlite3 = require('better-sqlite3');
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const withTimeout = require('async-mutex').withTimeout;
const { error } = require('console');

module.exports = {
    connect: () => {
        const name = (cfg.dblite.name) ? Path.join(__dirname, cfg.dblite.location, cfg.dblite.name) : ':memory:';
        process.litedb = new sqlite3(name, { verbose: console.log });
    },
    version: () => { this.get('SELECT sqlite_version()',[]);},
    exec: (sqlstr) => { // execute sqlstr that contain multiple SQL statements
        return process.litedb.exec(sqlstr);
    },
    run: (sql, params) => {
        let stmt = process.litedb.prepare(sql);
        let info = stmt.run(params);
        return info;
    },
    get: (sql, params) => { //only on statements that return data
        return process.litedb.prepare(sql).get(params);
    },
    all: (sql, params) => { //only on statements that return data
        return process.litedb.prepare(sql).all(params);
    },
    close: () => {process.litedb.close();}

}