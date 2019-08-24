let Fs = require("fire-fs");
let Path = require("fire-path");
let Core = Editor.require("packages://story-master/core/core.js");
Editor.require("packages://story-master/panel-piece/piece-item.js")();
let StoryMaster = Editor.require("packages://story-master/code/StoryMaster.js");
let JsonFormat = Editor.require("packages://story-master/node_modules/json-format");
const Msg = Editor.require('packages://story-master/core/msg.js');

let Op = {
    None: 0,
    Cut: 1,
    Copy: 2,
}

let OpenedPrefabID = null;
let bCutOrCopy = Op.None;
let CopyPieceItem = null;
let CutPieceItem = null;

Editor.Panel.extend({
    style: Core.loadFile('panel-piece/index.css'),
    template: Core.loadFile('panel-piece/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                console.log("created");
                //TODO 将保存的piece数据放在主进程,当再次打开的时候去主进程获取
                Editor.Ipc.sendToMain('story-master:getPieceData', function (data, event) {
                    let retDataTest = {
                        selectPlot: null,// 选择的剧情
                        OpenedPrefabID: null,// 打开的prefab
                    };
                    if (data.selectPlot) {
                        this.setPieceData(data.selectPlot);
                    }
                    if (data.OpenedPrefabID) {
                        OpenedPrefabID = data.OpenedPrefabID;
                    }
                }.bind(this));
            },
            data: {
                plotData: null,
                pieceID: null,
                pieceData: [],
            },
            methods: {
                _findJumpItem() {
                    for (let i = 0; i < this.pieceData.length; i++) {
                        let item = this.pieceData[i];
                        if (item.type === StoryMaster.Type.Pieces.PlotJump) {
                            return item;
                        }
                    }
                    return null;
                },
                onBtnClickAddForceJump() {
                    if (this._findJumpItem()) {
                        Editor.Dialog.messageBox(
                            {
                                type: "warning",
                                title: "提示",
                                buttons: ['确定'],
                                message: `已经存在一个[跳转选项]\n不能重复添加!`,
                                defaultId: 0,
                                cancelId: 1,
                                noLink: !0,
                            }
                        );
                    } else {
                        let jumpData = {
                            id: Editor.Utils.UuidUtils.uuid(),
                            type: StoryMaster.Type.Pieces.PlotJump,
                            name: "强制跳转",
                            jump: "",
                        };
                        this.pieceData.push(jumpData);
                        this._savePiece();
                    }
                },
                updatePieceTalkWord(word) {
                    // this.$root.$emit(Msg.UpdatePieceWord, word);
                    if (OpenedPrefabID) {
                        for (let i = 0; i < this.pieceData.length; i++) {
                            let item = this.pieceData[i];
                            if (item.id === OpenedPrefabID) {
                                // 如果连续输入中文,可能会包含ASCII为8的退格键
                                let newWord = "";
                                debugger
                                for (let i = 0; i < word.length; i++) {
                                    let ascii = word.charCodeAt(i);
                                    console.log(ascii);
                                    if (ascii === 8) {

                                    } else if (ascii === 10) {// 换行符
                                        newWord += '\\n';
                                    } else {
                                        newWord += word[i];
                                    }
                                }
                                item.name = newWord;
                                this._savePiece();
                                break;
                            }
                        }
                    }
                },
                setPieceData(data) {
                    Editor.Ipc.sendToMain('story-master:setPieceData', {selectPlot: data});
                    if (data.root) {
                        this.plotData = null;
                        this.pieceID = null;
                        this.pieceData = [];
                        return;
                    }


                    this.plotData = data;
                    let id = data.piece;
                    this.pieceID = id;
                    let url = Editor.url(StoryMaster.GameCfg.piece.plugin);
                    if (Fs.existsSync(url)) {
                        let cfgData = Fs.readFileSync(url, 'utf-8');
                        cfgData = JSON.parse(cfgData);
                        if (cfgData[id]) {
                            // TODO 通过scene-walk去序列化名字
                            let pieces = cfgData[id];
                            for (let i = 0; i < pieces.length; i++) {
                                // 做一下数据兼容性处理
                                let item = pieces[i];
                                if (item.type === undefined) {
                                    item.type = StoryMaster.Type.Pieces.Content;
                                }
                            }
                            this.pieceData = pieces;
                            setTimeout(function () {
                                this.$root.$emit(Msg.PieceItemSelected, OpenedPrefabID);
                            }.bind(this), 10);
                        } else {
                            console.log(`未发现${id}的数据`);
                        }
                    }
                },
                onInsertItemBefore(data) {
                    (async () => {
                        let id = data.id;
                        for (let i = 0; i < this.pieceData.length; i++) {
                            let item = this.pieceData[i];
                            if (item.id === id) {
                                let insert = await this._genNewPiece();
                                if (insert) {
                                    this.pieceData.splice(i, 0, insert);
                                    this._openPrefab(insert.id);
                                    this._savePiece();
                                    return;
                                } else {

                                }
                            }
                        }
                        Editor.error("插入片段失败!");
                    })();
                },
                onInsertItemAfter(data) {
                    (async () => {

                        let id = data.id;
                        for (let i = 0; i < this.pieceData.length; i++) {
                            let item = this.pieceData[i];
                            if (item.id === id) {
                                let insert = await this._genNewPiece();
                                if (insert) {
                                    this.pieceData.splice(i + 1, 0, insert);
                                    this._openPrefab(insert.id);
                                    this._savePiece();
                                    return;
                                }
                            }
                        }
                        Editor.error("插入片段失败!");

                    })();

                },
                onDelItem(data) {
                    let id = data.id;
                    for (let i = 0; i < this.pieceData.length; i++) {
                        let item = this.pieceData[i];
                        if (item.id === id) {
                            this.pieceData.splice(i, 1);
                            if (item.type === StoryMaster.Type.Pieces.Content || item.type === undefined) {
                                this._savePiece(false);
                                if (Editor.remote.assetdb.exists(item.prefab)) {
                                    Editor.assetdb.delete([item.prefab]);
                                    if (OpenedPrefabID === id) {
                                        Editor.Ipc.sendToPanel('scene', 'scene:new-scene');
                                        // 删除了自己跳转场景
                                    } else {

                                    }
                                    OpenedPrefabID = null;
                                    // 选中项
                                    setTimeout(function () {
                                        this.$root.$emit(Msg.PieceItemSelected, OpenedPrefabID);
                                    }.bind(this), 10);
                                } else {
                                    Editor.log(`Prefab丢失,删除失败: ${item.prefab}`);
                                }
                            } else {
                                this._savePiece(true);
                            }

                            break;
                        }
                    }
                },
                async _genNewPiece(url) {
                    // todo 设置的模版优先级最高
                    let fullPath = null;
                    if (url && Editor.remote.assetdb.exists(url)) {
                        fullPath = Editor.url(url);
                    } else {
                        // 使用默认的预制体
                        let template = Core.getTemplate();
                        fullPath = Editor.url(template.StoryPiece);
                    }

                    if (Fs.existsSync(fullPath)) {
                        let originData = Fs.readFileSync(fullPath, 'utf-8');
                        let time = new Date().getTime().toString();
                        let dir = this.pieceID.substr(0, 2);
                        let newItemUrl = `${StoryMaster.GameCfg.piece.prefab}/${dir}/${time}.prefab`;
                        await Core.makeDirs(Path.dirname(newItemUrl));
                        let results = await Core.writeFile(newItemUrl, originData);
                        if (results && results.length > 0) {
                            let result = results[0];
                            return {
                                id: result.uuid,
                                type: StoryMaster.Type.Pieces.Content,
                                name: "模版" + (Math.random() * 100).toFixed(0),
                                prefab: result.url,
                            };
                        } else {
                            return null;
                        }
                    } else {
                        Editor.log(`插入模版失败, 模版不存在:${url}`);
                        return null;
                    }
                },
                onBtnClickAddNewPiece() {
                    // 拷贝新的prefab
                    (async () => {
                        let data = await this._genNewPiece();
                        if (data) {
                            this.pieceData.push(data);
                            this._openPrefab(data.id);
                            this._savePiece();
                        }
                    })();
                },
                _openPrefab(uuid) {
                    if (OpenedPrefabID !== uuid) {
                        OpenedPrefabID = uuid;
                        Editor.Ipc.sendToMain('story-master:setPieceData', {OpenedPrefabID: OpenedPrefabID});
                        setTimeout(function () {
                            this.$root.$emit(Msg.PieceItemSelected, uuid);
                            // Editor.Ipc.sendToAll('assets:hint', uuid);
                            Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', uuid);
                        }.bind(this), 10);
                    } else {

                    }
                },

                _savePiece(isFresh) {
                    let url = Editor.url(StoryMaster.GameCfg.piece.plugin);

                    if (Fs.existsSync(url)) {
                        let cfgData = JSON.parse(Fs.readFileSync(url, 'utf-8'));

                        if (cfgData[this.pieceID] !== undefined) {
                            cfgData[this.pieceID] = this.pieceData;

                            Fs.writeFileSync(url, JsonFormat(cfgData), 'utf-8');

                            if (isFresh === undefined || isFresh) {
                                Editor.assetdb.refresh(StoryMaster.GameCfg.piece.plugin);
                            }
                        } else {
                            console.log(`未发现${id}的数据`);
                        }
                    }
                },

                onPieceMenuPastItem(data) {
                    if (bCutOrCopy === Op.Copy) {
                        if (CopyPieceItem) {
                            (async () => {
                                let id = data.id;
                                for (let i = 0; i < this.pieceData.length; i++) {
                                    let item = this.pieceData[i];
                                    if (item.id === id) {
                                        let insert = await this._genNewPiece(CopyPieceItem.prefab);
                                        if (insert) {
                                            this.pieceData.splice(i + 1, 0, insert);
                                            this._openPrefab(insert.id);
                                            this._savePiece();
                                            break
                                        }
                                    }
                                }
                                CopyPieceItem = null;

                            })();
                        }
                    } else if (bCutOrCopy === Op.Cut) {
                        if (CutPieceItem) {
                            // 只需要修改piece数组排序即可
                            let delItem = null;
                            for (let i = 0; i < this.pieceData.length; i++) {
                                let item = this.pieceData[i];
                                if (item.id === CutPieceItem.id) {
                                    delItem = this.pieceData.splice(i, 1)[0];
                                    break;
                                }
                            }
                            if (delItem) {
                                for (let i = 0; i < this.pieceData.length; i++) {
                                    let item = this.pieceData[i];
                                    if (item.id === data.id) {
                                        if (i === this.pieceData.length - 1) {
                                            // break;
                                        }
                                        this.pieceData.splice(i + 1, 0, delItem);
                                        this._savePiece(true);
                                        break;
                                    }
                                }

                            }
                            CutPieceItem = null;
                        }
                        bCutOrCopy = Op.None;
                    }
                },
                onPieceMenuItemUp(data) {
                    for (let i = 0; i < this.pieceData.length; i++) {
                        let item = this.pieceData[i];
                        if (item.id === data.id) {
                            if (i === 0) {
                                return;
                            }
                            let delItem = this.pieceData.splice(i, 1)[0];
                            this.pieceData.splice(i - 1, 0, delItem);
                            this._savePiece(true);
                            break;
                        }
                    }
                },
                onPieceMenuItemDown(data) {
                    for (let i = 0; i < this.pieceData.length; i++) {
                        let item = this.pieceData[i];
                        if (item.id === data.id) {
                            if (i === this.pieceData.length - 1) {
                                return;
                            }

                            let delItem = this.pieceData.splice(i, 1)[0];
                            this.pieceData.splice(i + 1, 0, delItem);
                            this._savePiece(true);
                            break;
                        }
                    }
                },
                onPieceMenuItemDownEnd(data) {
                    for (let i = 0; i < this.pieceData.length; i++) {
                        let item = this.pieceData[i];
                        if (item.id === data.id) {
                            if (i === this.pieceData.length - 1) {
                                return;
                            }

                            let delItem = this.pieceData.splice(i, 1)[0];
                            this.pieceData.push(delItem);
                            this._savePiece(true);
                            break;
                        }
                    }
                },

                onPieceTest(data) {
                    const testdata = {
                        unit: data.id,
                    };

                    Fs.writeFileSync(
                        Editor.url(StoryMaster.GameCfg.init.plugin),
                        JsonFormat(testdata), 'utf-8'
                    );

                    Editor.assetdb.refresh(StoryMaster.GameCfg.init.plugin);
                    Editor.Ipc.sendToPanel("scene", "scene:play-on-device");
                },
            },
        })
    },

    messages: {
        onSavePieceData() {
            this.plugin._savePiece(true);
        },
        onPieceData(event, data) {
            this.plugin.setPieceData(data);
        },
        onPieceMenuDel(event, data) {
            this.plugin.onDelItem(data);
        },
        onPieceMenuInsertItemAfter(event, data) {
            this.plugin.onInsertItemAfter(data);
        },
        onPieceMenuInsertItemBefore(event, data) {
            this.plugin.onInsertItemBefore(data);
        },
        onPieceMenuItemCut(event, data) {
            bCutOrCopy = Op.Cut;
            CutPieceItem = data;
        },
        onPieceMenuCopyItem(event, data) {
            bCutOrCopy = Op.Copy;
            CopyPieceItem = data;
        },
        onPieceMenuPastItem(event, data) {
            this.plugin.onPieceMenuPastItem(data);
        },
        openPrefab(event, data) {
            if (data.type === StoryMaster.Type.Pieces.PlotJump) {
                OpenedPrefabID = data.id;
                Editor.Ipc.sendToMain('story-master:setPieceData', {OpenedPrefabID: OpenedPrefabID});
                Editor.Ipc.sendToPanel('scene', 'scene:new-scene');
            } else {
                this.plugin._openPrefab(data.id);
            }
        },
        updatePieceTalkWord(event, data) {
            this.plugin.updatePieceTalkWord(data);
        },
        getCurrentEditorPiecePrefab(event) {
            event.reply && event.reply(OpenedPrefabID);
        },
        onPieceMenuItemUp(event, data) {
            this.plugin.onPieceMenuItemUp(data);
        },
        onPieceMenuItemDown(event, data) {
            this.plugin.onPieceMenuItemDown(data);
        },
        onPieceTest(event, data) {
            this.plugin.onPieceTest(data);
        },
        getPieceCopyCutData(event) {
            event.reply && event.reply({copy: CopyPieceItem, cut: CutPieceItem});
        },
        onPieceMenuItemDownEnd(event, data) {
            this.plugin.onPieceMenuItemDownEnd(data);
        },
        'scene:enter-prefab-edit-mode'(event, data) {
            OpenedPrefabID = data;
            Editor.Ipc.sendToMain('story-master:setPieceData', {OpenedPrefabID: OpenedPrefabID});
            this.plugin.$root.$emit(Msg.PieceItemSelected, OpenedPrefabID);
        },
        // 这个函数只有在默认布局的时候进行设置
        forceSetOpenedPrefabID(event, data) {
            OpenedPrefabID = data;
            Editor.Ipc.sendToMain('story-master:setPieceData', {OpenedPrefabID: OpenedPrefabID});
            this.plugin.$root.$emit(Msg.PieceItemSelected, OpenedPrefabID);
        }

    }
});
