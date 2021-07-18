'use strict';

const cfg = require('../config');
const Path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const withTimeout = require('async-mutex').withTimeout;

module.exports = {
    connect: () => {
        const name = (cfg.dblite.name)?Path.join(__dirname, cfg.dblite.location, cfg.dblite.name):':memory:';
        process.litedb = new sqlite3.Database(name);
    }
}