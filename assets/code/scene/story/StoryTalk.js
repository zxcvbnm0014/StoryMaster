let TalkSpeed = cc.Enum({
    Slow1: 7,
    Slow2: 6,
    Slow3: 5,
    Normal: 4,
    Fast1: 3,
    Fast2: 2,
    Fast3: 1,
});
let TalkState = cc.Enum({
    Running: 1, // 对话中
    Waiting: 2, // 停顿中
    Over: 3, // 对话结束
});


cc.Class({
    extends: require('Observer'),
    editor: CC_EDITOR && {
        executeInEditMode: true, // 允许当前组件在编辑器模式下运行。
        playOnFocus: true,
        menu: 'A-StoryMaster/StoryTalk',
        inspector: 'packages://story-master/inspector/StoryTalk.js',
    },
    properties: {
        _bOptions: false,
        roleTalkFrame: { default: null, displayName: '对话背景框', type: cc.Node, visible: false },
        word: { default: null, displayName: '对话内容', type: cc.Label, visible: false },

        talkSpeed: {
            default: TalkSpeed.Normal, displayName: '语速', type: TalkSpeed, notify () {
                this.wordIntervalTime = 0.05 * this.talkSpeed;
                this.onWordEffect();
            },
        },
        talkWord: {
            default: '', displayName: '对话', multiline: true, notify () {
                this.word.string = this.talkWord;
                if (CC_EDITOR) {
                    Editor.Ipc.sendToPanel('story-master.piece', 'updatePieceTalkWord', this.talkWord);
                }
            },
        },
        wordIntervalTime: {
            tooltip: '每个字符出现的间隔时间',
            default: 0.1,
            displayName: '间隔时间',
            type: cc.Float,
            visible: false,
        },
        preview: {
            default: '0',
            notify: CC_EDITOR && function (value) {
                this.onWordEffect();
            },
        },
    },


    onLoad () {
        if (CC_EDITOR) {

        } else {
            this._initMsg();
            this.onWordEffect();
        }
    },
    _getMsgList () {
        return [
            cc.StoryMaster.Msg.PieceHasOptions,

        ];
    },
    _onMsg (msg, data) {
        if (msg === cc.StoryMaster.Msg.PieceHasOptions) {
            this._bOptions = true;
        }

    },
    setPiece (piece) {
        this.piece = piece;
    },
    onUserTouch () {
        if (this.state === TalkState.Running) {
            // this.onTalkOver();
            this.onTalkFast();
        } else if (this.state === TalkState.Waiting) {

        } else if (this.state === TalkState.Over) {
            if (this._bOptions) {
                // 说完了,如果有用户选择,不予理会

            } else {
                if (this.piece) {
                    this.piece.node.emit(cc.StoryMaster.Msg.OnPieceTalkOver);
                }
            }
        }
    },
    start () {
    },
    onTalkFast () {
        this.wordIntervalTime = 0.03;

        // let remainWord = this.allWord.length - this.index;
        this.unschedule(this._updateWord);
        this.schedule(this._updateWord, this.wordIntervalTime);
    },
    onWordEffect () {
        if (this.word) {
            this.state = TalkState.Running;
            let scheduleTime = this.wordIntervalTime;
            this.index = 0;
            this.allWord = this.word.string;
            this.unschedule(this._updateWord);
            this.schedule(this._updateWord, scheduleTime);
            this._updateWord();

        }
    },
    _updateWord () {
        this._updateWordByIndex(this.index);
        this.index++;
        if (this.index >= this.allWord.length) {
            this.onTalkOver();
        }
    },
    onTalkOver () {
        this.state = TalkState.Waiting;
        this.unschedule(this._updateWord);
        this.word.string = this.allWord;

        // 为了体验更好,在播放完毕之后会有一个停顿时间,以便于读者反应
        this.scheduleOnce(function () {
            this.state = TalkState.Over;
        }.bind(this), 0.3);
        if (this._bOptions) {
            if (this.piece) {
                this.piece.node.emit(cc.StoryMaster.Msg.PieceShowOptions);
            }
        } else {
            // TODO 自动测试
            // cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnPieceTalkOver, null);
        }
    },
    _updateWordByIndex (index) {
        if (this.allWord && index < this.allWord.length) {
            let curWord = this.allWord.slice(0, index);
            this.word.string = curWord;
        }
    },

});
