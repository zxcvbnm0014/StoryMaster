'use strict';
const PkgPreview = {
    run: 'story-runner',
    story: 'story-story',
    unit: 'story-unit',
};
const Path = require('fire-path');
const Fs = require('fire-fs');
const Electron = require('electron');
module.exports = {
    load() {},

    unload() {},
    _saveStartScene(sceneName) {
        (async () => {
            let profile = Editor.Profile.load('profile://project/project.json');
            let scene = await this.getSceneUUID(sceneName);
            if (profile && scene && sceneName) {
                profile.data['start-scene'] = scene;
                profile.save();
            } else {
                Editor.log('未找到预览的scene:' + sceneName);
            }
        })();
    },
    _openBrowser() {
        let hostPath = `http://localhost:${Editor.PreviewServer.previewPort}`;
        Electron.shell.openExternal(hostPath, { activate: true });
    },
    _refreshBrowser() {
        Editor.PreviewServer.browserReload();
    },
    _saveInitCfgUnit(cb) {
        Editor.Ipc.sendToPanel(
            'story-master.piece',
            'getCurrentEditorPiecePrefab',
            function(id) {
                if (id) {
                    let StoryMaster = Editor.require(
                        'packages://story-master/code/StoryMaster.js'
                    );
                    let initCfg = StoryMaster.GameCfg.init.plugin;
                    let fullPath = Editor.url(initCfg);
                    if (Fs.existsSync(fullPath)) {
                        let cfgData = Fs.readFileSync(fullPath, 'utf-8');
                        cfgData = JSON.parse(cfgData);
                        cfgData.unit = id;
                        Fs.writeFileSync(fullPath, JSON.stringify(cfgData), 'utf-8');
                        Editor.assetdb.refresh(initCfg);
                        cb && cb();
                    }
                }
            }.bind(this)
        );
    },
    getSceneUUID(sceneName) {
        return new Promise(function(resolve, reject) {
            Editor.assetdb.queryAssets(null, 'scene', function(err, scenes) {
                if (err) {
                    reject(err);
                    return null;
                } else {
                    let ret = null;
                    for (let i = 0; i < scenes.length; i++) {
                        let scene = scenes[i];
                        let itemSceneName = Path.basenameNoExt(scene.path);
                        if (sceneName === itemSceneName) {
                            ret = scene.uuid;
                            break;
                        }
                    }
                    resolve(ret);
                    return ret;
                }
            });
        });
    },
    pieceData: {},
    messages: {
        getPieceData(event, data) {
            event.reply && event.reply(this.pieceData);
        },
        setPieceData(event, data) {
            if (data.selectPlot !== undefined) {
                this.pieceData.selectPlot = data.selectPlot; // 选择的剧情
            }
            if (data.OpenedPrefabID !== undefined) {
                // 打开的prefab
                this.pieceData.OpenedPrefabID = data.OpenedPrefabID;
            }
        },
        open() {
            Editor.Panel.open('story-master');
        },
        openTest() {
            Editor.Panel.open('story-master.test');
        },
        openAbout() {
            Editor.Panel.open('story-master.about');
        },
        setDefaultLayout() {
            const Core = require('./core/core.js');
            Core.setDefaultLayout();
        },
        preview() {
            Editor.Panel.open('story-master.preview');
        },
        openPiece() {
            Editor.Panel.open('story-master.piece');
        },
        openPlot() {
            Editor.Panel.open('story-master.plot');
        },
        openTemplate() {
            Editor.Panel.open('story-master.template');
        },
        initPlugin() {
            const Core = require('./core/core.js');
            Core.initCfg();
        },
        onCustomTemplateMenu(event, x, y, data) {
            let electron = require('electron');
            let BrowserWindow = electron.BrowserWindow;
            let template = [
                {
                    label: '删除',
                    click() {
                        Editor.Ipc.sendToPanel(
                            'story-master.template',
                            'onCustomTemplateMenu',
                            data
                        );
                    },
                },
            ];
            let editorMenu = new Editor.Menu(template, event.sender);

            x = Math.floor(x);
            y = Math.floor(y);
            editorMenu.nativeMenu.popup(
                BrowserWindow.fromWebContents(event.sender),
                x,
                y
            );
            editorMenu.dispose();
        },

        'app:reload-on-device'(event) {
            let profileData = Editor.App._profile.data;
            let platform = profileData['preview-platform'];
            if (platform === PkgPreview.run) {
                // 作品预览
                this._saveStartScene('StoryStart');
                this._refreshBrowser();
            } else if (platform === PkgPreview.unit) {
                this._saveInitCfgUnit(
                    function() {
                        this._saveStartScene('StoryTest');
                        this._refreshBrowser();
                    }.bind(this)
                );
            } else if (platform === PkgPreview.story) {
                this._saveStartScene('StoryGame');
                this._refreshBrowser();
            }
        },
        'app:play-on-device'() {
            let profileData = Editor.App._profile.data;
            let platform = profileData['preview-platform'];
            if (platform === PkgPreview.run) {
                // 作品预览
                this._saveStartScene('StoryStart');
                this._openBrowser();
            } else if (platform === PkgPreview.unit) {
                // 单元测试
                this._saveInitCfgUnit(
                    function() {
                        this._saveStartScene('StoryTest');
                        this._openBrowser();
                    }.bind(this)
                );
            } else if (platform === PkgPreview.story) {
                // 故事预览
                this._saveStartScene('StoryGame');
                this._openBrowser();
            }
        },
    },
};
