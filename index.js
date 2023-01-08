import { InstanceBase, runEntrypoint } from '@companion-module/base'
import * as crypto from 'crypto'
import { UpgradeScripts } from './upgrades.js'
import { GetActionDefinitions } from './actions.js'
import { ConfigFields } from './config.js'
import { GetFeedbackDefinitions } from './feedbacks.js'

// hash the playlist name and position
// to detect if we need to update our copy
function makeHash(list) {
	const hasher = crypto.createHash('md5')

	list.forEach((item, pos) => {
		hasher.update(item.name + pos)
	})

	return hasher.digest('hex')
}

class VlcInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.VLC_IS_STOPPED = 0
		this.VLC_IS_PAUSED = 1
		this.VLC_IS_PLAYING = 2
		this.VLC_IS_STOPPING = 3
	}

	show_error(err) {
		if (!this.disabled && this.lastStatus != this.STATUS_ERROR) {
			this.status(this.STATUS_ERROR, err.message)
			this.log('error', err.message)
			this.reset_variables()
			this.updateStatus()
			this.lastStatus = this.STATUS_ERROR
		}
	}
	updateConfig(config) {
		// remove any 'reserved' name variables
		var oldClear = this.config.pre_clear
		if (oldClear) {
			this.pre_clear = 0
			this.clearList(oldClear)
		}
		// before changing config
		self.config = config
		this.startup()
	}
	init() {
		// export actions
		this.setActionDefinitions(GetActionDefinitions(this))

		this.startup()
	}
	titleMunge(t) {
		return t.length > 20 ? (t = t.slice(0, 10) + t.slice(-10)) : t
	}
	reset_variables() {
		self.pre_clear = this.config.pre_clear
		self.use_bullet = this.config.use_bullet
		this.clearList(0)

		self.PlayIDs = []
		self.PlayList = {}
		self.PlayListCheck = ''
		self.PlayState = this.VLC_IS_STOPPED
		self.NowPlaying = 0
		self.PollCount = 0
		self.vlcVersion = 'Not Connected'
		self.PlayStatus = this.NO_CLIP
		self.PlayLoop = false
		self.PlayRepeat = false
		self.PlayRandom = false
		self.PlayFull = false
		self.PollWaiting = 0
		self.lastStatus = -1
		self.disabled = false
	}
	clear(closing) {
		if (this.plPoll) {
			clearInterval(this.plPoll)
			delete this.plPoll
		}
		if (this.pbPoll) {
			clearInterval(this.pbPoll)
			delete this.pbPoll
		}
		if (this.client) {
			delete this.client
		}

		// don't recharge variables if shutting down
		if (!closing) {
			this.hires = this.config.hires ? true : false
			this.baseURL = ''

			this.reset_variables()
		}
	}
	clear_vars() {
		this.reset_variables()
		this.init_variables()
	}
	startup() {
		this.clear()
		this.status(this.STATUS_WARNING, 'Initializing')

		if (this.config.host && this.config.port) {
			this.init_client()
			this.init_variables()
			this.init_feedbacks()
			this.init_presets()
			this.plPoll = setInterval(() => {
				this.pollPlaylist()
			}, 500)
			this.pbPoll = setInterval(() => {
				this.pollPlayback()
			}, 100)
		} else {
			this.status(this.STATUS_WARNING, 'No host configured')
		}
	}
	init_client() {
		this.baseURL = 'http://' + this.config.host + ':' + this.config.port
		this.auth = {}

		if (this.config.password) {
			this.auth = {
				headers: { Authorization: 'Basic ' + Buffer.from(['', this.config.password].join(':')).toString('base64') },
			}
		}

		this.client = new rest_client()

		this.status(this.STATUS_WARNING, 'Connecting')

		this.client.on('error', this.show_error.bind(this))
	}
	// feedback definitions
	init_feedbacks() {
		self.setFeedbackDefinitions(GetFeedbackDefinitions(this))
	}

	// define instance variables
	init_variables() {
		var variables = [
			{
				label: 'VLC Version',
				name: 'v_ver',
			},
			{
				label: 'Playing Status',
				name: 'r_stat',
			},
			{
				label: 'Playing Item VLC ID',
				name: 'r_id',
			},
			{
				label: 'Playing Item Name',
				name: 'r_name',
			},
			{
				label: 'Playing Item Playlist Number',
				name: 'r_num',
			},
			{
				label: 'Playing Item Time left, variable size',
				name: 'r_left',
			},
			{
				label: 'Playing Item Time left, HH:MM:SS',
				name: 'r_hhmmss',
			},
			{
				label: 'Playing Item Time left, Hour',
				name: 'r_hh',
			},
			{
				label: 'Playing Item Time left, Minute',
				name: 'r_mm',
			},
			{
				label: 'Playing Item Time left, Second',
				name: 'r_ss',
			},
			{
				label: 'Playing Item Elapsed Time, variable size',
				name: 'e_time',
			},
			{
				label: 'Playing Item Elapsed Time, HH:MM:SS',
				name: 'e_hhmmss',
			},
			{
				label: 'Playing Item Elapsed Time, Hour',
				name: 'e_hh',
			},
			{
				label: 'Playing Item Elapsed Time, Minute',
				name: 'e_mm',
			},
			{
				label: 'Playing Item Elapsed Time, Second',
				name: 'e_ss',
			},
		]

		this.setVariableDefinitions(variables)
	}
	clearList(oldLength) {
		var pc = this.pre_clear
		var empty = this.use_bullet ? this.MSTATUS_CHAR.empty : ''
		var newLength = this.PlayIDs ? this.PlayIDs.length : 0
		var emptyFrom = newLength < pc ? newLength + 1 : pc

		// add placeholder char for empty clips
		while (pc > newLength && emptyFrom <= pc) {
			this.setVariable('pname_' + parseInt(emptyFrom), empty)
			emptyFrom++
		}

		// remove any variables left over
		while (oldLength > emptyFrom) {
			this.setVariable('pname_' + parseInt(oldLength))
			oldLength--
		}
	}
	updatePlaylist(data) {
		var self = this
		var pList = JSON.parse(data.toString())
		var newList
		var PlayList = {}
		var oldLength = self.PlayIDs.length

		if (pList.children) {
			newList = pList.children
		}

		if (newList.length > 0) {
			var nl = newList[0].children
			var pc = makeHash(nl)
			var pi = []

			if (pc != self.PlayListCheck) {
				var m, p
				for (p in nl) {
					m = new vlc_MediaInfo(nl[p])
					PlayList[m.id] = m
					pi.push(m.id)
				}

				for (p in pi) {
					var oName = self.PlayList[self.PlayIDs[p]] ? self.PlayList[self.PlayIDs[p]].name : ''
					var nName = PlayList[pi[p]].name
					if (oName != nName) {
						self.setVariable('pname_' + (parseInt(p) + 1), nName)
					}
				}
				self.PlayIDs = pi
				self.PlayList = PlayList
				self.PlayListCheck = pc
			}
		}
		if (self.PlayIDs.length != oldLength) {
			self.clearList(oldLength)
		}
	}
	updateStatus() {
		var tenths = this.config.useTenths ? 0 : 1
		var ps = this.PlayStatus
		var state = this.PlayState

		var tElapsed = ps.length * ps.position

		var eh = Math.floor(tElapsed / 3600)
		var ehh = ('00' + eh).slice(-2)
		var em = Math.floor(tElapsed / 60) % 60
		var emm = ('00' + em).slice(-2)
		var es = Math.floor(tElapsed % 60)
		var ess = ('00' + es).slice(-2)
		var eft = ''

		if (ehh > 0) {
			eft = ehh + ':'
		}
		if (emm > 0) {
			eft = eft + emm + ':'
		}
		eft = eft + ess

		var tLeft = ps.length * (1 - ps.position)
		if (tLeft > 0) {
			tLeft += tenths
		}

		var h = Math.floor(tLeft / 3600)
		var hh = ('00' + h).slice(-2)
		var m = Math.floor(tLeft / 60) % 60
		var mm = ('00' + m).slice(-2)
		var s = Math.floor(tLeft % 60)
		var ss = ('00' + s).slice(-2)
		var ft = ''

		if (hh > 0) {
			ft = hh + ':'
		}
		if (mm > 0) {
			ft = ft + mm + ':'
		}
		ft = ft + ss

		if (tenths == 0) {
			var f = Math.floor((tLeft - Math.trunc(tLeft)) * 10)
			var ms = ('0' + f).slice(-1)
			if (tLeft < 5 && tLeft != 0) {
				ft = ft.slice(-1) + '.' + ms
			}
		}

		this.setVariable('v_ver', this.vlcVersion)
		this.setVariable('r_id', this.NowPlaying)
		this.setVariable('r_name', ps.title)
		this.setVariable('r_num', ps.num)
		this.setVariable(
			'r_stat',
			state == this.VLC_IS_PLAYING
				? this.MSTATUS_CHAR.running
				: state == this.VLC_IS_PAUSED
				? this.MSTATUS_CHAR.paused
				: this.MSTATUS_CHAR.stopped
		)
		this.setVariable('r_hhmmss', hh + ':' + mm + ':' + ss)
		this.setVariable('r_hh', hh)
		this.setVariable('r_mm', mm)
		this.setVariable('r_ss', ss)
		this.setVariable('r_left', ft)
		this.setVariable('e_hhmmss', ehh + ':' + emm + ':' + ess)
		this.setVariable('e_hh', ehh)
		this.setVariable('e_mm', emm)
		this.setVariable('e_ss', ess)
		this.setVariable('e_time', eft)

		this.checkFeedbacks()
	}
	updatePlayback(data) {
		var self = this

		var stateChanged = false
		// hmmm. parsing the buffer directly frequently threw an error
		// so I extracted as a string first to debug and it seems
		// more robust this way. A glitch in JSON.parse?
		var debuf = data.toString()
		var pbInfo = JSON.parse(debuf)

		var wasPlaying = pbStat({ currentplid: self.NowPlaying, position: self.PlayStatus.position })
		self.vlcVersion = pbInfo.version

		function pbStat(info) {
			return info.currentplid + ':' + info.position + ':' + self.PlayState + ':' + self.PlayStatus.title
		}

		///
		/// pb vars and feedback here
		///
		stateChanged =
			stateChanged || self.PlayState != (self.PlayState = ['stopped', 'paused', 'playing'].indexOf(pbInfo.state))
		stateChanged = stateChanged || self.PlayRepeat != (self.PlayRepeat = pbInfo.repeat ? true : false)
		stateChanged = stateChanged || self.PlayLoop != (self.PlayLoop = pbInfo.loop ? true : false)
		stateChanged = stateChanged || self.PlayRandom != (self.PlayRandom = pbInfo.random ? true : false)
		stateChanged = stateChanged || self.PlayFull != (self.PlayFull = pbInfo.fullscreen ? true : false)
		if (pbInfo.currentplid < 2) {
			self.NowPlaying = -1
			self.PlayStatus = self.NO_CLIP
		} else if (self.PlayIDs.length > 0) {
			if (pbInfo.currentplid) {
				self.NowPlaying = pbInfo.currentplid
				var t = self.PlayList[self.NowPlaying] ? self.titleMunge(self.PlayList[self.NowPlaying].name) : ''
				self.PlayStatus = {
					title: t,
					num: 1 + self.PlayIDs.indexOf(pbInfo.currentplid.toString()),
					length: pbInfo.length,
					position: pbInfo.position,
					time: pbInfo.time,
				}
			} else {
				self.NowPlaying = -1
				self.PlayStatus = self.NO_CLIP
			}
		}

		if (stateChanged) {
			self.checkFeedbacks()
		}

		if (pbStat(pbInfo) != wasPlaying) {
			self.updateStatus()
		}
	}
	getRequest(url, cb) {
		var self = this
		var emsg = ''

		// wait until prior request is finished or timed-out
		// to reduce stacking of unanswered requests
		if (self.PollWaiting > 0) {
			return
		}

		self.PollWaiting++

		self.client
			.get(self.baseURL + url, self.auth, function (data, response) {
				// data is a Buffer
				if (response.statusCode == 401) {
					// error/not found
					if (self.lastStatus != self.STATUS_ERROR) {
						emsg = response.statusMessage + '.\nBad Password?'
						self.status(self.STATUS_ERROR, emsg)
						self.log('error', emsg)
						self.lastStatus = self.STATUS_ERROR
					}
				} else if (response.statusCode != 200) {
					// page OK
					self.show_error({ message: 'Remote says: ' + response.statusMessage + '\nIs this VLC?' })
				} else if (data[0] != 123) {
					// but is it JSON?
					// check 1st character of data for JSON open brace '{'
					// otherwise it is probably an HTML page from VLC
					// apparently password is not the only issue
					// so forward VLC response to logs
					emsg = data.toString()
					if (self.lastStatus != self.STATUS_WARNING) {
						self.status(self.STATUS_WARNING, emsg)
						self.log('error', emsg)
						self.lastStatus = self.STATUS_WARNING
					}
				} else {
					if (self.lastStatus != self.STATUS_OK) {
						self.status(self.STATUS_OK)
						self.log('info', 'Connected to ' + self.config.host + ':' + self.config.port)
						self.lastStatus = self.STATUS_OK
					}
					cb.call(self, data)
				}
				self.PollWaiting--
			})
			.on('error', function (err) {
				self.show_error(err)
				self.PollWaiting--
			})
	}
	pollPlaylist() {
		var self = this

		// don't ask until connected (we have a valid status response)
		if (self.lastStatus == self.STATUS_OK) {
			self.getRequest('/requests/playlist.json', self.updatePlaylist)
		}
	}
	pollPlayback() {
		var self = this
		var data
		var pollNow = false
		var pollTicks = self.lastStatus == self.STATUS_OK ? 5 : 50

		// poll every tick if not stopped and hires
		pollNow = self.PlayState != self.VLC_IS_STOPPED && self.hires
		// or poll every 500ms if connected and not playing
		// every 5 seconds if not connected to allow for timeouts
		pollNow = pollNow || 0 == self.PollCount % pollTicks
		if (pollNow) {
			self.getRequest('/requests/status.json', self.updatePlayback)
		}

		self.PollCount += 1
	}
	// When module gets deleted
	destroy() {
		this.clear(true)
		self.disabled = true
		this.status(this.STATUS_UNKNOWN, 'Disabled')

		this.debug('destroy')
	}
	// Return config fields for web config
	config_fields() {
		return ConfigFields
	}
	init_presets() {
		var self = this
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
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'play',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_status',
						options: {
							fg: '16777215',
							bg: self.rgb(0, 128, 0),
							playStat: '2',
						},
					},
				],
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
					color: self.rgb(255, 255, 255),
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'pause',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_status',
						options: {
							fg: '16777215',
							bg: self.rgb(128, 128, 0),
							playStat: '1',
						},
					},
				],
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
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'stop',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_status',
						options: {
							fg: '16777215',
							bg: self.rgb(128, 0, 0),
							playStat: '0',
						},
					},
				],
			},
			{
				category: 'Player',
				label: 'Loop',
				bank: {
					style: 'png',
					text: 'Loop Mode',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'loop',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_loop',
						options: {
							fg: '16777215',
							bg: self.rgb(0, 128, 128),
						},
					},
				],
			},
			{
				category: 'Player',
				label: 'Repeat',
				bank: {
					style: 'png',
					text: 'Repeat Mode',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'repeat',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_repeat',
						options: {
							fg: '16777215',
							bg: self.rgb(128, 0, 128),
							playStat: '0',
						},
					},
				],
			},
			{
				category: 'Player',
				label: 'Shuffle',
				bank: {
					style: 'png',
					text: 'Shuffle Mode',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'shuffle',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_random',
						options: {
							fg: '16777215',
							bg: self.rgb(0, 0, 128),
							playStat: '0',
						},
					},
				],
			},
			{
				category: 'Player',
				label: 'Full Screen',
				bank: {
					style: 'png',
					text: 'Full Screen Mode',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'full',
						options: {},
					},
				],
				feedbacks: [
					{
						type: 'c_full',
						options: {
							fg: '16777215',
							bg: self.rgb(204, 0, 128),
							playStat: '0',
						},
					},
				],
			},
		]

		for (var c = 1; c <= 5; c++) {
			presets.push({
				category: 'Play List',
				label: `Play #${c}`,
				bank: {
					style: 'png',
					text: `Play $(vlc:pname_${c})`,
					pngalignment: 'center:center',
					size: 'auto',
					color: self.rgb(164, 164, 164),
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'playID',
						options: {
							clip: c,
						},
					},
				],
			})
		}

		self.setPresetDefinitions(presets)
	}
}

VlcInstance.prototype.MSTATUS_CHAR = {
	running: '\u23F5',
	paused: '\u23F8',
	stopped: '\u23F9',
	empty: '\u00b7',
}

VlcInstance.prototype.NO_CLIP = {
	title: '',
	num: 0,
	length: 0,
	position: 0,
	time: 0,
}

function vlc_MediaInfo(info) {
	if (info) {
		this.id = info.id
		this.duration = info.duration
		this.uri = info.uri
		this.name = info.name
	} else {
		this.id = 0
		this.duration = 0
		this.uri = ''
		this.name = ''
	}
}

runEntrypoint(VlcInstance, UpgradeScripts)
