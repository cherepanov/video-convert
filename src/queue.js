"use strict";

let EventEmitter = require('events').EventEmitter;
let kue = require('kue');

let queue;

let processors = new Map();

class Queue extends EventEmitter {
	constructor(options, binPath, tmpPath) {
		super();

		this.queue = queue || kue.createQueue({
			prefix: 'converter',
			redis: {
				port: options.redis.port,
				host: options.redis.host,
				auth: options.redis.auth
			}
		});
	}

	push(ns, job, process) {
		return new Promise((resolve, reject) => {
			let job = kue.create(ns, job);

			processors.set(job, process);

			job.on('complete', resolve);
			job.on('failed', reject);
			job.save();
		});
	}

	process(ns) {
		this.queue.process(ns, 1, (job, done) => {
			let process = processors.get(job);
			process(job, (result) => {
				processors.delete(job);
				if(result) {
					done(new Error('job failed'));
				} else {
					done();
				}
			});
		});
	}
}

module.exports = Queue;