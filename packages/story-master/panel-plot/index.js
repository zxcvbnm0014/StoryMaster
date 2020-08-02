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
                    data = this._updatePlotData(JSON.parse(data));
                    this.plotData.children = data;
                }
                this.$root.$on(PlotMsg.OnPlotItemRightMenu, this.OnPlotItemRightMenu);
                this.$root.$on(PlotMsg.OnDragPlotItem, this._onDragPlotItem);
            },
            data: {
                plotData: {
                    id: Editor.Utils.UuidUtils.uuid(),
                    root: true,
                    fold: false,
                    type: 'root',
                    name: '我的剧情',
                    children: [],
                },
            },
            methods: {
                // 是否为父子关系
                _isFatherSonRelationship(parent, son) {
                    let data = this._findItemByID(this.plotData, parent);
                    if (data) {
                        let ret = false;

                        function adjust(item) {
                            for (let i = 0; i < item.children.length; i++) {
                                let value = item.children[i];
                                if (value.id === son) {
                                    ret = true;
                                    return true;
                                } else {
                                    if (adjust(value)) {
                                        break;
                                    }
                                }
                            }
                        }

                        adjust(data);
                        return ret;
                    }
                    return false;
                },
                _onDragPlotItem(data) {
                    let { type, from, to } = data;
                    if (this._isFatherSonRelationship(from, to)) {
                        console.error('不允许从父节点，拖拽到子节点');
                        return;
                    }

                    // 不能拖拽的根节点的前后
                    if (
                        type === PlotMsg.PlaceType.Before ||
            type === PlotMsg.PlaceType.After
                    ) {
                        let toData = this._findItemByID(this.plotData, to);
                        if (toData.type === 'root') {
                            console.log('不能调整到根节点的前后');
                            return;
                        }
                    }

                    if (
                        type === PlotMsg.PlaceType.After ||
            type === PlotMsg.PlaceType.Before
                    ) {
                        this._insertTo(from, to, type);
                    } else if (type === PlotMsg.PlaceType.In) {
                        let parent = this._findItemParentById(this.plotData, from);
                        let delItem = this._spliceItemFromParent(parent, from);

                        let targetData = this._findItemByID(this.plotData, to);
                        if (targetData && delItem) {
                            targetData.children.push(delItem);
                        } else {
                            console.error('失败');
                        }
                    }
                },
                _getCfgData() {
                    let url = Editor.url(StoryMaster.GameCfg.plot.plugin);
                    if (Fs.existsSync(url)) {
                        return Fs.readFileSync(url, 'utf-8');
                    }
                    return null;
                },
                _setCfgData(data) {
                    let url = Editor.url(StoryMaster.GameCfg.plot.plugin);
                    if (Fs.existsSync(url)) {
                        Fs.writeFileSync(url, JsonFormat(data), 'utf-8');
                        Editor.assetdb.refresh(StoryMaster.GameCfg.plot.plugin);
                    }
                },
                _updatePlotData(rootData) {
                    let bChange = false;

                    function _deepUpdateItem(data) {
                        for (let i = 0; i < data.length; i++) {
                            let item = data[i];
                            if (item.type === undefined) {
                                item.type = cc.StoryMaster.Type.Plot.Piece;
                                bChange = true;
                            }
                            if (item.children && item.children.length > 0) {
                                _deepUpdateItem(item.children);
                            }
                        }
                    }

                    _deepUpdateItem(rootData);

                    if (bChange) {
                        this._setCfgData(rootData);
                    }
                    return rootData;
                },
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
                            label: '添加章节',
                            click: () => {
                                this.addItem(data, cc.StoryMaster.Type.Plot.Chapter);
                            },
                        },
                        {
                            label: '添加剧情',
                            click: () => {
                                this.addItem(data, cc.StoryMaster.Type.Plot.Piece);
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

                _insertTo(fromID, toID, type) {
                    let bSucceed = false;
                    let parentData = this._findItemParentById(this.plotData, fromID);
                    let delItem = this._spliceItemFromParent(parentData, fromID);
                    let targetParentData = this._findItemParentById(this.plotData, toID);
                    if (delItem && targetParentData) {
                        for (let i = 0; i < targetParentData.children.length; i++) {
                            let item = targetParentData.children[i];
                            if (item.id === toID) {
                                if (type === PlotMsg.PlaceType.After) {
                                    bSucceed = true;
                                    targetParentData.children.splice(i + 1, 0, delItem);
                                } else if (type === PlotMsg.PlaceType.Before) {
                                    bSucceed = true;
                                    targetParentData.children.splice(i, 0, delItem);
                                }
                                break;
                            }
                        }
                    }
                    if (!bSucceed) {
                        console.error('调整失败');
                    }
                },

                _spliceItemFromParent(parent, id) {
                    let delItem = null;
                    for (let i = 0; i < parent.children.length; i++) {
                        let item = parent.children[i];
                        if (item.id === id) {
                            delItem = parent.children.splice(i, 1)[0];
                            break;
                        }
                    }
                    return delItem;
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
                        return data;
                    }
                    let children = data.children;
                    if (children && children.length > 0) {
                        for (let i = 0; i < children.length; i++) {
                            let item = children[i];
                            let ret = this._findItemByID(item, id);
                            if (ret) {
                                return ret;
                            }
                        }
                    }
                    return null;
                },

                createNewPlot(type) {
                    let pieceID = Editor.Utils.UuidUtils.uuid();
                    let name = '';
                    if (cc.StoryMaster.Type.Plot.Piece === type) {
                        name = '剧情';
                    } else if (cc.StoryMaster.Type.Plot.Chapter === type) {
                        name = '章节';
                    }
                    return {
                        id: Editor.Utils.UuidUtils.uuid(),
                        type: type || cc.StoryMaster.Type.Plot.Piece,
                        fold: true,
                        root: false,
                        name: name + (Math.random() * 100).toFixed(0),
                        children: [],
                        next: null,
                        piece: pieceID,
                    };
                },

                addItem(data, type) {
                    let ret = this._findItemByID(this.plotData, data.id);
                    if (ret) {
                        const newPlot = this.createNewPlot(type);
                        ret.fold = false;
                        ret.children.push(newPlot);

                        this._savePlot();
                        let b = this._addNewPiece(newPlot.piece);
                        if (b) {
                            Editor.Ipc.sendToPanel(
                                'story-master.piece',
                                'onPieceData',
                                pieceID
                            );
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
                    this._setCfgData(this.plotData.children);
                },
                onPlotMenuItemCopy(data) {
                    CutPlotItem = data;
                },
                onPlotMenuItemCut(data) {
                    CutPlotItem = data;
                },
                onPlotMenuItemPast(data) {
                    if (CutPlotItem) {
                        let ret = this._findItemParentById(this.plotData, CutPlotItem.id);
                        // todo 验证下 将剪切的数据从原来的地方删除了
                        let delItem = this._spliceItemFromParent(ret, CutPlotItem.id);
                        if (delItem) {
                            let ret2 = this._findItemByID(this.plotData, data.id);
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
