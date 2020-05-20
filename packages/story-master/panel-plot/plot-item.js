let Core = Editor.require('packages://story-master/core/core.js');
const Msg = Editor.require('packages://story-master/core/msg.js');
module.exports = function() {
    Vue.component('plot-item', {
        props: ['data'],
        template: Core.loadFile('panel-plot/plot-item.html'),
        data() {
            return {
                isRename: false,
                isSelected: false,
            };
        },
        directives: {},
        created() {
            this.$root.$on(
                Msg.PlotItemSelected,
                function(event, data) {
                    this.isSelected = false;
                }.bind(this)
            );
        },
        methods: {
            _foldClass() {
                if (this.data.fold) {
                    return 'fa fa-caret-right';
                } else {
                    return 'fa fa-caret-down';
                }
            },
            onClickFold() {
                this.data.fold = !this.data.fold;
                // todo 通知事件
                Editor.Ipc.sendToPanel('story-master.plot', 'onItemFold', this.data);
            },
            onMouseOver() {},
            onMouseOut() {},
            onPlotItemMenu(event) {
                Editor.Ipc.sendToPanel(
                    'story-master.plot',
                    'getCutItemID',
                    function(id, parent) {
                        let bPast = true;
                        if (id) {
                            if (parent && parent === this.data.id) {
                                bPast = false;
                            }
                        } else {
                            bPast = false;
                        }

                        let options = {
                            cut: !this.data.root,
                            past: bPast,
                            del: !this.data.root,
                        };
                        Editor.Ipc.sendToMain(
                            'story-master:onPlotItemMenu',
                            event.x,
                            event.y,
                            this.data,
                            options
                        );
                    }.bind(this)
                );
            },
            onItemClick() {
                this.$root.$emit(Msg.PlotItemSelected, false);
                this.isSelected = true;
                clearTimeout(this.clickTimer);
                this.clickTimer = setTimeout(
                    function() {
                        Editor.Ipc.sendToPanel(
                            'story-master.piece',
                            'onPieceData',
                            this.data
                        );
                    }.bind(this),
                    200
                );
            },
            onDoubleClickRename() {
                clearTimeout(this.clickTimer);
                this.isRename = true;
                setTimeout(
                    function() {
                        this.$els.rename.focus();
                    }.bind(this),
                    10
                );
            },
            onChangeName() {
                this.isRename = false;
                // todo 如果名字包含特殊符号会导致json保存失败
                this.data.name = Core.replaceSpecialChar(this.data.name);
                console.log(this.data.name);
                Editor.Ipc.sendToPanel('story-master.plot', 'onItemFold', this.data);
                Editor.Ipc.sendToPanel('story-master.piece', 'onPieceData', this.data);
            },
        },
    });
};
