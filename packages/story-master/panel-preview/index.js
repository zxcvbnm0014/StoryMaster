const Fs = require("fire-fs");
let Core = Editor.require("packages://story-master/core/core.js");

Editor.Panel.extend({
    style: Core.loadFile("panel-preview/index.css"),
    template: Core.loadFile("panel-preview/index.html"),
    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this.$nextTick(function () {
                    let web = this.$els.web;
                    web.addEventListener('did-start-loading', function () {
                        // console.log('did-start-loading');
                    });
                    web.addEventListener('did-stop-loading', function () {
                        // console.log('did-stop-loading');
                    });
                    web.addEventListener('dom-ready', function (event) {
                        console.log('dom-ready');
                        this.url = event.srcElement.src;

                        // web.openDevTools();

                        const webContents = web.getWebContents();
                        webContents.on('new-window', function (event, url) {
                            // debugger;
                            event.preventDefault();
                            let b = this._setPreviewUrl(url);

                        }.bind(this));
                        webContents.on('did-frame-finish-load', function (event, url) {
                            // console.log(url);
                        });
                    }.bind(this));
                    this.initWebViewUrl();

                }.bind(this))
            },
            init() {

            },
            data: {
                url: "",
                defaultCfg: {
                    docs: {name: "文档", url: "http://docs.cocos.com/creator/manual/zh/"},
                    forum: {name: "论坛", url: "http://forum.cocos.com/c/Creator"},
                    baidu: {name: "百度", url: "http://www.baidu.com"}
                },

            },
            methods: {
                onChangeWebUrl(event) {
                    let url = event.currentTarget.$select.value;
                    if (url) {
                        this._setPreviewUrl(url);
                    }
                },
                onBtnClickWebGoBack() {
                    let url = this.$els.web.goBack();
                    console.log(url);
                },
                onBtnClickWebForward() {
                    this.$els.web.goForward();

                },
                _autoAddHttp(url) {
                    if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
                        return url;
                    } else {
                        return "http://" + this.url
                    }
                },
                onUrlInputOver() {
                    if (this.url === null || this.url.length === 0) {
                        return;
                    }
                    console.log(this.url);
                    let url = this._autoAddHttp(this.url);

                    let b = this._setPreviewUrl(url);

                    return;
                    if (this.url.indexOf("localhost") >= 0 || this.url.indexOf("127.0.0.1") >= 0) {
                        let webSrc = this.$els.web.src;
                        if (webSrc !== this.url) {
                            this.$els.web.src = this.url;
                        }
                    } else {
                        let result = Editor.Dialog.messageBox(
                            {
                                type: "warning",
                                title: "提示",
                                buttons: ['确定', '取消'],
                                message: `${this.url}\n可能不是游戏预览地址,确定访问么?`,
                                defaultId: 0,
                                cancelId: 1,
                                noLink: !0,
                            }
                        );
                        if (result === 0) {
                            this.$els.web.src = this.url;
                        } else {

                        }
                    }

                },
                getIsGameUrl() {
                    let port = Editor.remote.PreviewServer.previewPort;
                    let url1 = "localhost:" + port;
                    let url2 = "127.0.0.1:" + port;
                    if (this.url.indexOf(url1) !== -1 || this.url.indexOf(url2) !== -1) {
                        return true;
                    }
                    return false;
                },
                _setPreviewUrl(url) {
                    let webSrc = this.$els.web.src;
                    const URL = require("url");
                    let webHref = URL.parse(webSrc).href;
                    let urlHref = URL.parse(url).href;
                    // console.log(`web: ${webHref}`);
                    // console.log(`url: ${urlHref}`);
                    if (webHref !== urlHref) {
                        this.$els.web.src = url;
                        this.url = url;
                        return true;
                    }
                    return false;
                },
                onBtnClickHome() {
                    let url = this._getPreviewUrl();
                    let b = this._setPreviewUrl(url);
                },

                _getPreviewUrl() {
                    let port = Editor.remote.PreviewServer.previewPort;
                    if (port === undefined) {
                        port = "7456";
                    }
                    return "http://localhost:" + port + "/";
                    // return "http://localhost:" + port;
                },
                initWebViewUrl() {
                    let stopUrl = "https://tidys.github.io/plugin-docs-oneself/docs/cc-inspector-v2/readme.html";
                    let url = this._getPreviewUrl();
                    this._setPreviewUrl(url);
                },

                onBtnClickOpenDevTools() {
                    let web = this.$els.web;
                    web.openDevTools();
                },
                onBtnClickReload() {
                    let web = this.$els.web;
                    if (web) {
                        web.reload();
                    }
                    // Editor.remote.PreviewServer.browserReload()
                },
            }
        })
    },

    messages: {}
});
