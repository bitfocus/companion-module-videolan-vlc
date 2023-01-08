import { Regex } from '@companion-module/base'

export const ConfigFields = [
	{
		type: 'textinput',
		id: 'host',
		label: 'Target IP',
		width: 8,
		default: '127.0.0.1',
		regex: Regex.IP,
	},
	{
		type: 'textinput',
		id: 'port',
		label: 'Target Port',
		width: 4,
		default: 8080,
		regex: Regex.PORT,
	},
	{
		type: 'textinput',
		id: 'password',
		label: 'HTTP Password (required)',
		width: 8,
	},
	{
		type: 'checkbox',
		id: 'hires',
		label: 'Increase timer resolution?',
		tooltip: 'Poll playback counter more frequently\nfor better response and resolution',
		default: false,
		width: 4,
	},
	{
		type: 'number',
		id: 'pre_clear',
		label: 'Number of clip names to reserve',
		tooltip: 'Always create this many clip names.\nPrevents $NA when clip name is empty.',
		default: 0,
		min: 0,
		max: 50,
		width: 8,
	},
	{
		type: 'checkbox',
		id: 'use_bullet',
		label: 'Use \u00b7 for empty?',
		tooltip: 'Display \u00b7 for empty clip names\notherwise display blank.',
		default: false,
		width: 4,
	},
]
