let Core = Editor.require('packages://story-master/core/core.js');
const Msg = Editor.require('packages://story-master/core/msg.js');
let StoryMaster = Editor.require('packages://story-master/code/StoryMaster.js');
let Util = Editor.require('packages://story-master/core/util.js');
const RightMenu = Editor.require('packages://story-master/core/rightMenu.js');
const PieceMsg = Editor.require('packages://story-master/panel-piece/msg.js');
let enterTemVar = null;

Vue.component('piece-item', {
    props: ['data'],
    template: Core.loadFile('panel-piece/piece-item.html'),
    data() {
        return {
            isSelected: false,
            allPlot: [],

            dragInsertType: null,
            isHover: false,
            isShowTopLine: false,
            isShowBottomLine: false,
        };
    },
    directives: {},
    created() {
        this.allPlot = Util.getPlotData();

        this.$root.$on(Msg.PieceItemSelected, data => {
            this.isSelected = this.data.id === data;
        });
    },
    computed: {
        pieceClass() {
            let ret = '';

            if (this.isSelected && this.dragInsertType === null) {
                ret += 'piece-item-selected ';
            }
            if (this.isHover) {
                if (!this.isSelected) {
                    ret += 'piece-item-hover ';
                }
            }
            return ret;
        },
    },
    methods: {
        onDrag(event) {},
        onMouseEnter() {
            this.isHover = true;
        },
        onMouseLeave() {
            this.isHover = false;
        },
        onDragstart(event) {
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.clearData('text/plain');
            event.dataTransfer.setData('text/plain', this.data.id);
            console.warn(this.data.id);
        },
        onDragenter(event) {
            enterTemVar = this.data;
        },
        onDragover(event) {
            event.preventDefault();
            event.stopPropagation();

            event.dataTransfer.dropEffect = 'move';
            let y = event.offsetY;
            let halfHeight = event.currentTarget.offsetHeight / 2;
            this.isShowBottomLine = this.isShowTopLine = false;
            if (2 <= y && y < halfHeight) {
                this.dragInsertType = PieceMsg.PlaceType.Before;
                this.isShowTopLine = true;
            } else if (halfHeight <= y - 2) {
                this.dragInsertType = PieceMsg.PlaceType.After;
                this.isShowBottomLine = true;
            }
        },
        onDragleave(event) {
            if (this.data === enterTemVar) {
                return;
            }
            this.dragInsertType = null;
            this.isShowBottomLine = this.isShowTopLine = false;
        },
        onDrop(event) {
            let type = this.dragInsertType;
            let id = event.dataTransfer.getData('text/plain');
            this.dragInsertType = null;
            this.isShowBottomLine = this.isShowTopLine = false;
            if (id && id !== '' && id !== this.data.id) {
                this.$root.$emit(PieceMsg.OnDragPieceItem, {
                    from: id,
                    to: this.data.id,
                    type: type,
                });
            }
        },

        onChangeJumpPlot() {
            // 通知保存
            Editor.Ipc.sendToPanel('story-master.piece', 'onSavePieceData', null);
        },
        onClickOpenPrefab() {
            this.$root.$emit(Msg.PieceItemSelected, this.data.id);
            this.isSelected = true;
            this.isHover = false;
            if (this.data.type === StoryMaster.Type.Pieces.PlotJump) {
                Editor.Ipc.sendToPanel('story-master.piece', 'openPrefab', this.data);
            } else if (this.data.type === StoryMaster.Type.Pieces.Content) {
                if (Editor.remote.assetdb.exists(this.data.prefab)) {
                    Editor.Ipc.sendToPanel('story-master.piece', 'openPrefab', this.data);
                } else {
                    Editor.log(`Prefab丢失,打开失败: ${this.data.prefab}`);
                }
            }
        },
        onPieceMenu(event) {
            this.$root.$emit(PieceMsg.OnPieceItemRightMenu, this.data);
        },
    },
});
