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
            isHover: false,

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
        itemSelectClass() {
            let ret = '';
            if (this.isSelected && this.dragInsertType === null) {
                ret += 'plot-item-selected';
            }
            if (this.isHover) {
                if (!this.isSelected) {
                    ret += 'plot-item-hover';
                }
            }
            return ret;
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
        onMouseOver() {
            // console.log('over');
        },
        onMouseOut() {
            // console.log('out');
        },
        onMouseEnter() {
            this.isHover = true;
        },
        onMouseLeave() {
            this.isHover = false;
        },
        onDragstart(event) {
            // 非常重要
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text', this.data.id);

            // let width = event.target.offsetWidth;
            // let height = event.target.offsetHeight;
            // event.dataTransfer.setDragImage(event.target, 0, 0);
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
                // console.log(`over ${this.data.name} ${new Date().getTime()}`);

                let y = event.offsetY;
                let height = event.currentTarget.offsetHeight;
                if (2 <= y && y < height / 3) {
                    // console.log('before');
                    this.dragInsertType = PlotMsg.PlaceType.Before;
                } else if (height / 3 <= y && y < (height / 3) * 2) {
                    this.dragInsertType = PlotMsg.PlaceType.In;
                } else if ((height / 3) * 2 <= y - 2) {
                    this.dragInsertType = PlotMsg.PlaceType.After;
                    // console.log('after');
                }
            }
        },

        onDrag(event) {
            // console.log('drag');
        },
        onDrop(event) {
            let type = this.dragInsertType;
            let id = event.dataTransfer.getData('text');
            this.dragInsertType = null;
            // 防止乱拖拽
            if (id && id !== '' && id !== this.data.id) {
                this.$root.$emit(PlotMsg.OnDragPlotItem, {
                    from: id,
                    to: this.data.id,
                    type: type,
                });
            }
        },
        onPlotItemMenu(event) {
            this.$root.$emit(PlotMsg.OnPlotItemRightMenu, this.data);
        },

        onItemClick() {
            this.$root.$emit(Msg.PlotItemSelected, false);
            this.isSelected = true;
            this.isHover = false;
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
