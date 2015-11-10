#!/usr/bin/env node


"use strict";


let express = require("express");
let multer = require("multer");
let open = require('open');
var extend = require('util')._extend;

let config = require('./config.json');

let Storage = require('./src/storage');
let Converter = require('./src/converter');
let Resolver = require('./src/resolver');
let Reader = require('./src/reader');

//TODO: validate paths
let options = extend(config, {
	tmp: process.env.UPLOAD_TMP,
	dest: process.env.UPLOAD_TMP
});

let storage = new Storage(options);
let uploader = multer({
	storage: storage,
	limits: {
		fieldSize: options.maxSize,
		files: 1,
		parts: 1
	},
	fileFilter: (req, file, cb) => {
		//TODO: check and remove
		if(file.size > options.maxSize) {
			throw new Error('excceed max file size');
		}
		//TODO: check mime

		cb(null, true);
	}
});

let app = express();

app.use(express.static('./test'));

app.get('/img/*', (req, res, next) => {
	let imgId = req.params['0'];
	let path = (new Resolver).resolve(options.dest, imgId, 'anim_r.gif');

	try {
		let reader = new Reader(path);
		reader.on('ready', () => {
			reader.pipe(res);
		});
	} catch(e) {
		console.error(e);
		res.sendStatus(404).end();
	}
});

app.post('/upload', uploader.single('video'), (req, res, next) => {
	let file = req.file;
	let converter = new Converter(options.convert, file.dir);

	converter
			.process(file.path)
			.then((path) => {
				res.setHeader("Content-Type", "text/html");
				res.end(`<img src="/img/${file.id}"/>`);
			})
			.catch((err) => {
				console.error(err);
				res.sendStatus(500).end();
			})
	;
});

app.listen(8282);
open('http://localhost:8282/');