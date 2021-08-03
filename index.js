// 'use strict';
var rest_client 	= require('node-rest-client').Client;
var crypto			= require('crypto');
var instance_skel = require('../../instance_skel');
var GetUpgradeScripts = require('./upgrades')

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.VLC_IS_STOPPED = 0;
	self.VLC_IS_PAUSED = 1;
	self.VLC_IS_PLAYING = 2;
	self.VLC_IS_STOPPING = 3;

	self.actions(); // export actions

	if (process.env.DEVELOPER) {
		self.config._configIdx = -1;
	}

	return self;
}

instance.GetUpgradeScripts = GetUpgradeScripts

instance.prototype.MSTATUS_CHAR = {
	running: "\u23F5",
	paused:  "\u23F8",
	stopped: "\u23F9",
	empty: 	 "\u00b7"
};

instance.prototype.NO_CLIP = {
	title: '',
	num: 0,
	length: 0,
	position: 0,
	time: 0
};

// hash the playlist name and position
// to detect if we need to update our copy
instance.prototype.makeHash = function (list) {
	var hasher = crypto.createHash('md5');

	list.forEach(function(item, pos) {
		hasher.update(item.name + pos);
	});

	return hasher.digest('hex');
};

instance.prototype.show_error = function (err) {
	var self = this;

	if (!self.disabled && self.lastStatus != self.STATUS_ERROR) {
		self.status(self.STATUS_ERROR, err.message);
		self.log('error',err.message);
		self.reset_variables();
		self.updateStatus();
		self.lastStatus = self.STATUS_ERROR;
	}
};

instance.prototype.updateConfig = function (config) {
	var self = this;

	// remove any 'reserved' name variables
	var oldClear = self.config.pre_clear;
	if (oldClear) {
		self.pre_clear = 0;
		self.clearList(oldClear);
	}
	// before changing config
	self.config = config;
	self.startup();
};

instance.prototype.init = function() {
	var self = this;

	self.startup();
};

function vlc_MediaInfo (info) {
	if (info) {
		this.id = info.id;
		this.duration = info.duration;
		this.uri = info.uri;
		this.name = info.name;
	} else {
		this.id = 0;
		this.duration = 0;
		this.uri = '';
		this.name = '';
	}
}

instance.prototype.titleMunge = function(t) {
	var self = this;

	return (t.length > 20 ? t = t.slice(0,10) + t.slice(-10) : t);
};

instance.prototype.reset_variables = function() {
	var self = this;


	self.pre_clear = self.config.pre_clear;
	self.use_bullet = self.config.use_bullet;
	self.clearList(0);

	self.PlayIDs = [];
	self.PlayList = {};
	self.PlayListCheck = '';
	self.PlayState = self.VLC_IS_STOPPED;
	self.NowPlaying = 0;
	self.PollCount = 0;
	self.vlcVersion = 'Not Connected';
	self.PlayStatus = self.NO_CLIP;
	self.PlayLoop = false;
	self.PlayRepeat = false;
	self.PlayRandom = false;
	self.PlayFull = false;
	self.PollWaiting = 0;
	self.lastStatus = -1;
	self.disabled = false;
};

instance.prototype.clear = function (closing) {
	var self = this;

	if (self.plPoll) {
		clearInterval(self.plPoll);
		delete self.plPoll;
	}
	if (self.pbPoll) {
		clearInterval(self.pbPoll);
		delete self.pbPoll;
	}
	if (self.client) {
		delete self.client;
	}

	// don't recharge variables if shutting down
	if (!closing) {
		self.hires = (self.config.hires ? true : false);
		self.baseURL = '';

		self.reset_variables();
	}
};

instance.prototype.clear_vars = function() {
	var self = this;

	self.reset_variables();
	self.init_variables();
};

instance.prototype.startup = function() {
	var self = this;

	self.clear();
	self.status(self.STATUS_WARNING,"Initializing");

	if (self.config.host && self.config.port) {
		self.init_client();
		self.init_variables();
		self.init_feedbacks();
		self.init_presets();
		self.plPoll = setInterval(function() { self.pollPlaylist(); }, 500);
		self.pbPoll = setInterval(function() { self.pollPlayback(); }, 100);
	} else {
		self.status(self.STATUS_WARNING,"No host configured");
	}
};

instance.prototype.init_client = function() {
	var self = this;


	self.baseURL = 'http://' + self.config.host +':'+ self.config.port;
	self.auth = {};

	if (self.config.password) {
		self.auth = { headers: { "Authorization": "Basic " + Buffer.from(['',self.config.password].join(":")).toString("base64") }};
	}

	self.client = new rest_client();

	self.status(self.STATUS_WARNING, 'Connecting');

	self.client.on('error', self.show_error.bind(self));
};

// feedback definitions
instance.prototype.init_feedbacks = function() {
	var self = this;

	var feedbacks = {
		c_status: {
			label: 'Color for Player State',
			description: 'Set Button colors for Player State',
			options: [{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(128, 0, 0)
			},
			{
				type: 'dropdown',
				label: 'Which Status?',
				id: 'playStat',
				default: '0',
				choices: [
					{ id: '0', label: 'Stopped' },
					{ id: '1', label: 'Paused' },
					{ id: '2', label: 'Playing'}
				]
			}],
			callback: function(feedback, bank) {
				var ret = {};
				var options = feedback.options;

				if (self.PlayState == parseInt(options.playStat)) {
					ret = { color: options.fg, bgcolor: options.bg };
				}
				return ret;
			}
		},
		c_cue: {
			label: 'Color for Item state',
			description: 'Set Button colors for single Item State',
			options: [{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: '16777215'
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: self.rgb(0, 128, 0)
				},
				{
					type: 'textinput',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'playStat',
					default: '2',
					choices: [
						{ id: '0', label: 'Stopped' },
						{ id: '1', label: 'Paused' },
						{ id: '2', label: 'Playing'}
					]
				}],
			callback: function(feedback, bank) {
				var ret = {};
				var options = feedback.options;

				if (self.PlayStatus.num == parseInt(options.clip)) {
					if (self.PlayState == parseInt(options.playStat)) {
						ret = { color: options.fg, bgcolor: options.bg };
					}
				} else if (0 == parseInt(options.playStat)) {  // not playing
					ret = { color: options.fg, bgcolor: options.bg };
				}
				return ret;
			}
		},
		c_loop: {
			label: 'Loop mode Color',
			description: 'Button colors when Player in Loop mode',
			options: [{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0, 128, 128)
			}],
			callback: function(feedback, bank) {
				var options = feedback.options;
				return (self.PlayLoop ? { color: options.fg, bgcolor: options.bg } : {});
			}
		},
		c_repeat: {
			label: 'Repeat mode Color',
			description: 'Button colors when Player in Repeat mode',
			options: [{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(128, 0, 128)
			}],
			callback: function(feedback, bank) {
				var options = feedback.options;
				return (self.PlayRepeat ? { color: options.fg, bgcolor: options.bg } : {});
			}
		},
		c_random: {
			label: 'Shuffle mode Color',
			description: 'Button colors when Player in Shuffle mode',
			options: [{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0, 0, 128)
			}],
			callback: function(feedback, bank) {
				var options = feedback.options;
				return (self.PlayRandom ? { color: options.fg, bgcolor: options.bg } : {});
			}
		},
		c_full: {
			label: 'Full Screen Color',
			description: 'Button colors when Player is Full Screen',
			options: [{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: '16777215'
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(204, 0, 128)
			}],
			callback: function(feedback, bank) {
				var options = feedback.options;
				return (self.PlayFull ? { color: options.fg, bgcolor: options.bg } : {});
			}
		}
	};
	self.setFeedbackDefinitions(feedbacks);
};


// define instance variables
instance.prototype.init_variables = function() {
	var self = this;

	var variables = [
		{
			label: 'VLC Version',
			name:  'v_ver'
		},
		{
			label: 'Playing Status',
			name:  'r_stat'
		},
		{
			label: 'Playing Item VLC ID',
			name:  'r_id'
		},
		{
			label: 'Playing Item Name',
			name:  'r_name'
		},
		{
			label: 'Playing Item Playlist Number',
			name:  'r_num'
		},
		{
			label: 'Playing Item Time left, variable size',
			name:  'r_left'
		},
		{
			label: 'Playing Item Time left, HH:MM:SS',
			name:  'r_hhmmss'
		},
		{
			label: 'Playing Item Time left, Hour',
			name:  'r_hh'
		},
		{
			label: 'Playing Item Time left, Minute',
			name:  'r_mm'
		},
		{
			label: 'Playing Item Time left, Second',
			name:  'r_ss'
		},
		{
			label: 'Playing Item Elapsed Time, variable size',
			name:  'e_time'
		},
		{
			label: 'Playing Item Elapsed Time, HH:MM:SS',
			name:  'e_hhmmss'
		},
		{
			label: 'Playing Item Elapsed Time, Hour',
			name:  'e_hh'
		},
		{
			label: 'Playing Item Elapsed Time, Minute',
			name:  'e_mm'
		},
		{
			label: 'Playing Item Elapsed Time, Second',
			name:  'e_ss'
		}
	];

	self.setVariableDefinitions(variables);
};

instance.prototype.clearList = function(oldLength) {
	var self = this;

	var pc = self.pre_clear;
	var empty = self.use_bullet ? self.MSTATUS_CHAR.empty : '';
	var newLength = self.PlayIDs ? self.PlayIDs.length : 0;
	var emptyFrom = newLength < pc ? newLength+1 : pc;

	// add placeholder char for empty clips
	while (pc > newLength && emptyFrom <= pc) {
		self.setVariable('pname_' + parseInt(emptyFrom),empty);
		emptyFrom++;
	}

	// remove any variables left over
	while (oldLength > emptyFrom) {
		self.setVariable('pname_' + (parseInt(oldLength)));
		oldLength--;
	}

};

instance.prototype.updatePlaylist = function(data) {
	var self = this;
	var pList = JSON.parse(data.toString());
	var newList;
	var PlayList = {};
	var oldLength = self.PlayIDs.length;

	if (pList.children) {
		newList = pList.children;
	}

	if (newList.length>0) {
		var nl = newList[0].children;
		var pc = self.makeHash(nl);
		var pi = [];

		if (pc != self.PlayListCheck) {
			var m, p;
			for (p in nl) {
				m = new vlc_MediaInfo(nl[p]);
				PlayList[m.id] = m;
				pi.push(m.id);
			}

			for (p in pi) {
				var oName = self.PlayList[self.PlayIDs[p]] ? self.PlayList[self.PlayIDs[p]].name : '';
				var nName = PlayList[pi[p]].name;
				if (oName != nName) {
					self.setVariable('pname_' + (parseInt(p) + 1), nName);
				}
			}
			self.PlayIDs = pi;
			self.PlayList = PlayList;
			self.PlayListCheck = pc;
		}
	}
	if (self.PlayIDs.length != oldLength) {
		self.clearList(oldLength);
	}
};

instance.prototype.updateStatus = function() {
	var self = this;

	var tenths = (self.config.useTenths ? 0 : 1);
	var ps = self.PlayStatus;
	var state = self.PlayState;

	var tElapsed = ps.length * ps.position;

	var eh = Math.floor(tElapsed / 3600);
	var ehh = ('00' + eh).slice(-2);
	var em = Math.floor(tElapsed / 60) % 60;
	var emm = ('00' + em).slice(-2);
	var es = Math.floor(tElapsed % 60);
	var ess = ('00' + es).slice(-2);
	var eft = '';

	if (ehh > 0) {
		eft = ehh + ":";
	}
	if (emm > 0) {
		eft = eft + emm + ":";
	}
	eft = eft + ess;

	var tLeft = ps.length * (1 - ps.position);
	if (tLeft > 0) {
		tLeft += tenths;
	}

	var h = Math.floor(tLeft / 3600);
	var hh = ('00' + h).slice(-2);
	var m = Math.floor(tLeft / 60) % 60;
	var mm = ('00' + m).slice(-2);
	var s = Math.floor(tLeft % 60);
	var ss = ('00' + s).slice(-2);
	var ft = '';

	if (hh > 0) {
		ft = hh + ":";
	}
	if (mm > 0) {
		ft = ft + mm + ":";
	}
	ft = ft + ss;

	if (tenths == 0) {
		var f = Math.floor((tLeft - Math.trunc(tLeft)) * 10);
		var ms = ('0' + f).slice(-1);
		if (tLeft < 5 && tLeft != 0) {
			ft = ft.slice(-1) + "." + ms;
		}
	}

	self.setVariable('v_ver', self.vlcVersion);
	self.setVariable('r_id', self.NowPlaying);
	self.setVariable('r_name', ps.title);
	self.setVariable('r_num', ps.num);
	self.setVariable('r_stat', state == self.VLC_IS_PLAYING ? self.MSTATUS_CHAR.running :
							state == self.VLC_IS_PAUSED ? self.MSTATUS_CHAR.paused :
							self.MSTATUS_CHAR.stopped);
	self.setVariable('r_hhmmss', hh + ":" + mm + ":" + ss);
	self.setVariable('r_hh', hh);
	self.setVariable('r_mm', mm);
	self.setVariable('r_ss', ss);
	self.setVariable('r_left',ft);
	self.setVariable('e_hhmmss', ehh + ":" + emm + ":" + ess);
	self.setVariable('e_hh', ehh);
	self.setVariable('e_mm', emm);
	self.setVariable('e_ss', ess);
	self.setVariable('e_time', eft);

	self.checkFeedbacks();
};

instance.prototype.updatePlayback = function(data) {
	var self = this;

	var stateChanged = false;
	// hmmm. parsing the buffer directly frequently threw an error
	// so I extracted as a string first to debug and it seems
	// more robust this way. A glitch in JSON.parse?
	var debuf = data.toString();
	var pbInfo = JSON.parse(debuf);

	var wasPlaying = pbStat({ currentplid: self.NowPlaying, position: self.PlayStatus.position });
	self.vlcVersion = pbInfo.version;

	function pbStat(info) {
		return info.currentplid + ':' + info.position + ':' + self.PlayState + ':' + self.PlayStatus.title;
	}

	///
	/// pb vars and feedback here
	///
	stateChanged = stateChanged || (self.PlayState != (self.PlayState = ['stopped','paused','playing'].indexOf(pbInfo.state)));
	stateChanged = stateChanged || (self.PlayRepeat != (self.PlayRepeat = (pbInfo.repeat ? true : false)));
	stateChanged = stateChanged || (self.PlayLoop != (self.PlayLoop = (pbInfo.loop ? true : false)));
	stateChanged = stateChanged || (self.PlayRandom != (self.PlayRandom = (pbInfo.random ? true : false)));
	stateChanged = stateChanged || (self.PlayFull != (self.PlayFull = (pbInfo.fullscreen ? true : false)));
	if (pbInfo.currentplid < 2) {
		self.NowPlaying = -1;
		self.PlayStatus = self.NO_CLIP;
	} else if (self.PlayIDs.length > 0) {
		if (pbInfo.currentplid) {
			self.NowPlaying = pbInfo.currentplid;
			var t = self.PlayList[self.NowPlaying] ? self.titleMunge(self.PlayList[self.NowPlaying].name) : '';
			self.PlayStatus = {
				title: t,
				num: 1 + self.PlayIDs.indexOf(pbInfo.currentplid.toString()),
				length: pbInfo.length,
				position: pbInfo.position,
				time: pbInfo.time
			};
		} else {
			self.NowPlaying = -1;
			self.PlayStatus = self.NO_CLIP;
		}
	}

	if (stateChanged) {
		self.checkFeedbacks();
	}

	if (pbStat(pbInfo) != wasPlaying) {
		self.updateStatus();
	}
};


instance.prototype.getRequest = function(url, cb) {
	var self = this;
	var emsg = '';

	// wait until prior request is finished or timed-out
	// to reduce stacking of unanswered requests
	if (self.PollWaiting > 0) {
		return;
	}

	self.PollWaiting++;

	self.client.get(self.baseURL + url, self.auth, function(data, response) {
		// data is a Buffer
		if (response.statusCode == 401) {
			// error/not found
			if (self.lastStatus != self.STATUS_WARNING) {
				emsg = response.statusMessage + '.\nBad Password?';
				self.status(self.STATUS_WARNING, emsg);
				self.log('error', emsg);
				self.lastStatus = self.STATUS_WARNING;
			}
		} else if (response.statusCode != 200) { // page OK
			self.show_error({ message: 'Remote says: ' + response.statusMessage + '\nIs this VLC?' });
		} else if (data[0] != 123) {	// but is it JSON?
			// check 1st character of data for JSON open brace '{'
			// otherwise it is probably an HTML page from VLC
			// apparently password is not the only issue
			// so forward VLC response to logs
			emsg = data.toString();
			if (self.lastStatus != self.STATUS_WARNING) {
				self.status(self.STATUS_WARNING, emsg);
				self.log('error', emsg);
				self.lastStatus = self.STATUS_WARNING;
			}
		} else {
			if (self.lastStatus != self.STATUS_OK) {
				self.status(self.STATUS_OK);
				self.log('info','Connected to ' + self.config.host + ':' + self.config.port);
				self.lastStatus = self.STATUS_OK;
			}
			cb.call(self,data);
		}
		self.PollWaiting--;
	}).on('error', function(err) {
		self.show_error(err);
		self.PollWaiting--;
	});
};

instance.prototype.pollPlaylist = function() {
	var self = this;

	// don't ask until connected (we have a valid status response)
	if (self.lastStatus == self.STATUS_OK) {
		self.getRequest('/requests/playlist.json', self.updatePlaylist);
	}
};


instance.prototype.pollPlayback = function() {
	var self = this;
	var data;
	var pollNow = false;
	var pollTicks = ((self.lastStatus == self.STATUS_OK) ? 5 : 50);

	// poll every tick if not stopped and hires
	pollNow = ((self.PlayState != self.VLC_IS_STOPPED) && self.hires);
	// or poll every 500ms if connected and not playing
	// every 5 seconds if not connected to allow for timeouts
	pollNow = pollNow || 0 == (self.PollCount % pollTicks);
	if (pollNow) {
		self.getRequest('/requests/status.json', self.updatePlayback);
	}

	self.PollCount += 1;
};


// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	self.clear(true);
	self.disabled = true;
	self.status(self.STATUS_UNKNOWN,'Disabled');

	self.debug("destroy");
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
			default: '127.0.0.1',
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
			label: 'HTTP Password (required)',
			width: 8
		},
		{
			type: 'checkbox',
			id: 'hires',
			label: 'Increase timer resolution?',
			tooltip: 'Poll playback counter more frequently\nfor better response and resolution',
			default: false,
			width:4
		},
		{
			type: 'number',
			id: 'pre_clear',
			label: 'Number of clip names to reserve',
			tooltip: 'Always create this many clip names.\nPrevents $NA when clip name is empty.',
			default: 0,
			min: 0,
			max: 50,
			width: 8
		},
		{
			type: 'checkbox',
			id: 'use_bullet',
			label: 'Use \u00b7 for empty?',
			tooltip: 'Display \u00b7 for empty clip names\notherwise display blank.',
			default: false,
			width: 4
		}
	];
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [

		{
			category: 'Player',
			label: 'Play',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_PLAY_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'play',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_status',
					options: {
						fg: '16777215',
						bg: self.rgb(0, 128, 0),
						playStat: '2'
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Pause',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_PAUSE_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0, 0, 0),

			},
			actions: [
				{
					action: 'pause',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_status',
					options: {
						fg: '16777215',
						bg: self.rgb(128, 128, 0),
						playStat: '1'
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Stop',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_STOP_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'stop',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_status',
					options: {
						fg: '16777215',
						bg: self.rgb(128, 0, 0),
						playStat: '0'
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Loop',
			bank: {
				style: 'png',
				text: 'Loop Mode',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'loop',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_loop',
					options: {
						fg: '16777215',
						bg: self.rgb(0,128,128)
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Repeat',
			bank: {
				style: 'png',
				text: 'Repeat Mode',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'repeat',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_repeat',
					options: {
						fg: '16777215',
						bg: self.rgb(128, 0, 128),
						playStat: '0'
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Shuffle',
			bank: {
				style: 'png',
				text: 'Shuffle Mode',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'shuffle',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_random',
					options: {
						fg: '16777215',
						bg: self.rgb(0, 0, 128),
						playStat: '0'
					}
				}
			]
		},
		{
			category: 'Player',
			label: 'Full Screen',
			bank: {
				style: 'png',
				text: 'Full Screen Mode',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'full',
					options: {}
				}
			],
			feedbacks: [
				{
					type:    'c_full',
					options: {
						fg: '16777215',
						bg: self.rgb(204, 0, 128),
						playStat: '0'
					}
				}
			]
		}
	];

	for (var c = 1; c <=5; c++) {
		presets.push(
		{
			category: 'Play List',
			label: `Play #${c}`,
			bank: {
				style: 'png',
				text: `Play $(vlc:pname_${c})`,
				pngalignment: 'center:center',
				size: 'auto',
				color: self.rgb(164,164,164),
				bgcolor: self.rgb(0,0,0)
			},
			actions: [
				{
					action: 'playID',
					options: {
						clip: c
					}
				}
			]
		});
	}

	self.setPresetDefinitions(presets);
};

instance.prototype.actions = function(system) {
	var self = this;
	self.setActions({
		play: { label: 'Play' },
		playID: {
			label: 'Play ID',
			options: [
				{
					type: 'textinput',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					regex: self.REGEX_NUMBER,
				},
			],
		},
		stop: { label: 'Stop' },
		pause: { label: 'Pause / Resume' },
		next: { label: 'Next' },
		prev: { label: 'Previous' },
		clear: { label: 'Clear Playlist' },
		add: {
			label: 'Add Item',
			options: [
				{
					type: 'textinput',
					label: 'Clip path/MRL',
					id: 'mrl',
					default: '',
				},
			],
		},
		add_go: {
			label: 'Add and Play',
			options: [
				{
					type: 'textinput',
					label: 'Clip path/MRL',
					id: 'mrl',
					default: '',
				},
			],
		},
		deleteID: {
			label: 'Delete ID',
			options: [
				{
					type: 'textinput',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					regex: self.REGEX_NUMBER,
				},
			],
		},
		full: { label: 'Full Screen' },
		loop: { label: 'Loop' },
		shuffle: { label: 'Shuffle' },
		repeat: { label: 'Repeat' }
	})
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options;
	var theClip = opt.clip;

	if (theClip) {
		theClip = self.PlayIDs[theClip - 1];
	}

	self.debug('action: ', action);

	switch (action.action) {

		case 'play':
			cmd = '?command=pl_play';
			break;

		case 'playID':
			cmd = '?command=pl_play&id=' + theClip;
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

		case 'clear':
			cmd = '?command=pl_empty';
			break;

		case 'add':
			cmd = '?command=in_enqueue&input=' + opt.mrl;
			break;

		case 'add_go':
			cmd = '?command=in_play&input=' + opt.mrl;
			break;

		case 'deleteID':
				cmd = '?command=pl_delete&id=' + theClip;
				break;

		case 'full':
			cmd = '?command=fullscreen';
			break;

		case 'loop':
			cmd = '?command=pl_loop';
			break;

		case 'shuffle':
			cmd = '?command=pl_random';
			break;

		case 'repeat':
			cmd = '?command=pl_repeat';
			break;
	}

	if (cmd !== undefined) {
		self.client.get(self.baseURL + '/requests/status.json'+ cmd, self.auth, function(data, response) {
			if (self.lastStatus != self.STATUS_OK) {
				self.status(self.STATUS_OK);
				self.lastStatus = self.STATUS_OK;
			}
		}).on('error', 	self.show_error.bind(self));

		// force an update if command sent while VLC stopped
		self.PollCount = self.PollCount + (5 - (self.PollCount % 5));
	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
