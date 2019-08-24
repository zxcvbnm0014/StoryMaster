let Core = Editor.require("packages://story-master/core/core.js");

let Fs = require("fire-fs");
let Path = require('fire-path');
Vue.component('SM-StoryOptionItem', {
    template: Core.loadFile("inspector/StoryTalk.html"),

    props: {
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
