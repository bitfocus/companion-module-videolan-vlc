var instance_skel = require('../../instance_skel');
var debug;
var log;
var clip;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	// Example: When this script was committed, a fix needed to be made
	// this will only be run if you had an instance of an older "version" before.
	// "version" is calculated out from how many upgradescripts your intance config has run.
	// So just add a addUpgradeScript when you commit a breaking change to the config, that fixes
	// the config.

	self.addUpgradeScript(function () {
		// just an example
		if (self.config.host !== undefined) {
			self.config.old_host = self.config.host;
		}
	});

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 4,
			default: 8080,
			regex: self.REGEX_PORT
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'HTTP Password',
			width: 8
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {


		'play':   { label: 'Play'},
		'playID': { label: 'Play ID',
				options: [
					{
						type: 'textinput',
						label: 'Clip Nr.',
						id: 'clip',
						default: 1,
						regex: self.REGEX_NUMBER
					}
				]
			},
		'stop':   { label: 'Stop'},
		'pause':  { label: 'Pause / Resume'},
		'next':   { label: 'Next'},
		'prev':   { label: 'Previous'},
		'full':   { label: 'Full Screen'},
		'loop':   { label: 'Loop'},
		'repeat': { label: 'Repeat'}


	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options;
	debug('action: ', action);

	switch (action.action) {

		case 'play':
			cmd = '?command=pl_play';
			break;

		case 'playID':
			cmd = '?command=pl_play&id=' + opt.clip;
			break;

		case 'stop':
			cmd = '?command=pl_stop';
			break;

		case 'pause':
			cmd = '?command=pl_pause';
			break;

		case 'next':
			cmd = '?command=pl_next';
			break;

		case 'prev':
			cmd = '?command=pl_previous';
			break;

		case 'full':
			cmd = '?command=fullscreen';
			break;

		case 'loop':
			cmd = '?command=pl_loop';
			break;

		case 'repeat':
			cmd = '?command=pl_repeat';
			break;



	}

	if (cmd !== undefined) {

		let headers = {};
		if (self.config.password) {
			headers['Authorization'] = "Basic " + new Buffer(['',self.config.password].join(":")).toString("base64");
		}

		self.system.emit('rest',
			'http://' + self.config.host +':'+ self.config.port +'/requests/status.xml'+ cmd,
			{},
			(err, result) => {
				if (err) {
					self.log('Error from  vlc: ' + result);
				}
				//self.debug("Result from REST: ", result);
			},
			headers
		);
	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
