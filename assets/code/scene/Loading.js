cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
        tips: '',
    },


    onLoad () {
        this.node.addComponent(cc.BlockInputEvents);
        let widget = this.node.addComponent(cc.Widget);
        widget.alignMode = cc.Widget.AlignMode.ALWAYS;
        widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = true;
        widget.bottom = widget.left = widget.right = widget.top = 0;

        if (!this.label) {
            this.label = new cc.Label();
            this.label.string = '加载中...';
            this.node.addChild(this.label);
        }
        // todo  后期支持自定义loading界面
    },

    onEnable () {
        // 显示后2s内没有加载完毕，就给出加载提示
        this.label.node.active = false;
        this.unschedule(this._showTips);
        this.scheduleOnce(this._showTips, 2);
    },
    _showTips () {
        this.label.node.active = true;
    },
    onDisable () {
        this.unschedule(this._showTips);
    },

    // update (dt) {},
});
