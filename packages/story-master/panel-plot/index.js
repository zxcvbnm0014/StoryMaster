const Fs = require('fire-fs');
let Core = Editor.require('packages://story-master/core/core.js');
let StoryMaster = Editor.require('packages://story-master/code/StoryMaster.js');
const JsonFormat = Editor.require(
    'packages://story-master/node_modules/json-format'
);
const RightMenu = Editor.require('packages://story-master/core/rightMenu.js');
const PlotMsg = Editor.require('packages://story-master/panel-plot/msg.js');
let CutPlotItem = null;
Editor.require('packages://story-master/panel-plot/plot-item.js');
Editor.Panel.extend({
    style: Core.loadFile('panel-plot/index.css'),
    template: Core.loadFile('panel-plot/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                let url = Editor.url(StoryMaster.GameCfg.plot.plugin);
                if (Fs.existsSync(url)) {
                    let data = Fs.readFileSync(url, 'utf-8');
                    data = JSON.parse(data);
                    this.plotData.children = data;
                }
                this.$root.$on(PlotMsg.OnPlotItemRightMenu, this.OnPlotItemRightMenu);
            },
            data: {
                plotData: {
                    id: Editor.Utils.UuidUtils.uuid(),
                    root: true,
                    fold: false,
                    name: '我的剧情',
                    children: [],
                },
            },
            methods: {
                getCutItemID() {
                    let id = null;
                    let parent = null;
                    if (CutPlotItem && CutPlotItem.root === false) {
                        let ret = this._findItemParentById(this.plotData, CutPlotItem.id);
                        id = CutPlotItem.id;
                        parent = ret.id;
                    }
                    return { id, parent };
                },
                OnPlotItemRightMenu(data) {
                    let { id, parent } = this.getCutItemID();
                    let bPast = true;
                    if (id) {
                        if (parent && parent === data.id) {
                            bPast = false;
                        }
                    } else {
                        bPast = false;
                    }

                    let options = {
                        cut: !data.root,
                        past: bPast,
                        del: !data.root,
                    };
                    this._createPlotItemMenu(data, options);
                },
                _createPlotItemMenu(data, options) {
                    let template = [
                        {
                            label: '添加平级剧情',
                            click: () => {
                                this.addSiblingItem(data);
                            },
                        },
                        {
                            label: '添加子剧情',
                            click: () => {
                                this.addItem(data);
                            },
                        },
                        { type: 'separator' },
                        {
                            label: '上移',
                            click: () => {
                                this.onPlotMenuItemUp(data);
                            },
                        },
                        {
                            label: '下移',
                            click: () => {
                                this.onPlotMenuItemDown(data);
                            },
                        },
                        { type: 'separator' },
                        // {
                        //     label: '复制',
                        //     click: () => {
                        //         this.onPlotMenuItemCopy(data);
                        //     },
                        // },
                        {
                            label: '剪切',
                            enabled: options.cut,
                            click: () => {
                                this.onPlotMenuItemCut(data);
                            },
                        },
                        {
                            label: '粘贴',
                            enabled: options.past,
                            click: () => {
                                this.onPlotMenuItemPast(data);
                            },
                        },
                        { type: 'separator' },

                        {
                            label: '删除',
                            enabled: options.del,
                            click: () => {
                                this.delItem(data);
                            },
                        },
                    ];
                    RightMenu.createRightMenu(template);
                },
                initCfg() {
                    Core.initCfg();
                    // Editor.Ipc.sendToMain('story-master:onPlotItemMenu', event.x, event.y, null);
                },
                onAddPlot() {},

                onBtnClick() {
                    Core.callSceneScript('getStoryPieceInfo', {}, function(
                        error,
                        data
                    ) {});
                },
                onBlurTalkWord() {},
                delItem(data) {
                    let result = Editor.Dialog.messageBox({
                        type: 'question',
                        title: '提示',
                        buttons: ['确定', '取消'],
                        message: `确定要删除${data.name}?`,
                        defaultId: 0,
                        cancelId: 1,
                        noLink: !0,
                    });
                    if (result === 0) {
                        let ret = this._findItemParentById(this.plotData, data.id);
                        if (ret) {
                            for (let i = 0; i < ret.children.length; i++) {
                                let item = ret.children[i];
                                if (item.id === data.id) {
                                    ret.children.splice(i, 1);
                                    // Editor.Ipc.sendToPanel('story-master', 'chapter-delete', this.data);
                                    this._savePlot();
                                    break;
                                }
                            }
                        }
                    }
                },

                _findItemParentById(root, id) {
                    let children = root.children;
                    if (children.length === 0) {
                        return null;
                    }
                    let ret = null;
                    for (let i = 0; i < children.length; i++) {
                        let item = children[i];
                        if (id === item.id) {
                            ret = root;
                            break;
                        }
                    }

                    if (ret) {
                        return ret;
                    } else {
                        for (let i = 0; i < children.length; i++) {
                            ret = this._findItemParentById(children[i], id);
                            if (ret) {
                                return ret;
                            }
                        }
                        return null;
                    }
                },

                _findItemByID(data, id) {
                    if (data.id === id) {
                        return [data];
                    }

                    let children = data.children;

                    if (children && children.length > 0) {
                        for (let i = 0; i < children.length; i++) {
                            let item = children[i];
                            let [ret, father, idx] = this._findItemByID(item, id);

                            if (ret) {
                                return [ret, father || data, idx || i];
                            }
                        }
                    }

                    return [null];
                },

                createNewPlot() {
                    let pieceID = Editor.Utils.UuidUtils.uuid();
                    let newPlot = {
                        id: Editor.Utils.UuidUtils.uuid(),
                        fold: true,
                        root: false,
                        name: '剧情' + (Math.random() * 100).toFixed(0),
                        children: [],
                        next: null,
                        piece: pieceID,
                    };

                    return [pieceID, newPlot];
                },

                addSiblingItem(data) {
                    let [ret, father, idx] = this._findItemByID(this.plotData, data.id);

                    if (ret && father) {
                        const [pieceID, newPlot] = this.createNewPlot();

                        father.children.splice(idx + 1, 0, newPlot);
                        father.fold = false;

                        this._savePlot();
                        this._addNewPiece(pieceID);
                    } else {
                        Editor.log('添加平级剧情失败!');
                    }
                },

                addItem(data) {
                    let [ret] = this._findItemByID(this.plotData, data.id);

                    if (ret) {
                        const [pieceID, newPlot] = this.createNewPlot();

                        ret.fold = false;
                        ret.children.push(newPlot);

                        // piece相连
                        this._savePlot();
                        let b = this._addNewPiece(pieceID);

                        if (b) {
                            // Editor.Ipc.sendToPanel("story-master.piece", 'onPieceData', pieceID);
                        }
                    }
                },

                _addNewPiece(id) {
                    let url = Editor.url(StoryMaster.GameCfg.piece.plugin);
                    if (Fs.existsSync(url)) {
                        let originData = Fs.readFileSync(url, 'utf-8');
                        originData = JSON.parse(originData);
                        if (originData[id] === undefined) {
                            originData[id] = [];
                            let data = JsonFormat(originData);
                            Fs.writeFileSync(url, data, 'utf-8');
                            Editor.assetdb.refresh(StoryMaster.GameCfg.piece.plugin);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                },
                _savePlot() {
                    let url = Editor.url(StoryMaster.GameCfg.plot.plugin);
                    if (Fs.existsSync(url)) {
                        let data = JsonFormat(this.plotData.children);
                        Fs.writeFileSync(url, data, 'utf-8');
                        Editor.assetdb.refresh(StoryMaster.GameCfg.plot.plugin);
                    }
                },
                onPlotMenuItemUp(data) {
                    let ret = this._findItemParentById(this.plotData, data.id);
                    if (ret) {
                        for (let i = 0; i < ret.children.length; i++) {
                            let item = ret.children[i];
                            if (item.id === data.id) {
                                if (i === 0) {
                                    return;
                                }
                                let delItem = ret.children.splice(i, 1);
                                ret.children.splice(i - 1, 0, delItem[0]);
                                this._savePlot();
                                break;
                            }
                        }
                    }
                },
                onPlotMenuItemDown(data) {
                    let ret = this._findItemParentById(this.plotData, data.id);
                    if (ret) {
                        for (let i = 0; i < ret.children.length; i++) {
                            let item = ret.children[i];
                            if (item.id === data.id) {
                                if (i === ret.children.length - 1) {
                                    return;
                                }
                                let delItem = ret.children.splice(i, 1);
                                ret.children.splice(i + 1, 0, delItem[0]);
                                this._savePlot();
                                break;
                            }
                        }
                    }
                },
                onPlotMenuItemCopy(data) {
                    CutPlotItem = data;
                },
                onPlotMenuItemCut(data) {
                    CutPlotItem = data;
                },
                onPlotMenuItemPast(data) {
                    if (CutPlotItem) {
                        let delItem = null;
                        let ret = this._findItemParentById(this.plotData, CutPlotItem.id);

                        // 将剪切的数据从原来的地方删除了
                        for (let i = 0; i < ret.children.length; i++) {
                            let item = ret.children[i];
                            if (item.id === CutPlotItem.id) {
                                delItem = ret.children.splice(i, 1)[0];
                                break;
                            }
                        }
                        if (delItem) {
                            let [ret2] = this._findItemByID(this.plotData, data.id);
                            ret2.fold = false;
                            ret2.children.push(delItem);
                            this._savePlot();
                        } else {
                            Editor.log('粘贴失败!');
                        }
                        CutPlotItem = null;
                    } else {
                        Editor.log('请先剪切目标!');
                    }
                },
            },
        });
    },

    messages: {
        onItemFold(event, data) {
            this.plugin._savePlot();
        },
    },
});
