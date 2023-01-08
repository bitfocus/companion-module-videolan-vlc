export function GetActionDefinitions(self) {
	const sendCommand = async (query) => {
		// TODO
		// 		self.client
		// 			.get(self.baseURL + '/requests/status.json' + cmd, self.auth, function (data, response) {
		// 				if (self.lastStatus != self.STATUS_OK) {
		// 					self.status(self.STATUS_OK)
		// 					self.lastStatus = self.STATUS_OK
		// 				}
		// 			})
		// 			.on('error', self.show_error.bind(self))
		// 		// force an update if command sent while VLC stopped
		// 		self.PollCount = self.PollCount + (5 - (self.PollCount % 5))
	}

	const getTheClip = async (action) => {
		const theClip = await self.parseVariablesInString(action.options.clip)
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
					type: 'number',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					min: 0,
				},
			],
			callback: async (action) => {
				const theClip = await getTheClip(action)

				await sendCommand('pl_play', {
					id: theClip,
				})
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
			options: [],
			callback: async () => {
				await sendCommand('pl_pause')
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
			callback: async (action) => {
				const toWhere = await self.parseVariablesInString(action.options.where)

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
			callback: async (action) => {
				const theMrl = await self.parseVariablesInString(action.options.mrl)

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
			callback: async (action) => {
				const theMrl = await self.parseVariablesInString(action.options.mrl)

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
			callback: async (action) => {
				const theClip = await getTheClip(action)

				await sendCommand('pl_delete', {
					id: theClip,
				})
			},
		},
		volume: {
			name: 'Set Volume',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'volume',
					default: 0,
				},
			],
			callback: async (action) => {
				const vol = await self.parseVariablesInString(action.options.volume)

				await sendCommand('volume', {
					val: vol,
				})
			},
		},
		full: {
			name: 'Full Screen',
			options: [],
			callback: async () => {
				await sendCommand('fullscreen')
			},
		},
		loop: {
			name: 'Loop',
			options: [],
			callback: async () => {
				await sendCommand('pl_loop')
			},
		},
		shuffle: {
			name: 'Shuffle',
			options: [],
			callback: async () => {
				await sendCommand('pl_random')
			},
		},
		repeat: {
			name: 'Repeat',
			options: [],
			callback: async () => {
				await sendCommand('pl_repeat')
			},
		},
	}
}
