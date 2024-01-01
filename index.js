import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import * as crypto from 'crypto'
import got from 'got'
import { UpgradeScripts } from './upgrades.js'
import { GetActionDefinitions } from './actions.js'
import { ConfigFields } from './config.js'
import { GetFeedbackDefinitions } from './feedbacks.js'
import { GetPresetDefinitions } from './presets.js'
import { GetVariableDefinitions } from './variable.js'
import * as CHOICES from './choices.js'

// hash the playlist name and position
// to detect if we need to update our copy
function makeHash(list) {
	const hasher = crypto.createHash('md5')

	list.forEach((item, pos) => {
		hasher.update(item.name + pos)
	})

	return hasher.digest('hex')
}

const PLAYSTATE = CHOICES.PLAYSTATE

const PL_POLL = 30		// 30 x 0.5 secs

function titleMunge(t) {
	return t.length > 20 ? (t = t.slice(0, 10) + t.slice(-10)) : t
}

const CHARS = {
	running: '\u23F5',
	paused: '\u23F8',
	stopped: '\u23F9',
	empty: '\u00b7',
}

const NO_CLIP = {
	title: '',
	num: 0,
	length: 0,
	position: 0,
	time: 0,
}

class VlcInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// TODO - better define variables to avoid needing this
		this.instanceOptions.disableVariableValidation = true
		this.decodingPlaylist = false
	}

	show_error(err) {
		if (!this.disabled && this.lastStatus != InstanceStatus.UnknownError) {
			this.updateStatus(InstanceStatus.UnknownError, err.message)
			this.reset_variables()
			this.updatePlaybackStatus()
			this.lastStatus = InstanceStatus.UnknownError
		}
	}
	async configUpdated(config) {
		// remove any 'reserved' name variables
		this.clearUnusedReservedClipVariables(0, this.config.pre_clear || 0)

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

	// When module gets deleted
	async destroy() {
		this.stopTimers()
		this.disabled = true
	}

	// Return config fields for web config
	getConfigFields() {
		return ConfigFields
	}

	reset_variables() {
		this.clearUnusedReservedClipVariables(this.config.pre_clear, 0)

		this.PlayIDs = []
		this.PlayList = {}
		this.PlayListCheck = ''
		this.PlayState = CHOICES.PLAYSTATE.STOPPED
		this.NowPlaying = 0
		this.PollCount = 0
		this.PollNow = true
		this.vlcVersion = 'Not Connected'
		this.vlcVolume = -1
		this.vlcItems = 0
		this.PlayStatus = NO_CLIP
		this.PlayLoop = undefined
		this.PlayRepeat = undefined
		this.PlayShuffle = undefined
		this.PlayFull = undefined
		this.PollWaiting = 0
		this.lastStatus = -1
		this.disabled = false
	}

	stopTimers() {
		if (this.plPoll) {
			clearInterval(this.plPoll)
			delete this.plPoll
		}
		if (this.pbPoll) {
			clearInterval(this.pbPoll)
			delete this.pbPoll
		}
	}

	startup() {
		this.stopTimers()

		this.reset_variables()

		if (this.config.host && this.config.port) {
			this.updateStatus(InstanceStatus.Connecting)

			this.baseURL = `http://${this.config.host}:${this.config.port}`
			this.headers = {}

			if (this.config.password) {
				this.headers = {
					Authorization: 'Basic ' + Buffer.from(`:${this.config.password}`).toString('base64'),
				}
			}

			this.plPoll = setInterval(() => this.pollPlaylist(), 500)
			this.pbPoll = setInterval(() => this.pollPlayback(), 10)
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	clearUnusedReservedClipVariables(targetReservedCount, oldLength) {
		const emptyStr = this.config.use_bullet ? CHARS.empty : ''
		const knownClipCount =  this.PlayIDs?.length || 0

		const newVariableValues = {}

		// add placeholder char for empty clips
		for (let i = knownClipCount + 1; i <= targetReservedCount; i++) {
			newVariableValues[`pname_${i}`] = emptyStr
		}

		// remove any previously reserved variables
		for (let i = Math.max(targetReservedCount, knownClipCount) + 1; i <= (oldLength || 0); i++) {
			newVariableValues[`pname_${i}`] = undefined
		}

		this.setVariableValues(newVariableValues)
	}

	updatePlaylist(data) {
		const pList = JSON.parse(data)
		const newList = pList?.children?.[0]?.children
		const newPlayList = {}
		const oldLength = this.PlayIDs.length

		if (newList) {
			const checkHash = makeHash(newList)
			const newPlayIds = []

			if (checkHash != this.PlayListCheck) {
				//this.log('info', `Decoding ${newList.length}`)
				this.decodingPlaylist = true
				for (const p of newList) {
					const itemInfo = new vlc_MediaInfo(p)
					newPlayList[itemInfo.id] = itemInfo
					newPlayIds.push(itemInfo.id)
				}

				let q_vars = {}

				for (let p in newPlayIds) {
					const oName = this.PlayList[this.PlayIDs[p]]?.name ?? ''
					const nName = newPlayList[newPlayIds[p]]?.name
					if (oName != nName) {
						q_vars['pname_' + (parseInt(p) + 1)] = nName
					}
				}
				this.setVariableValues(q_vars)
				this.PlayIDs = newPlayIds
				this.PlayList = newPlayList
				this.PlayListCheck = checkHash
				this.decodingPlaylist = false
				//this.log('info', `Done`)
			}
			this.vlcItems = this.PlayIDs.length
		}
		if (this.PlayIDs.length != oldLength) {
			this.setVariableValues({ v_num: this.vlcItems })
			this.clearUnusedReservedClipVariables(this.config.pre_clear, oldLength)
		}
	}

	updatePlaybackStatus() {
		let tenths = this.config.useTenths ? 0 : 1
		let ps = this.PlayStatus
		let state = this.PlayState

		let tElapsed = ps.length * ps.position

		let eh = Math.floor(tElapsed / 3600)
		let ehh = ('00' + eh).slice(-2)
		let em = Math.floor(tElapsed / 60) % 60
		let emm = ('00' + em).slice(-2)
		let es = Math.floor(tElapsed % 60)
		let ess = ('00' + es).slice(-2)
		let eft = ''

		if (ehh > 0) {
			eft = ehh + ':'
		}
		if (emm > 0) {
			eft = eft + emm + ':'
		}
		eft = eft + ess

		let tLeft = ps.length * (1 - ps.position)
		if (tLeft > 0) {
			tLeft += tenths
		}

		let h = Math.floor(tLeft / 3600)
		let hh = ('00' + h).slice(-2)
		let m = Math.floor(tLeft / 60) % 60
		let mm = ('00' + m).slice(-2)
		let s = Math.floor(tLeft % 60)
		let ss = ('00' + s).slice(-2)
		let ft = ''

		if (hh > 0) {
			ft = hh + ':'
		}
		if (mm > 0) {
			ft = ft + mm + ':'
		}
		ft = ft + ss

		if (tenths == 0) {
			const f = Math.floor((tLeft - Math.trunc(tLeft)) * 10)
			const ms = ('0' + f).slice(-1)
			if (tLeft < 5 && tLeft != 0) {
				ft = ft.slice(-1) + '.' + ms
			}
		}

		this.setVariableValues({
			v_ver: this.vlcVersion,
			v_num: this.vlcItems,
			r_id: this.NowPlaying,
			r_name: ps.title,
			r_num: ps.num,
			r_stat:
				state == PLAYSTATE.PLAYING
					? CHARS.running
					: state == PLAYSTATE.PAUSED
					? CHARS.paused
					: CHARS.stopped,
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
		let stateChanged = false
		const pbInfo = JSON.parse(data)

		const pbStat = (info) => {
			return (
				info.currentplid + ':' + info.position + ':' + this.PlayState + ':' + this.PlayStatus.title
			)
		}

		const wasPlaying = pbStat({ currentplid: this.NowPlaying, position: this.PlayStatus.position })
		this.vlcVersion = pbInfo.version
		if (this.vlcVolume != pbInfo.volume) {
			this.vlcVolume = pbInfo.volume
			this.setVariableValues({
				vol: this.vlcVolume,
				volp: Math.round((this.vlcVolume * 100.0 + Number.EPSILON) / 256.0),
			})
		}
		if (this.vlcRate != pbInfo.rate) {
			this.vlcRate = pbInfo.rate
			this.setVariableValues({
				rate: Math.round(this.vlcRate * 100),
			})
		}
		///
		/// pb vars and feedback here
		///
		stateChanged =
			stateChanged ||
			this.PlayState != (this.PlayState = ['stopped', 'paused', 'playing'].indexOf(pbInfo.state))
		stateChanged = stateChanged || this.PlayRepeat != (this.PlayRepeat = !!pbInfo.repeat)
		stateChanged = stateChanged || this.PlayLoop != (this.PlayLoop = !!pbInfo.loop)
		stateChanged = stateChanged || this.PlayShuffle != (this.PlayShuffle = !!pbInfo.random)
		stateChanged = stateChanged || this.PlayFull != (this.PlayFull = !!pbInfo.fullscreen)

		if (pbInfo.currentplid < 2) {
			this.NowPlaying = -1
			this.PlayStatus = NO_CLIP
		} else if (this.PlayIDs.length > 0) {
			if (pbInfo.currentplid) {
				this.NowPlaying = pbInfo.currentplid
				const t = this.PlayList[this.NowPlaying]
					? titleMunge(this.PlayList[this.NowPlaying].name)
					: ''
				this.PlayStatus = {
					title: t,
					num: 1 + this.PlayIDs.indexOf(pbInfo.currentplid.toString()),
					length: pbInfo.length,
					position: pbInfo.position,
					time: pbInfo.time,
				}
			} else {
				this.NowPlaying = -1
				this.PlayStatus = NO_CLIP
			}
		}

		if (stateChanged) {
			this.checkFeedbacks('c_status', 'c_cue', 'c_loop', 'c_repeat', 'c_shuffle', 'c_full')
		}

		if (pbStat(pbInfo) != wasPlaying) {
			this.updatePlaybackStatus()
		}
	}

	async getRequest(url, cb) {
		// wait until prior request is finished or timed-out
		// to reduce stacking of unanswered requests
		if (this.PollWaiting > 0) {
			return
		}
		this.PollWaiting++

		//this.log('info', `Request: ${url}`)
		got
			.get(this.baseURL + url, { headers: this.headers })
			.then(async (response) => {
				const data = response.body
				// data is a Buffer
				if (response.statusCode == 401) {
					// error/not found
					if (this.lastStatus != InstanceStatus.ConnectionFailure) {
						const emsg = response.statusMessage + '.\nBad Password?'
						this.updateStatus(InstanceStatus.ConnectionFailure, emsg)
						this.log('error', emsg)
						this.lastStatus = InstanceStatus.ConnectionFailure
					}
				} else if (response.statusCode != 200) {
					// page OK
					this.show_error({ message: 'Remote says: ' + response.statusMessage + '\nIs this VLC?' })
				} else if (data[0] != '{') {
					// but is it JSON?
					// check 1st character of data for JSON open brace '{'
					// otherwise it is probably an HTML page from VLC
					// apparently password is not the only issue
					// so forward VLC response to logs
					if (this.lastStatus != InstanceStatus.UnknownWarning) {
						const emsg = data.toString()
						this.updateStatus(InstanceStatus.UnknownWarning, emsg)
						this.log('error', emsg)
						this.lastStatus = InstanceStatus.UnknownWarning
					}
				} else {
					if (this.lastStatus != InstanceStatus.Ok) {
						this.updateStatus(InstanceStatus.Ok)
						this.log('info', 'Connected to ' + this.config.host + ':' + this.config.port)
						this.lastStatus = InstanceStatus.Ok
					}
					//this.log('info', `Response: ${data.length}`)

					cb(data)
				}
				this.PollWaiting--
			})
			.catch((err) => {
				this.show_error(err)
				this.PollWaiting--
			})
	}

	async pollPlaylist() {
		let plPoll = this.plPoll ?? PL_POLL
		// don't ask until connected (we have a valid status response)
		if (this.PlayState != PLAYSTATE.PLAYING || plPoll++ >= PL_POLL) {
			if (!this.decodingPlaylist && this.lastStatus == InstanceStatus.Ok) {
				await this.getRequest('/requests/playlist.json', this.updatePlaylist.bind(this))
				plPoll = 0
			}
		}
		this.plPoll = plPoll
	}

	async pollPlayback() {
		let pollNow = this.PollNow
		const pollTicks = this.lastStatus == InstanceStatus.Ok ? 50 : 500

		// poll every tick if not stopped and hires
		pollNow = pollNow || (this.PlayState == PLAYSTATE.PLAYING && !!this.config.hires)
		// or poll every 500ms if connected and not playing
		// every 5 seconds if not connected to allow for timeouts
		pollNow = pollNow || 0 == this.PollCount % pollTicks
		if (pollNow) {
			await this.getRequest('/requests/status.json', this.updatePlayback.bind(this))
		}

		this.PollNow = false
		this.PollCount += 1
	}
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
