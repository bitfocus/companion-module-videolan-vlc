import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import * as crypto from 'crypto'
import { UpgradeScripts } from './upgrades.js'
import { GetActionDefinitions } from './actions.js'
import { ConfigFields } from './config.js'
import { GetFeedbackDefinitions } from './feedbacks.js'
import { GetPresetDefinitions } from './presets.js'
import { GetVariableDefinitions } from './variable.js'

// hash the playlist name and position
// to detect if we need to update our copy
function makeHash(list) {
	const hasher = crypto.createHash('md5')

	list.forEach((item, pos) => {
		hasher.update(item.name + pos)
	})

	return hasher.digest('hex')
}

const PLAYSTATE_STOPPED = 0
const PLAYSTATE_PAUSED = 1
const PLAYSTATE_PLAYING = 2
const PLAYSTATE_STOPPING = 3

class VlcInstance extends InstanceBase {
	show_error(err) {
		if (!this.disabled && this.lastStatus != InstanceStatus.UnknownError) {
			this.updateStatus(InstanceStatus.UnknownError, err.message)
			this.log('error', err.message)
			this.reset_variables()
			this.updateStatus()
			this.lastStatus = InstanceStatus.UnknownError
		}
	}
	async configUpdated(config) {
		// remove any 'reserved' name variables
		var oldClear = this.config.pre_clear
		if (oldClear) {
			this.pre_clear = 0
			this.clearList(oldClear)
		}
		// before changing config
		this.config = config
		this.startup()
	}
	async init(config) {
		this.config = config

		// export actions
		this.setActionDefinitions(GetActionDefinitions(this))
		this.setFeedbackDefinitions(GetFeedbackDefinitions(this))
		this.setPresetDefinitions(GetPresetDefinitions())
		this.setVariableDefinitions(GetVariableDefinitions())

		this.startup()
	}
	titleMunge(t) {
		return t.length > 20 ? (t = t.slice(0, 10) + t.slice(-10)) : t
	}
	reset_variables() {
		this.pre_clear = this.config.pre_clear
		this.use_bullet = this.config.use_bullet
		this.clearList(0)

		this.PlayIDs = []
		this.PlayList = {}
		this.PlayListCheck = ''
		this.PlayState = PLAYSTATE_STOPPED
		this.NowPlaying = 0
		this.PollCount = 0
		this.vlcVersion = 'Not Connected'
		this.PlayStatus = this.NO_CLIP
		this.PlayLoop = false
		this.PlayRepeat = false
		this.PlayRandom = false
		this.PlayFull = false
		this.PollWaiting = 0
		this.lastStatus = -1
		this.disabled = false
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

		// don't recharge variables if shutting down
		if (!closing) {
			this.hires = this.config.hires ? true : false
			this.baseURL = ''

			this.reset_variables()
		}
	}
	clear_vars() {
		this.reset_variables()
	}
	startup() {
		this.clear()

		if (this.config.host && this.config.port) {
			this.init_client()
			this.plPoll = setInterval(() => {
				this.pollPlaylist()
			}, 500)
			this.pbPoll = setInterval(() => {
				this.pollPlayback()
			}, 100)
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
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

		this.updateStatus(InstanceStatus.Connecting)

		this.client.on('error', this.show_error.bind(this))
	}

	clearList(oldLength) {
		var pc = this.pre_clear
		var empty = this.use_bullet ? this.MSTATUS_CHAR.empty : ''
		var newLength = this.PlayIDs ? this.PlayIDs.length : 0
		var emptyFrom = newLength < pc ? newLength + 1 : pc

		let newValues = {}

		// add placeholder char for empty clips
		while (pc > newLength && emptyFrom <= pc) {
			newValues['pname_' + parseInt(emptyFrom)] = empty
			emptyFrom++
		}

		// remove any variables left over
		while (oldLength > emptyFrom) {
			newValues['pname_' + parseInt(oldLength)] = undefined
			oldLength--
		}

		this.setVariableValues(newValues)
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
						// TODO - batch
						self.setVariables({ ['pname_' + (parseInt(p) + 1)]: nName })
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

		this.setVariableValues({
			v_ver: this.vlcVersion,
			r_id: this.NowPlaying,
			r_name: ps.title,
			r_num: ps.num,
			r_stat:
				state == PLAYSTATE_PLAYING
					? this.MSTATUS_CHAR.running
					: state == PLAYSTATE_PAUSED
					? this.MSTATUS_CHAR.paused
					: this.MSTATUS_CHAR.stopped,
			r_hhmmss: hh + ':' + mm + ':' + ss,
			r_hh: hh,
			r_mm: mm,
			r_ss: ss,
			r_left: ft,
			e_hhmmss: ehh + ':' + emm + ':' + ess,
			e_hh: ehh,
			e_mm: emm,
			e_ss: ess,
			e_time: eft,
		})

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
					if (self.lastStatus != InstanceStatus.ConnectionFailure) {
						emsg = response.statusMessage + '.\nBad Password?'
						self.updateStatus(InstanceStatus.ConnectionFailure, emsg)
						self.log('error', emsg)
						self.lastStatus = InstanceStatus.ConnectionFailure
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
					if (self.lastStatus != InstanceStatus.UnknownWarning) {
						self.updateStatus(InstanceStatus.UnknownWarning, emsg)
						self.log('error', emsg)
						self.lastStatus = InstanceStatus.UnknownWarning
					}
				} else {
					if (self.lastStatus != InstanceStatus.Ok) {
						self.updateStatus(InstanceStatus.Ok)
						self.log('info', 'Connected to ' + self.config.host + ':' + self.config.port)
						self.lastStatus = InstanceStatus.Ok
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
		// don't ask until connected (we have a valid status response)
		if (this.lastStatus == InstanceStatus.Ok) {
			this.getRequest('/requests/playlist.json', this.updatePlaylist)
		}
	}
	pollPlayback() {
		var pollNow = false
		var pollTicks = this.lastStatus == InstanceStatus.Ok ? 5 : 50

		// poll every tick if not stopped and hires
		pollNow = this.PlayState != PLAYSTATE_STOPPED && this.hires
		// or poll every 500ms if connected and not playing
		// every 5 seconds if not connected to allow for timeouts
		pollNow = pollNow || 0 == this.PollCount % pollTicks
		if (pollNow) {
			this.getRequest('/requests/status.json', this.updatePlayback)
		}

		this.PollCount += 1
	}

	// When module gets deleted
	async destroy() {
		this.clear(true)
		this.disabled = true
	}

	// Return config fields for web config
	getConfigFields() {
		return ConfigFields
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
