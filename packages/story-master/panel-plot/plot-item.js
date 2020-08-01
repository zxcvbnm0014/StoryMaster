let Core = Editor.require('packages://story-master/core/core.js');
const Msg = Editor.require('packages://story-master/core/msg.js');
const PlotMsg = Editor.require('packages://story-master/panel-plot/msg.js');

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
    computed: {
        typeIcon() {
            if (this.data.type === cc.StoryMaster.Type.Plot.Chapter) {
                return 'packages://story-master/assets/plot-folder.png';
            } else if (this.data.type === cc.StoryMaster.Type.Plot.Piece) {
                return 'packages://story-master/assets/plot-piece.png';
            }
            return 'packages://story-master/assets/plot-unknown.png';
        },
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
            this.$root.$emit(PlotMsg.OnPlotItemRightMenu, this.data);
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
