import { combineRgb } from '@companion-module/base'

export function GetFeedbackDefinitions(self) {
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
			callback: (feedback) => {
				return self.PlayState == parseInt(feedback.options.playStat)
			},
		},
		c_cue: {
			type: 'advanced',
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
			callback: (feedback) => {
				const options = feedback.options

				if (self.PlayStatus.num == parseInt(options.clip)) {
					return self.PlayState == parseInt(options.playStat)
				}

				return 0 == parseInt(options.playStat)
			},
		},
		c_loop: {
			type: 'advanced',
			name: 'Loop mode',
			description: 'Change button style when Player in Loop mode',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 128),
				color: 16777215,
			},
			options: [],
			callback: () => {
				return !!self.PlayLoop
			},
		},
		c_repeat: {
			type: 'advanced',
			name: 'Repeat mode',
			description: 'Change button style when Player in Repeat mode',
			defaultStyle: {
				bgcolor: combineRgb(128, 0, 128),
				color: 16777215,
			},
			options: [],
			callback: () => {
				return !!self.PlayRepeat
			},
		},
		c_random: {
			type: 'advanced',
			name: 'Shuffle mode',
			description: 'Change button style when Player in Shuffle mode',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 128),
				color: 16777215,
			},
			options: [],
			callback: () => {
				return !!self.PlayRandom
			},
		},
		c_full: {
			type: 'advanced',
			name: 'Full Screen',
			description: 'Change button style when Player is Full Screen',
			defaultStyle: {
				bgcolor: combineRgb(204, 0, 128),
				color: 16777215,
			},
			options: [],
			callback: () => {
				return !!self.PlayFull
			},
		},
	}
}
