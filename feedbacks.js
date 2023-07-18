import { combineRgb } from '@companion-module/base'

export function GetFeedbackDefinitions(self) {
	const ON_OFF = [
		{id: true, label: 'On'},
		{id: false, label: 'Off'},
	]

	return {
		c_status: {
			type: 'boolean',
			name: 'Player State',
			description: 'Change button style for Player State',
			defaultStyle: {
				bgcolor: combineRgb(128, 0, 0),
				color: 16777215,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'playStat',
					default: '0',
					choices: [
						{ id: '0', label: 'Stopped' },
						{ id: '1', label: 'Paused' },
						{ id: '2', label: 'Playing' },
					],
				},
			],
			callback: (fb) => {
				return self.PlayState == parseInt(fb.options.playStat)
			},
		},
		c_cue: {
			type: 'boolean',
			name: 'Item state',
			description: 'Change button style for single Item State',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 0),
				color: 16777215,
			},
			options: [
				{
					type: 'number',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					min: 0,
				},
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'playStat',
					default: '2',
					choices: [
						{ id: '0', label: 'Stopped' },
						{ id: '1', label: 'Paused' },
						{ id: '2', label: 'Playing' },
					],
				},
			],
			callback: (fb) => {
				const options = fb.options

				if (self.PlayStatus.num == parseInt(options.clip)) {
					return self.PlayState == parseInt(options.playStat)
				}
			},
		},
		c_loop: {
			type: 'boolean',
			name: 'Loop mode',
			description: 'Change button style when Player Loop mode is',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 128),
				color: 16777215,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'opt',
					default: true,
					choices: ON_OFF,
				}
			],
			callback: (fb) => {
				return !!self.PlayLoop == fb.options.opt
			},
		},
		c_repeat: {
			type: 'boolean',
			name: 'Repeat mode',
			description: 'Change button style when Player Repeat mode is',
			defaultStyle: {
				bgcolor: combineRgb(128, 0, 128),
				color: 16777215,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'opt',
					default: true,
					choices: ON_OFF,
				}
			],
			callback: (fb) => {
				return !!self.PlayRepeat == fb.options.opt
			},
		},
		c_shuffle: {
			type: 'boolean',
			name: 'Shuffle mode',
			description: 'Change button style when Player in Shuffle is',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 128),
				color: 16777215,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'opt',
					default: true,
					choices: ON_OFF,
				}
			],
			callback: (fb) => {
				return !!self.PlayShuffle == fb.options.opt
			},
		},
		c_full: {
			type: 'boolean',
			name: 'Full Screen',
			description: 'Change button style when Player is Full Screen is',
			defaultStyle: {
				bgcolor: combineRgb(204, 0, 128),
				color: 16777215,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'opt',
					default: true,
					choices: ON_OFF,
				}
			],
			callback: (fb) => {
				return !!self.PlayFull == fb.options.opt
			},
		},
	}
}
