let Core = Editor.require("packages://story-master/core/core.js");
const Msg = Editor.require('packages://story-master/core/msg.js');
let StoryMaster = Editor.require("packages://story-master/code/StoryMaster.js");
let Util = Editor.require("packages://story-master/core/util.js");

module.exports = function () {
    Vue.component("piece-item", {
        props: ['data'],
        template: Core.loadFile("panel-piece/piece-item.html"),
        data() {
            return {
                isSelected: false,
                allPlot: [],
            }
        },
        directives: {},
        created() {
            this.allPlot = Util.getPlotData();

            this.$root.$on(Msg.PieceItemSelected, function (data) {
                this.isSelected = this.data.id === data;
            }.bind(this));
        },
        methods: {
            onChangeJumpPlot() {
                // 通知保存
                Editor.Ipc.sendToPanel('story-master.piece', 'onSavePieceData', null);
            },
            onClickOpenPrefab() {
                this.$root.$emit(Msg.PieceItemSelected, this.data.id);
                this.isSelected = true;

                if (this.data.type === StoryMaster.Type.Pieces.PlotJump) {
                    Editor.Ipc.sendToPanel('story-master.piece', "openPrefab", this.data);
                } else if (this.data.type === StoryMaster.Type.Pieces.Content) {
                    if (Editor.remote.assetdb.exists(this.data.prefab)) {
                        Editor.Ipc.sendToPanel('story-master.piece', "openPrefab", this.data);

                    } else {
                        Editor.log(`Prefab丢失,打开失败: ${this.data.prefab}`);
                    }
                }
            },
            onPieceMenu(event) {


                Editor.Ipc.sendToPanel('story-master.piece', 'getPieceCopyCutData', function (data) {
                    let bPast = false;
                    if (data.cut || data.copy) {
                        bPast = true;
                    }
                    let options = {
                        up: true,
                        down: true,
                        cut: true,
                        copy: true,
                        past: bPast,
                    };
                    Editor.Ipc.sendToMain('story-master:onPieceItemMenu', event.x, event.y, this.data, options);

                }.bind(this));


            }
        }
    })
}
