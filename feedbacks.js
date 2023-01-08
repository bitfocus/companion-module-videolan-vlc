import { combineRgb } from '@companion-module/base'

export function GetFeedbackDefinitions(self) {
	return {
		c_status: {
			type: 'advanced',
			name: 'Color for Player State',
			description: 'Set Button colors for Player State',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(128, 0, 0),
				},
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
				const options = feedback.options

				if (self.PlayState == parseInt(options.playStat)) {
					return { color: options.fg, bgcolor: options.bg }
				}
				return {}
			},
		},
		c_cue: {
			type: 'advanced',
			name: 'Color for Item state',
			description: 'Set Button colors for single Item State',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(0, 128, 0),
				},
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
					if (self.PlayState == parseInt(options.playStat)) {
						return { color: options.fg, bgcolor: options.bg }
					}
				} else if (0 == parseInt(options.playStat)) {
					// not playing
					return { color: options.fg, bgcolor: options.bg }
				}
				return {}
			},
		},
		c_loop: {
			type: 'advanced',
			name: 'Loop mode Color',
			description: 'Button colors when Player in Loop mode',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(0, 128, 128),
				},
			],
			callback: (feedback) => {
				const options = feedback.options
				return self.PlayLoop ? { color: options.fg, bgcolor: options.bg } : {}
			},
		},
		c_repeat: {
			type: 'advanced',
			name: 'Repeat mode Color',
			description: 'Button colors when Player in Repeat mode',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(128, 0, 128),
				},
			],
			callback: (feedback) => {
				const options = feedback.options
				return self.PlayRepeat ? { color: options.fg, bgcolor: options.bg } : {}
			},
		},
		c_random: {
			type: 'advanced',
			name: 'Shuffle mode Color',
			description: 'Button colors when Player in Shuffle mode',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(0, 0, 128),
				},
			],
			callback: (feedback) => {
				const options = feedback.options
				return self.PlayRandom ? { color: options.fg, bgcolor: options.bg } : {}
			},
		},
		c_full: {
			type: 'advanced',
			name: 'Full Screen Color',
			description: 'Button colors when Player is Full Screen',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215',
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: combineRgb(204, 0, 128),
				},
			],
			callback: (feedback) => {
				const options = feedback.options
				return self.PlayFull ? { color: options.fg, bgcolor: options.bg } : {}
			},
		},
	}
}
