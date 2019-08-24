let StoryAudioMgr = require("StoryAudioMgr");

cc.Class({
    extends: cc.Component,
    editor: {
        menu: "A-StoryMaster/StoryAudioEffect",
        // inspector: "packages://story-master/inspector/StoryOptionItem.js"
    },
    properties: {
        audio: {default: null, displayName: "音效", type: cc.AudioClip, tooltip: "切换情节会关闭之前所有的音效"},
        delayTime: {
            default: 0, displayName: "延迟播放(s)", range: [0, 999999], notify(value) {

            }
        },
        loop: {default: false, displayName: "是否循环"},
    },

    onLoad() {

    },
    _play() {
        if (this.audio) {
            StoryAudioMgr.playEffect(this.audio, this.loop);
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

    // update (dt) {},
});
