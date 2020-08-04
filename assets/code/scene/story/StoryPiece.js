let StoryAudioMgr = require('StoryAudioMgr');


cc.Class({
    extends: require('Observer'),
    editor: CC_EDITOR && {
        executeInEditMode: false, // 允许当前组件在编辑器模式下运行。
        playOnFocus: false,
        menu: 'A-StoryMaster/StoryPiece',

    },
    properties: {
        _menuNode: null,
        _storyTalk: null,
        pieceItem: { default: null, visible: false },
    },
    _getMsgList () {
        return [
            cc.StoryMaster.Msg.PieceShowOptions,
            cc.StoryMaster.Msg.OnPieceTalkOver,
            cc.StoryMaster.Msg.UserTouch,
        ];
    },
    _onMsg (msg, data) {
        if (msg === cc.StoryMaster.Msg.PieceShowOptions) {
            cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnEnableGlobalTouch, false);
            this._menuNode.active = true;
        } else if (msg === cc.StoryMaster.Msg.OnPieceTalkOver) {
            cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnGoNextPiece, this.pieceItem);
        } else if (msg === cc.StoryMaster.Msg.UserTouch) {
            if (this._storyTalk) {
                this._storyTalk.onUserTouch();
            } else {
                if (this._menuNode) {
                } else {
                    cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnGoNextPiece, this.pieceItem);
                }
            }
        }
    },
    onLoad () {
        this._initMsg();
        // 检测选项组件
        let children = this.node.children;
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            let script = item.getComponent('StoryOptionBox');
            if (this._menuNode === null && script) {
                this._menuNode = item;
            }

            let talk = item.getComponent('StoryTalk');
            if (this._storyTalk === null && talk) {
                this._storyTalk = talk;
            }
        }

        if (this._storyTalk) {
            // 有对话,隐藏选项
            if (this._menuNode) {
                this._menuNode.active = false;
            } else {
                // 有对话,没有选项
            }
        } else {
            // 没有对话,隐藏选项
            if (this._menuNode) {
                cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnEnableGlobalTouch, false);
                this._menuNode.active = true;
            }
        }
    },


    start () {
        if (this._menuNode) {
            // 派发消息
            cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.PieceHasOptions, null);
        }
    },

    // update (dt) {},
});
