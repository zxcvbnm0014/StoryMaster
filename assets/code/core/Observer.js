let Observer = cc.Class({
    extends: cc.Component,

    _initMsg() {
        let list = this._getMsgList();
        if (list) {
            for (let k = 0; k < list.length; k++) {
                let msg = list[k];
                cc.ObserverMgr.addEventListener(msg, this._onMsg, this);
            }
        }
    },

    onLoad() {
    },
    _getMsgList() {
        return [];
    },
    _onMsg(msg, data) {

    },

    onDisable() {
        // cc.ObserverMgr.removeEventListenerWithObject(this);
    },
    onEnable() {
        // ObserverMgr.removeEventListenerWithObject(this);
    },
    onDestroy() {
        cc.ObserverMgr.removeEventListenerWithObject(this);
    },
});
cc.Observer = module.exports = Observer;
