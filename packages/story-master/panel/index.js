let Fs = require("fire-fs");
let Core = Editor.require("packages://story-master/core/core.js");
Editor.Panel.extend({
    style: "",
    template: Core.loadFile('panel/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
            },
            data: {
                talkWord: null,
                bg: null,
                tempPrefab: null,
            },
            methods: {
                onBtnClick() {
                    Core.callSceneScript('getStoryPieceInfo', {}, function (error, data) {

                    });

                },
                onBlurTalkWord() {

                }
            },

        })
    },

    // register your ipc messages here
    messages: {}
});
