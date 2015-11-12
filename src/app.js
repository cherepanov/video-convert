"use strict";

let multer = require("multer");

let Storage = require('./storage');
let Converter = require('./converter');
let Resolver = require('./resolver');
let Reader = require('./reader');
let Queue = require('./queue');
let mkdirp = require('mkdirp');

const PATH_SEP = require('mkdirp').sep;

class App {
	constructor(options) {
		this.options = options;
		this.queue = new Queue(this.options);
		this.converter = new Converter(this.options);
		this.uploader = this._createUploader();

		this.queue.process('video', this._processVideo.bind(this));
	}

	_processVideo(job, done) {
		let file = job.data.file;

		this.converter
				.process(file)
				.then(() => {
					done();
				})
				.catch((err) => {
					done(err);
				})
		;
	}

	_createUploader() {
		let options = this.options,
			maxSize = options.uploader.maxSize;

		let uploader = multer({
			storage: new Storage(options),
			limits: {
				fieldSize: maxSize,
				files: 1,
				parts: 1
			},
			fileFilter: (req, file, cb) => {
				//TODO: check and remove
				if(file.size > maxSize) {
					throw new Error('excceed max file size');
				}
				//TODO: check mime

				cb(null, true);
			}
		});

		return uploader.single('video');
	}

	exGetImage(req, res, next) {
		let options = this.options;
		let imgId = req.params['0'];
		let path = Resolver.resolve(options.dest, imgId, 'anim.gif');

		try {
			var reader = new Reader(path);

			reader
				.open()
				.then(() => {
					reader.pipe(res);
				})
				.catch((err) => {
					res.sendStatus(404).end();
				})
			;
		} catch(e) {
			console.error(e);
			res.sendStatus(404).end();
		}
	}

	exUpload(req, res, next) {
		this.uploader(req, res, (err) => {
			if(err) {
				next(err);
				return;
			}

			let file = req.file;

			this.queue
				.push('video', { file: file })
				.then(() => {
					res.setHeader("Content-Type", "text/html");
					res.end(`<img src="/img/${file.id}"/>`);
				})
				.catch((e) => {
					console.error(err);
					res.sendStatus(500).end();
				})
			;
		});
	}
}

module.exports = App;