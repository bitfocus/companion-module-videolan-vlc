# companion-module-videolan-vlc
See HELP.md and LICENSE

**V1.0.1**
* Initial Module
* Bug fixes
* Indentation Fix

**V1.0.2**
* Added "Play ID"

**V1.0.3**
* Added Shuffle

**V1.1.0**
* Added dynamic variables and feedback
* (which was required to)
* Corrected Play by ID

**V1.1.1**
* Timer typo

**V1.1.2**
* Catch error when password wrong

**V1.1.3**
* Playlist length check

**V1.1.4**
* Added default host '127.0.0.1'
* Fixed error typos

**V1.1.5**
* Reduce network polling in certain cases
* Wait for response or timeout before sending next poll
* Catch stray error when module is disabled
* Catch empty playback response (issue #21)
* Assume "Playlist" is the 1st list instead of checking the label.
* API labels change with locale/language, so it may not be labeled "Playlist" (issue #20)
* Add option to override $NA for a defined number of playlist items.
* Add ID option for feedback colors

**V1.1.6**
* Prevent re-initializing variables while the module is being disabled

**V1.1.7**
* Catch non-JSON response when VLC's password is empty
* Additional documentation

**V1.1.8**
* adjust rgb to self.rgb

**V1.1.9**
* Add variables for Time Elapsed

**V1.1.10**
* Add clear playlist, add to playlist, add to playlist and play

**V1.1.11**
* Core updates / upgrade scripts

**V1.1.12**
* Add **delete** playlist ID
* Add **volume** adjust

**V1.1.13**
* Prettier

**V1.1.14**
* Add **Seek to**
* Added missing default

**V1.1.15**
* Added variable parsing to actions

**V2.0.1**
* Initial V3 refactor

**V2.0.2**
* fix missing feedbacks

**V2.1.0**
* Update: Add several Toggle actions, improve feedbacks

**V2.2.0**
* Add volume and playlist count variables

**V2.2.1**
* Don't strip +/- from volume adjustment

**V2.3.0**
* Add actions to adjust playback speed/rate