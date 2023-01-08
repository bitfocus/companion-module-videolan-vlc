import { combineRgb } from '@companion-module/base'

export function GetPresetDefinitions() {
	const presets = {
		'player:play': {
			type: 'button',
			category: 'Player',
			name: 'Play',
			style: {
				text: '',
				png64: self.ICON_PLAY_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'play',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 128, 0),
						playStat: '2',
					},
				},
			],
		},
		'player:pause': {
			type: 'button',
			category: 'Player',
			name: 'Pause',
			style: {
				text: '',
				png64: self.ICON_PAUSE_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 128, 0),
						playStat: '1',
					},
				},
			],
		},
		'player:stop': {
			type: 'button',
			category: 'Player',
			name: 'Stop',
			style: {
				text: '',
				png64: self.ICON_STOP_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'stop',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_status',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 0, 0),
						playStat: '0',
					},
				},
			],
		},
		'player:loop': {
			type: 'button',
			category: 'Player',
			name: 'Loop',
			style: {
				text: 'Loop Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'loop',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_loop',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 128, 128),
					},
				},
			],
		},
		'player:repeat': {
			type: 'button',
			category: 'Player',
			name: 'Repeat',
			style: {
				text: 'Repeat Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'repeat',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_repeat',
					options: {
						fg: '16777215',
						bg: combineRgb(128, 0, 128),
						playStat: '0',
					},
				},
			],
		},
		'player:shuffle': {
			type: 'button',
			category: 'Player',
			name: 'Shuffle',
			style: {
				text: 'Shuffle Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'shuffle',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_random',
					options: {
						fg: '16777215',
						bg: combineRgb(0, 0, 128),
						playStat: '0',
					},
				},
			],
		},
		'player:fullscreen': {
			type: 'button',
			category: 'Player',
			name: 'Full Screen',
			style: {
				text: 'Full Screen Mode',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'full',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'c_full',
					options: {
						fg: '16777215',
						bg: combineRgb(204, 0, 128),
						playStat: '0',
					},
				},
			],
		},
	}

	for (let c = 1; c <= 5; c++) {
		presets[`playlist:play:${c}`] = {
			type: 'button',
			category: 'Play List',
			name: `Play #${c}`,
			style: {
				text: `Play $(vlc:pname_${c})`,
				pngalignment: 'center:center',
				size: 'auto',
				color: combineRgb(164, 164, 164),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'playID',
							options: {
								clip: c,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	return presets
}
