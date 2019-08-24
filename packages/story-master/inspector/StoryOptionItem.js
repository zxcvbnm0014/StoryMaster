let Core = Editor.require("packages://story-master/core/core.js");
let StoryMaster = Editor.require("packages://story-master/code/StoryMaster.js");
let Util = Editor.require("packages://story-master/core/util.js");

let Fs = require("fire-fs");
let Path = require('fire-path');
Vue.component('SM-StoryOptionItem', {
    template: Core.loadFile("inspector/StoryOptionItem.html"),
    created() {
        this.allPlot = Util.getPlotData();
    },
    props: {
        allPlot: [],
        target: {
            twoWay: true,
            type: Object,
        },
        multi: {
            twoWay: true,
            type: Boolean
        }
    },

    methods: {

        onChangeJumpPlot() {
            // var data = {
            //     id: this.target.uuid.value,
            //     path: "jumpPlot",
            //     type: "String",
            //     isSubProp: !1,
            //     value: "1"
            // };
            // Editor.Ipc.sendToPanel("scene", "scene:set-property", data)
        },

        onBtnClickPreview() {
            let time = new Date().getTime().toString();
            var data = {
                id: this.target.uuid.value,
                path: "preview",
                type: "String",
                isSubProp: !1,
                value: time
            };
            Editor.Ipc.sendToPanel("scene", "scene:set-property", data)
        },
    }
});
