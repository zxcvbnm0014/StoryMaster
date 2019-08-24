let StoryAudioMgr = require("StoryAudioMgr");

cc.Class({
    extends: cc.Component,
    editor: {
        menu: "A-StoryMaster/StoryAudioMusic",
    },
    properties: {
        audio: {default: null, displayName: "音乐", type: cc.AudioClip, tooltip: "同一时间只会播放一个音乐"},
        delayTime: {
            default: 0, displayName: "延迟播放(s)", range: [0, 999999], notify(value) {

            }
        },
        loop: {
            default: false, displayName: "是否循环", notify() {


            }
        },
        isStopOnDestroy: {default: true, displayName: "结束时暂停"},

    },

    onLoad() {

    },
    _play() {
        if (this.audio) {
            StoryAudioMgr.playMusic(this.audio, this.loop);
        }
    },

    start() {
        this.scheduleOnce(function () {
            if (this.delayTime <= 0) {
                this._play();
            } else {
                this.scheduleOnce(function () {
                    this._play();
                }.bind(this), this.delayTime);
            }
        }.bind(this), 0.1);

    },
    onDestroy() {
        if (this.isStopOnDestroy) {
            StoryAudioMgr.stopMusic();
        }
    },

    // update (dt) {},
});
