#!/usr/bin/env node


"use strict";

const DEBUG = (process.env.NODE_ENV === 'development');

console.log(process.env.NODE_ENV);

let express = require("express");
let open = require('open');
let extend = require('util')._extend;

let App = require('./src/app');

let options = extend(require('./config.json'), {
	tmp: process.env.DIR_UPLOAD_TMP,
	dest: process.env.DIR_STORAGE
});

console.log(options);

let srv = express();
let app = new App(options);

//TODO: better method delegate
srv.get('/img/*', app.exGetImage.bind(app));
srv.get('/preview/*', app.exPreview.bind(app));
srv.post('/upload', app.exUpload.bind(app));

DEBUG && srv.use(express.static('./test'));

srv.listen(8282);

DEBUG && open('http://localhost:8282/');

