export const UpgradeScripts = [
	function () {
		// no longer necessary - has to live on though
	},
	function (context, config, actions, feedbacks) {
		var changed = false

		if (config.host == undefined || config.host == '') {
			config.host = '127.0.0.1'
			changed = true
		}
		return changed
	},
]
