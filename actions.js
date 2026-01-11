import { InstanceStatus } from '@companion-module/base'
import * as CHOICES from './choices.js'

import got from 'got'

export function GetActionDefinitions(self) {
	const sendCommand = async (command, args) => {
		const query = Object.entries(args || {}).map(([k, v]) => `${k}=${v}`)
		const url = `${self.baseURL}/requests/status.json?command=${command}&${query}`

		console.log('exec', url)

		try {
			await got.get(url, {
				headers: self.headers,
			})
			self.updateStatus(InstanceStatus.Ok)
			self.lastStatus = InstanceStatus.Ok
		} catch (e) {
			self.show_error(e)
		}
		// force an update if command sent while VLC stopped
		self.PollNow = true
	}

	const getTheClip = async (action, context) => {
		const theClip = await context.parseVariablesInString(action.options.clip)
		if (isNaN(theClip)) {
			throw new Error('ClipId is not a number')
		}

		return self.PlayIDs[theClip - 1]
	}

	return {
		play: {
			name: 'Play',
			options: [],
			callback: async () => {
				await sendCommand('pl_play')
			},
		},
		playID: {
			name: 'Play ID',
			options: [
				{
					type: 'textinput',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				try {
					const theClip = await getTheClip(action, context)

					await sendCommand('pl_play', {
						id: theClip,
					})
				} catch {}
			},
		},
		stop: {
			name: 'Stop',
			options: [],
			callback: async () => {
				await sendCommand('pl_stop')
			},
		},
		pause: {
			name: 'Pause / Resume',
			options: [
				{
					type: 'dropdown',
					label: 'Which action?',
					id: 'opt',
					default: '2',
					choices: [
						{ id: '0', label: 'Pause' },
						{ id: '1', label: 'Resume' },
						{ id: '2', label: 'Toggle' },
					],
				},
			],
			callback: async (action, context) => {
				const ao = parseInt(action.options.opt)
				if (ao == 2 || ao != self.PlayState - 1) {
					await sendCommand('pl_pause')
				}
			},
		},
		seek: {
			name: 'Seek To',
			options: [
				{
					type: 'textinput',
					label: 'Where',
					id: 'where',
					default: '1',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const toWhere = await context.parseVariablesInString(action.options.where)

				await sendCommand('seek', {
					val: encodeURI(toWhere),
				})
			},
		},
		next: {
			name: 'Next',
			options: [],
			callback: async () => {
				await sendCommand('pl_next')
			},
		},
		prev: {
			name: 'Previous',
			options: [],
			callback: async () => {
				await sendCommand('pl_previous')
			},
		},
		clear: {
			name: 'Clear Playlist',
			options: [],
			callback: async () => {
				await sendCommand('pl_empty')
			},
		},
		add: {
			name: 'Add Item',
			options: [
				{
					type: 'textinput',
					label: 'Clip path/MRL',
					id: 'mrl',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const theMrl = await context.parseVariablesInString(action.options.mrl)

				await sendCommand('in_enqueue', {
					input: theMrl,
				})
			},
		},
		add_go: {
			name: 'Add and Play',
			options: [
				{
					type: 'textinput',
					label: 'Clip path/MRL',
					id: 'mrl',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const theMrl = await context.parseVariablesInString(action.options.mrl)

				await sendCommand('in_play', {
					input: theMrl,
				})
			},
		},
		deleteID: {
			name: 'Delete ID',
			options: [
				{
					type: 'number',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					min: 0,
				},
			],
			callback: async (action, context) => {
				const theClip = await getTheClip(action, context)

				await sendCommand('pl_delete', {
					id: theClip,
				})
			},
		},
		volume: {
			name: 'Set Volume',
			options: [
				{
					type: 'textinput',
					label: 'Value',
					id: 'volume',
					useVariables: true,
					default: 0,
				},
			],
			callback: async (action, context) => {
				const vol = await context.parseVariablesInString(action.options.volume)

				await sendCommand('volume', {
					val: vol,
				})
			},
		},
		rate: {
			name: 'Set Playback Rate',
			options: [
				{
					type: 'textinput',
					label: 'Value',
					id: 'rate',
					useVariables: true,
					default: 100,
				},
			],
			callback: async (action, context) => {
				let rate = await context.parseVariablesInString(action.options.rate)
				const adj = ['+', '-'].includes(rate.slice(0, 1)) ? rate.slice(0, 1) : ''

				if (adj == '') {
					rate = rate / 100
				} else {
					rate = self.vlcRate + parseInt(rate) / 100
					if (Math.abs(rate - 1) < 0.001) {
						rate = 1
					}
				}

				await sendCommand('rate', {
					val: rate,
				})
			},
		},
		adelay: {
			name: 'Set Audio Delay',
			options: [
				{
					type: 'textinput',
					label: 'Value',
					id: 'delay',
					useVariables: true,
					default: 0,
				},
			],
			callback: async (action, context) => {
				let delay = await context.parseVariablesInString(action.options.delay)
				const adj = ['+', '-'].includes(delay.slice(0, 1)) ? delay.slice(0, 1) : ''

				if (adj == '') {
					delay = delay / 1000
				} else {
					delay = self.vlcDelay + parseInt(delay) / 1000
					if (Math.abs(delay - 1) < 0.001) {
						delay = 0
					}
				}

				await sendCommand('audiodelay', {
					val: delay,
				})
			},
		},
		full: {
			name: 'Full Screen',
			options: [
				{
					type: 'dropdown',
					label: 'Set',
					id: 'opt',
					default: '1',
					choices: CHOICES.ON_OFF_TOGGLE,
				},
			],
			callback: async (action) => {
				let opt = parseInt(action.options.opt)
				if (2 === opt || self.PlayFull != !!opt) {
					await sendCommand('fullscreen')
				}
			},
		},
		loop: {
			name: 'Loop',
			options: [
				{
					type: 'dropdown',
					label: 'Set',
					id: 'opt',
					default: '1',
					choices: CHOICES.ON_OFF_TOGGLE,
				},
			],
			callback: async (action) => {
				let opt = parseInt(action.options.opt)
				if (2 === opt || self.PlayLoop != !!opt) {
					await sendCommand('pl_loop')
				}
			},
		},
		shuffle: {
			name: 'Shuffle',
			options: [
				{
					type: 'dropdown',
					label: 'Set',
					id: 'opt',
					default: '1',
					choices: CHOICES.ON_OFF_TOGGLE,
				},
			],
			callback: async (action) => {
				let opt = parseInt(action.options.opt)
				if (2 === opt || self.PlayShuffle != !!opt) {
					await sendCommand('pl_random')
				}
			},
		},
		repeat: {
			name: 'Repeat',
			options: [
				{
					type: 'dropdown',
					label: 'Set',
					id: 'opt',
					default: '1',
					choices: CHOICES.ON_OFF_TOGGLE,
				},
			],
			callback: async (action) => {
				let opt = parseInt(action.options.opt)
				if (2 === opt || self.PlayRepeat != !!opt) {
					await sendCommand('pl_repeat')
				}
			},
		},
	}
}
