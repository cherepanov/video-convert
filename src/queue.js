"use strict";

let kue = require('kue');

let queue;

class Queue {
	constructor(options, binPath, tmpPath) {
		queue = queue || kue.createQueue({
			prefix: 'converter',
			redis: {
				port: options.redis.port,
				host: options.redis.host,
				auth: options.redis.auth
			}
		});
	}

	push(ns, payload) {
		return new Promise((resolve, reject) => {
			let job = queue.create(ns, payload);
			job.on('complete', resolve);
			job.on('failed', reject);
			job.save();
		});
	}

	process(ns, processor) {
		queue.process(ns, 1, processor);
	}
}

module.exports = Queue;