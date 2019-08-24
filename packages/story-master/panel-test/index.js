
let Fs = require("fire-fs");
let Core = Editor.require("packages://story-master/core/core.js");
Editor.Panel.extend({
    style: "",
    template: Core.loadFile('panel-test/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
            },
            data: {},
            methods: {
                onBtnClickInit(){
                    Core.initCfg();
                },
            },

        })
    },

    messages: {}
});
