var ActionEnum = cc.Enum({
    None: 0,
    FadeIn: 1,
    FadeOut: 2,
    Shake: 3,
    Blink: 4,
    Scale: 5,
    Move: 6,
    FadeTo: 7,
    ColorTo: 8,
});

var Shake = cc.Enum({
    Level1: 1,
    Level2: 2,
    Level3: 3,
    Level4: 4,
    Level5: 5,
});


cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        playOnFocus: true,
        executeInEditMode: true, // 允许当前组件在编辑器模式下运行。
        menu: "A-StoryMaster/Animation",
        inspector: "packages://story-master/inspector/Animation.js"
    },
    properties: {
        action: {default: ActionEnum.None, displayName: "动作", type: ActionEnum,notify(){


            }},
        delayTime: {default: 0, displayName: "延迟时间"},
        actionTime: {default: 0, displayName: "动画时长"},
        shakeStrength: {default: 1, displayName: "震动强度", type: Shake},
        blinkCount: {default: 1, displayName: "闪烁次数"},
        scaleSize: {default: 1, displayName: "缩放比例"},
        moveBegan: {default: cc.v2(0, 0), displayName: "开始坐标",},
        moveEnd: {default: cc.v2(0, 0), displayName: "结束坐标",},

        fadeStart: {default: 0, displayName: "渐变开始透明度"},
        fadeStop: {default: 0, displayName: "渐变结束透明度"},

        startRed: {default: 255, displayName: "开始红色通道值"},
        startGreen: {default: 255, displayName: "开始绿色通道值"},
        startBlue: {default: 255, displayName: "开始蓝色通道值"},

        stopRed: {default: 0, displayName: "到红色通道值"},
        stopGreen: {default: 0, displayName: "到绿色通道值"},
        stopBlue: {default: 0, displayName: "到蓝色通道值"},

        preview: {
            default: "0",
            notify: CC_EDITOR && function (value) {
                console.log(value);
                this._record();
                this._runAction();
            }
        },
        _recordData: null,
    },
    // 记录
    _record: CC_EDITOR && function () {
        this._recordData = {
            x: this.node.x,
            y: this.node.y,
            opacity: this.node.opacity,
            active: this.node.active,
            scaleX: this.node.scaleX,
            scaleY: this.node.scaleY,
            rotation: this.node.rotation,
            width: this.node.width,
            height: this.node.height,
        };
    },
    // 恢复
    _recover: CC_EDITOR && function () {
        this.node.stopAllActions();
        if (this._recordData) {
            this.node.x = this._recordData.x;
            this.node.y = this._recordData.y;
            this.node.opacity = this._recordData.opacity;
            this.node.active = this._recordData.active;
            this.node.scaleX = this._recordData.scaleX;
            this.node.scaleY = this._recordData.scaleY;
            this.node.rotation = this._recordData.rotation;
            this.node.width = this._recordData.width;
            this.node.height = this._recordData.height;
        }
    },

    onLoad() {
        if (!CC_EDITOR) {
            this._runAction();
        }
    },

    onDestroy() {
    },

    _runAction() {
        if (this.action !== ActionEnum.None) {
            if (this.actionTime > 0) {
                let act = this._genAct(this.action);
                if (act) {
                    let actionArr = [];
                    // 延迟动作
                    if (this.delayTime > 0) {
                        actionArr.push(cc.delayTime(this.delayTime));
                    }
                    // 当前设置的动作
                    actionArr.push(act);
                    actionArr.push(cc.callFunc(this._actionOver.bind(this)));
                    let runAct = cc.sequence(actionArr);
                    // this.node.stopAllActions();
                    this.node.runAction(runAct);
                }
            } else {
                console.log("指定的动画时间为0,跳过该动画!");
            }
        } else {
            this._actionOver();
        }
    },
    _actionOver() {
        console.log("action over");
        if (CC_EDITOR) {
            this._recover && this._recover();
        }
    },
    _genAct(type) {
        let ret = null;

        if (type === ActionEnum.FadeOut) {
            this.node.opacity = 255;
            ret = cc.fadeOut(this.actionTime);

        } else if (type === ActionEnum.FadeIn) {
            this.node.opacity = 0;
            ret = cc.fadeIn(this.actionTime);

        } else if (type === ActionEnum.FadeTo) {
            this.node.opacity = this.fadeStart;
            ret = cc.fadeTo(this.actionTime, this.fadeStop);

        } else if (type === ActionEnum.Shake) {// 震动
            let acts = [];

            // 现在count其实无效,
            let cfg = [
                {strength: 1, count: 3, max: 10},
                {strength: 2, count: 5, max: 12},
                {strength: 3, count: 7, max: 15},
                {strength: 4, count: 9, max: 20},
                {strength: 5, count: 11, max: 25},
            ];

            let shakeCount = 0;// 震动次数
            let shakeMaxMoveDistance = 0;// 震动幅度距离
            for (let i = 0; i < cfg.length; i++) {
                let item = cfg[i];
                if (item.strength === this.shakeStrength) {
                    shakeCount = item.count;
                    shakeMaxMoveDistance = item.max;
                    break;
                }
            }
            let moveUnitTime = 0.05;// 单元震动时间
            shakeCount = Math.floor(this.actionTime / moveUnitTime);
            let node = this.node.getPosition();
            if (shakeCount > 0 && shakeMaxMoveDistance > 0) {
                for (let i = 0; i < shakeCount; i++) {
                    let x = node.x + this._randomPos(shakeMaxMoveDistance);
                    let y = node.y + this._randomPos(shakeMaxMoveDistance);
                    let move = cc.moveTo(moveUnitTime, cc.v2(x, y));
                    acts.push(move);
                }
                // acts.push(cc.callFunc(function () {
                //     this.node.x = this.node.y = 0;
                // }.bind(this)));
                ret = cc.sequence(acts);
            } else {
                console.log("未查找到晃动的配置!");
            }
        } else if (type === ActionEnum.Blink) {
            ret = cc.blink(this.actionTime, this.blinkCount);
        } else if (type === ActionEnum.Scale) {
            ret = cc.scaleTo(this.actionTime, this.scaleSize);
        } else if (type === ActionEnum.Move) {
            this.node.setPosition(this.moveBegan);
            ret = cc.moveTo(this.actionTime, this.moveEnd);

        } else if (type === ActionEnum.ColorTo) {
            this.node.color = cc.color(
                this.startRed, this.startGreen, this.startBlue
            );

            ret = cc.tintTo(
                this.actionTime, this.stopRed, this.stopGreen, this.stopBlue
            );
        }

        return ret;
    },
    _randomByMaxValue(maxNum) {
        return Math.floor(Math.random() * maxNum);
    },
    _randomPos(max) {
        let num = this._randomByMaxValue(2);
        if (num % 2 === 0) {
            return this._randomByMaxValue(max)
        } else {
            return -this._randomByMaxValue(max);
        }
    }
    // update (dt) {},
});

