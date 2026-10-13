import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRunScope, createSessionPublisher } from '../src/utils/runScope.js';

test('a session is released after an active inference settles, including failure', async () => {
	for (const fails of [false, true]) {
		const scope = createRunScope();
		let finish;
		const run = new Promise((resolve, reject) => {
			finish = () => (fails ? reject(new Error('failed')) : resolve());
		});
		scope.track(run);
		let releases = 0;
		const closed = scope.close(() => {
			releases++;
		});
		assert.equal(scope.signal.aborted, true);
		await Promise.resolve();
		assert.equal(releases, 0);
		finish();
		await closed;
		assert.equal(releases, 1);
		await scope.close(() => {
			releases++;
		});
		assert.equal(releases, 1);
	}
});

test('an older page cannot clear a shared session published by a newer page', () => {
	let current;
	const publisher = createSessionPublisher((value) => {
		current = value;
	});
	const older = Symbol('older');
	const newer = Symbol('newer');
	const sharedSession = {};
	publisher.reserve(older);
	publisher.publish(older, sharedSession);
	publisher.reserve(newer);
	publisher.publish(newer, sharedSession);
	assert.equal(publisher.publish(older, {}), false);
	assert.equal(publisher.clear(older), false);
	assert.equal(current, sharedSession);
	publisher.clear(newer);
	assert.equal(current, undefined);
});

test('taking ownership cancels an older deferred run before it can publish', async () => {
	const oldScope = createRunScope();
	const publisher = createSessionPublisher(() => {});
	const oldOwner = Symbol('old');
	const newOwner = Symbol('new');
	let finish;
	let publications = 0;
	let releases = 0;
	const deferred = new Promise((resolve) => {
		finish = resolve;
	});
	const running = oldScope.track(
		deferred.then(() => {
			if (!oldScope.signal.aborted) publications++;
		})
	);
	publisher.reserve(oldOwner, () => {
		void oldScope.close(() => {
			releases++;
		});
	});
	publisher.reserve(newOwner);
	assert.equal(oldScope.signal.aborted, true);
	assert.equal(releases, 0);
	finish();
	await running;
	await oldScope.close(() => {
		releases++;
	});
	assert.equal(publications, 0);
	assert.equal(releases, 1);
});
