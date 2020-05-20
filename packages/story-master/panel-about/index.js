let Fs = require('fire-fs');
let Core = Editor.require('packages://story-master/core/core.js');
Editor.Panel.extend({
    style: '',
    template: Core.loadFile('panel-about/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                let url = Editor.url('packages://story-master/package.json');
                if (Fs.existsSync(url)) {
                    let cfgData = Fs.readFileSync(url, 'utf-8');
                    let json = JSON.parse(cfgData);
                    if (json) {
                        let time = json['public-time'];
                        if (time) {
                            this.time = time;
                        }
                        let version = json['version'];
                        if (version) {
                            this.version = version;
                        }
                    }
                } else {
                    this.time = null;
                }
            },
            data: {
                version: '0.1',
                doc: 'https://tidys.github.io/plugin-docs-oneself/docs/story-master/',
                update: 'https://tidys.github.io/plugin-docs-oneself/docs/story-master/',
                time: null,
            },
            methods: {},

        });
    },

    messages: {},
});
