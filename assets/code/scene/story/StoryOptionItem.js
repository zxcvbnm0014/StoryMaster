let StoryAudioMgr = require("StoryAudioMgr");


cc.Class({
    extends: cc.Component,

    properties: {
        audio: {default: null, displayName: "按钮声音", type: cc.AudioClip},
        effect: {default: null, displayName: "按钮点击后特效", type: cc.Prefab},

        menuLabel: cc.Label,
        menuText: {
            displayName: "选项文本", default: "选项", notify() {
                let children = this.node.children;
                for (let i = 0; i < children.length; i++) {
                    let node = children[i];
                    let label = node.getComponent(cc.Label);
                    if (label) {
                        label.string = this.menuText;
                    }
                }
            }
        },

        jumpPlot: {default: "", displayName: "要跳转的新剧情"},// 跳转的剧情
    },

    editor: {
        menu: "A-StoryMaster/StoryOptionItem",
        inspector: "packages://story-master/inspector/StoryOptionItem.js"
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, function (ev) {
            this.node.off(cc.Node.EventType.TOUCH_END);

            if (this.audio) {
                StoryAudioMgr.playEffect(this.audio, false);
            }

            if (this.jumpPlot.length === 0) {
                if (CC_EDITOR) {
                    Editor.warn("该选项并未设置跳转剧情");
                } else {
                    console.warn("该选项并未设置跳转剧情");
                }
            }

            let extra;

            if (this.effect) {
                extra = {
                    effect: this.effect,
                    position: this.node.position,
                }
            }

            cc.ObserverMgr.dispatchMsg(
                cc.StoryMaster.Msg.OnJumpNewPlot,
                {jumpData: this.jumpPlot, extra: extra}
            );

        }.bind(this), this);
    },

    start() {

    },

    // update (dt) {},
});

