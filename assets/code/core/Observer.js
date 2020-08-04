let Observer = cc.Class({
    extends: cc.Component,

    _initMsg () {
        let list = this._getMsgList();
        if (list) {
            for (let k = 0; k < list.length; k++) {
                let msg = list[k];
                cc.ObserverMgr.addEventListener(msg, this._onMsg, this);
            }
        }
        let list2 = this._getLocalMsg();
        for (let key in list2) {
            this.node.on(key, list2[key]);
        }

    },

    onLoad () {
    },
    _getMsgList () {
        return [];
    },
    _getLocalMsg () {
        return {};
    },
    _onMsg (msg, data) {

    },

    onDisable () {
        // cc.ObserverMgr.removeEventListenerWithObject(this);
    },
    onEnable () {
        // ObserverMgr.removeEventListenerWithObject(this);
    },
    onDestroy () {
        cc.ObserverMgr.removeEventListenerWithObject(this);
        let list2 = this._getLocalMsg();
        for (let key in list2) {
            this.node.off(key, list2[key]);
        }
    },
});
cc.Observer = module.exports = Observer;
