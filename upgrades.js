import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'

export const UpgradeScripts = [
	function () {
		// no longer necessary - has to live on though
	},
	function (context, props) {
		const result = {
			config: null,
			actions: [],
			feedbacks: [],
		}

		if (props.config) {
			if (props.config.host == undefined || props.config.host == '') {
				props.config.host = '127.0.0.1'
				result.config = props.config
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
]
