import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { GetActionDefinitions } from '../actions.js'

test('VLC commands accept numeric clip options and substitute text variables', async (t) => {
	const requests = []
	const server = createServer((request, response) => {
		requests.push({ url: new URL(request.url, 'http://localhost'), auth: request.headers.authorization })
		response.setHeader('Content-Type', 'application/json')
		response.end('{}')
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	t.after(() => new Promise((resolve) => server.close(resolve)))
	const errors = []
	const self = {
		baseURL: `http://127.0.0.1:${server.address().port}`,
		headers: { Authorization: 'Basic ' + Buffer.from(':secret').toString('base64') },
		PlayIDs: ['42', '73'],
		vlcRate: 1,
		vlcDelay: 0,
		updateStatus() {},
		show_error(error) { errors.push(error) },
	}
	const actions = GetActionDefinitions(self)
	const parsed = []
	const context = {
		async parseVariablesInString(value) {
			// Base 1.15.1 preserves non-string options without parsing them.
			if (typeof value !== 'string') return value
			parsed.push(value)
			return value.replace('$(test:clip)', '2')
		},
	}
	await actions.deleteID.callback({ options: { clip: 1 } }, context)
	assert.equal(requests[0].url.searchParams.get('command'), 'pl_delete')
	assert.equal(requests[0].url.searchParams.get('id'), '42')
	await actions.playID.callback({ options: { clip: '$(test:clip)' } }, context)
	assert.equal(requests[1].url.searchParams.get('command'), 'pl_play')
	assert.equal(requests[1].url.searchParams.get('id'), '73')
	await actions.rate.callback({ options: { rate: '+25' } }, context)
	assert.equal(requests[2].url.searchParams.get('val'), '1.25')
	await actions.adelay.callback({ options: { delay: '500' } }, context)
	assert.equal(requests[3].url.searchParams.get('val'), '0.5')
	await actions.volume.callback({ options: { volume: '128' } }, context)
	assert.equal(requests[4].url.searchParams.get('val'), '128')
	assert.equal(requests.length, 5)
	assert.equal(parsed.length, 4)
	assert.ok(requests.every((request) => request.auth === self.headers.Authorization))
	assert.deepEqual(errors, [])
	assert.equal(self.PollNow, true)
})
