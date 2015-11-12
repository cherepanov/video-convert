"use strict";

let EventEmitter = require('events').EventEmitter;
let exec = require('child_process').exec;
let kue = require('kue');
let path = require('path');

const PATH_SEP = path.sep;
const RESULT_BASE_NAME = 'anim';

class Converter extends EventEmitter {
    constructor(options) {
        super();

        this.options = options;
        this.bin = options.converter.path;
        this.tmp = options.tmp;
        this.dest = options.dest;

        this.queue = kue.createQueue({
            prefix: 'converter',
            redis: {
                port: options.redis.port,
                host: options.redis.host,
                auth: options.redis.auth
            }
        });
    }

    process(file) {
        let bin = this.bin,
            tmp = [this.tmp, file.id].join(PATH_SEP),
            dest = [this.dest, file.id].join(PATH_SEP),
            cmd = `${bin} -i ${file.path} -o ${RESULT_BASE_NAME} -t ${tmp} -d ${dest}`;

        return new Promise((res, rej) => {
            exec(cmd, (err, stdout, stderr) => {
                if(err) {
                    rej(err);
                    return;
                }

                res(dest + `/${RESULT_BASE_NAME}.gif`);
            });
        });
    }
}

module.exports = Converter;