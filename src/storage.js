"use strict";


var fs = require('fs');
var path = require("path");
var util = require("util");
var mkdirp = require('mkdirp');

const PATH_SEP = path.sep;

class Storage {
    constructor(options) {
        this.options = Object.create(options, {});
        this.tmp = path.resolve(this.options.tmp);
    }

    _hash(str) {
        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            hash = (((hash << 5) - hash) + str.charCodeAt(i)) & 0xFFFFFFFF;
        }

        return hash;
    }

    _buildUploadPath(fileName) {
        let hashcode = this._hash(fileName + +new Date),
            mask = 255,
            firstDir = hashcode & mask,
            secondDir = (hashcode >> 8) & mask;

        return ['', util.format("%d", firstDir), util.format("%d", secondDir), hashcode].join(PATH_SEP);
    }

    _handleFile(req, file, cb) {
        let fileName = file.originalname;
        let id = this._buildUploadPath(fileName);
        let uploadPath = this.tmp + id;
        let fullName = [uploadPath, fileName].join(PATH_SEP);

        //TODO: permissions
        mkdirp(uploadPath, (err) => {
            if(err) {
                cb(err);
                return;
            }

            let writeStream = fs.createWriteStream(fullName);

            file.stream.pipe(writeStream);

            writeStream.on('error', cb);

            writeStream.on('finish', () => {
                cb(null, {
                    path: fullName,
                    size: writeStream.bytesWritten,
                    dir: uploadPath,
                    id: id
                })
            });
        });
    }

    _removeFile(req, file, cb) {
        fs.unlink(file.path, cb)
    }
};

module.exports = Storage;
