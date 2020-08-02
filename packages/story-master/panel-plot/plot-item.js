let Core = Editor.require('packages://story-master/core/core.js');
const Msg = Editor.require('packages://story-master/core/msg.js');
const PlotMsg = Editor.require('packages://story-master/panel-plot/msg.js');

let enterTemVar = null;

Vue.component('plot-item', {
    props: ['data'],
    template: Core.loadFile('panel-plot/plot-item.html'),
    data() {
        return {
            isRename: false,
            isSelected: false,

            dragInsertType: null,
            isShowTopLine: false,
            isShowBottomLine: false,
        };
    },
    directives: {},
    created() {
        this.$root.$on(Msg.PlotItemSelected, (event, data) => {
            this.isSelected = false;
        });
    },
    computed: {
        typeIcon() {
            if (this.data.type === cc.StoryMaster.Type.Plot.Chapter) {
                return 'packages://story-master/assets/plot-folder.png';
            } else if (this.data.type === cc.StoryMaster.Type.Plot.Piece) {
                return 'packages://story-master/assets/plot-piece.png';
            } else if (this.data.type === 'root') {
                return 'packages://story-master/assets/plot-root.png';
            }
            return 'packages://story-master/assets/plot-unknown.png';
        },
        canDrag() {
            return this.data.type !== 'root';
        },
        dragInsertClass() {
            let type = this.dragInsertType;
            this.isShowBottomLine = this.isShowTopLine = false;
            if (type === PlotMsg.PlaceType.In) {
                return 'insertIn';
            } else if (type === PlotMsg.PlaceType.Before) {
                this.isShowTopLine = true;
                return null;
            } else if (type === PlotMsg.PlaceType.After) {
                this.isShowBottomLine = true;
                return null;
            }
            return null;
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
        onDragstart(event) {
            // 非常重要
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text', this.data.id);
        },
        onDragenter() {
            enterTemVar = this.data;
        },
        onDragleave(event) {
            // 在拖拽到子元素上时，会触发主元素的leave，所以这里多做了一层处理
            if (this.data === enterTemVar) {
                return;
            }
            this.dragInsertType = null;
        },
        onDragover(event) {
            event.preventDefault();
            event.stopPropagation();
            let id = event.dataTransfer.getData('text');
            if (this.data.id === id) {
                event.dataTransfer.dropEffect = 'none';
                this.dragInsertType = PlotMsg.PlaceType.In;
            } else {
                event.dataTransfer.dropEffect = 'move';
                console.log(`over ${this.data.name} ${new Date().getTime()}`);

                let y = event.offsetY;
                let height = event.currentTarget.offsetHeight;
                if (2 <= y && y < height / 3) {
                    console.log('before');
                    this.dragInsertType = PlotMsg.PlaceType.Before;
                } else if (height / 3 <= y && y < (height / 3) * 2) {
                    this.dragInsertType = PlotMsg.PlaceType.In;
                } else if ((height / 3) * 2 <= y - 2) {
                    this.dragInsertType = PlotMsg.PlaceType.After;
                    console.log('after');
                }
            }
        },

        onDrag(event) {
            console.log('drag');
        },
        onDrop(event) {
            let id = event.dataTransfer.getData('text');
            let type = this.dragInsertType;
            this.$root.$emit(PlotMsg.OnDragPlotItem, {
                from: id,
                to: this.data.id,
                type: type,
            });
            this.dragInsertType = null;
        },
        onPlotItemMenu(event) {
            this.$root.$emit(PlotMsg.OnPlotItemRightMenu, this.data);
        },

        onItemClick() {
            this.$root.$emit(Msg.PlotItemSelected, false);
            this.isSelected = true;
            clearTimeout(this.clickTimer);
            this.clickTimer = setTimeout(() => {
                Editor.Ipc.sendToPanel('story-master.piece', 'onPieceData', this.data);
            }, 200);
        },
        onDoubleClickRename() {
            clearTimeout(this.clickTimer);
            this.isRename = true;
            setTimeout(() => {
                this.$els.rename.focus();
            }, 10);
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
