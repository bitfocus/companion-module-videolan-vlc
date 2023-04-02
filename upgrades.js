import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'

export const UpgradeScripts = [
	function () {
		// no longer necessary - has to live on though
	},
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		if (props.config) {
			if (props.config.host == undefined || props.config.host == '') {
				props.config.host = '127.0.0.1'
				result.updatedConfig = props.config
			}
		}

		return result
	},
	CreateConvertToBooleanFeedbackUpgradeScript({
		c_status: true,
		c_cue: true,
		c_loop: true,
		c_repeat: true,
		c_random: true,
		c_full: true,
	}),
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (let action of props.actions) {
			let changed = false
			switch (action.actionId) {
				case 'pause':
				case 'full':
				case 'loop':
				case 'repeat':
				case 'shuffle':
					action.options.opt = '2' // used to only be toggle, so set defaulut to toggle
					result.updatedActions.push(action)
			}
		}
		for (let fb of props.feedbacks) {
			let changed = false
			switch (fb.feedbackId) {
				case 'c_random':
					fb.feedbackId = 'c_shuffle'
					delete props.feedbacks.c_shuffle
				case 'c_shuffle':
				case 'c_full':
				case 'c_loop':
				case 'c_repeat':
					fb.options.opt = true // used to be only true
					result.updatedFeedbacks.push(fb)
			}
		}
		return result
	},
]
