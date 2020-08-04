let GameUtil = require('GameUtil');
let StoryData = require('StoryData');
let StoryAudioMgr = require('StoryAudioMgr');


cc.Class({
    extends: require('Observer'),

    properties: {
        storyNode: { default: null, displayName: '故事节点', type: cc.Node },
        touchNode: { default: null, displayName: '触摸节点', type: cc.Node },
        touchEffect: { default: null, displayName: '点击特效', type: cc.Prefab },
        isTest: false,

        _piece: null, // 当前正在播放的页面{}
        _pieceData: null, // 当前所有的页面[]
        _plotData: null, // 当前所在的剧情[]
        _clickeffect: null,
    },

    _getMsgList () {
        return [
            cc.StoryMaster.Msg.OnGoNextPiece,
            cc.StoryMaster.Msg.OnJumpNewPlot,
            cc.StoryMaster.Msg.OnEnableGlobalTouch,
        ];
    },

    _onMsg (msg, data) {
        if (msg === cc.StoryMaster.Msg.OnGoNextPiece) {
            // 进行下一个故事片段
            let prefabID = data.id;
            // let pieceItem = StoryData.getNextPieceItemByPrefabID(prefabID);
            // 这种方式计算量会小一点
            let pieceItem = StoryData.getNextPieceItemByKeyAndPrefab(this._plotData.piece, prefabID);

            if (pieceItem) {
                this.createPiece(pieceItem);
            } else {
                // 当前的剧情已经播放完毕,如果没有跳转,寻找下个有效的剧情
                let plotData = StoryData.getNextPlotData(this._plotData.id);
                if (plotData) {
                    this._plotData = plotData;
                    let piece = StoryData.getPieceDataByID(plotData.piece);
                    if (piece) {
                        this._pieceData = piece;
                        this.createPiece(piece[0]);
                    }
                } else {
                    this._plotData = null;
                    this._pieceData = null;
                    this._piece = null;
                    // 故事完结
                    // this._onPieceTips("故事结束");
                    StoryAudioMgr.stopAll();
                    this.touchNode.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
                }
            }
        } else if (msg === cc.StoryMaster.Msg.OnJumpNewPlot) {
            this._jumpToSelectedPlot(data);
            // let plotID = data;
            // let plotData = StoryData.getPlotDataByID(plotID);
            // if (plotData) {
            //     this._plotData = plotData;
            //     let piece = StoryData.getPieceDataByID(plotData.piece);
            //     if (piece) {
            //         this._pieceData = piece;
            //         this.createPiece(piece[0]);
            //     }
            // }
        } else if (msg === cc.StoryMaster.Msg.OnEnableGlobalTouch) {
            this.touchNode.active = !!data;
        }
    },

    _jumpToSelectedPlot (data) {
        if (data.extra) {
            let extra = data.extra;
            let node = cc.instantiate(extra.effect);

            node.parent = this.touchNode;
            node.position = extra.position;
        }

        this._playNewPlot(data.jumpData);
    },

    _onTouchEnd (ev) {
        if (this.touchEffect) {
            let node = cc.instantiate(this.touchEffect);

            node.parent = this.touchNode;
            node.position = node.convertToNodeSpace(ev.getLocation());

            if (this._clickeffect) {
                this._clickeffect.destroy();
            }

            this._clickeffect = node;
        }

        cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.UserTouch, null);
    },

    _initTouch () {
        let size = cc.view.getVisibleSize();
        this.touchNode.width = size.width;
        this.touchNode.height = size.height;
        this.touchNode.active = true;
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    onLoad () {
        cc.debug.setDisplayStats(false);
        cc.StoryConfig.init(function () {
            this._initMsg();
            this.storyNode.destroyAllChildren();
            this.touchNode.destroyAllChildren();
            this._initTouch();
            StoryData.serializePlot();
            if (this.isTest) {
                this.startWithDebug();
            } else {
                this.startWithNormal();
            }
        }.bind(this));
    },

    _onPieceTips (tips) {
        this.storyNode.destroyAllChildren();
        let node = new cc.Node();
        let label = node.addComponent(cc.Label);
        label.string = tips;
        this.storyNode.addChild(node);
        this.touchNode.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    startWithDebug () {
        let cfg = StoryData.getUnitPiecePrefab();
        if (cfg) {
            let plotData = StoryData.getPlotDataByPieceID(cfg.piece);
            if (plotData) {
                this._plotData = plotData;
                let piece = StoryData.getPieceDataByID(cfg.piece);
                if (piece) {
                    this._pieceData = piece;
                    this.createPiece(cfg.item);
                }
            }
        } else {
            this._onPieceTips('未发现要测试的故事');
        }
    },

    startWithNormal () {
        let plot = StoryData.getBeganPlot();
        this._playNewPlot(plot.id);
    },

    _playNextPiece () {

    },

    _playNewPlot (plotID) {
        let plotData = StoryData.getPlotDataByID(plotID);
        if (plotData) {
            this._plotData = plotData;
            let pieceData = StoryData.getPieceDataByID(plotData.piece);

            if (pieceData) {
                if (pieceData.length > 0) {
                    this._pieceData = pieceData;
                    this.createPiece(pieceData[0]);
                } else {
                    console.warn('当前剧情没有画布，自动跳转到下个剧情', plotData);
                    let data = StoryData.getNextPlotData(plotID);

                    if (data) {
                        this._playNewPlot(data.id);
                    } else {
                        cc.error('没有找到可以播放的剧情，游戏结束');
                    }
                }
            } else {
                console.log(`无效的piece: ${plotData.piece}`);
            }
        } else {
            console.log(`无效的plotID: ${plotID}`);
        }
    },

    createPiece (pieceData) {
        if (pieceData && pieceData.type === cc.StoryMaster.Type.Pieces.Content ||
            pieceData.type === undefined// 这个判断是为了兼容老数据
        ) {
            let prefabUrl = pieceData.prefab;
            if (prefabUrl) {
                cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnEnableGlobalTouch, false);
                prefabUrl = GameUtil.transformUrl(prefabUrl);
                let ret = cc.loader.getRes(prefabUrl);
                if (ret) {

                }
                cc.loader.loadRes(prefabUrl, (error, prefab) => {
                    if (error) {
                        console.log(error);
                    } else {
                        cc.ObserverMgr.dispatchMsg(cc.StoryMaster.Msg.OnEnableGlobalTouch, true);
                        StoryAudioMgr.cleanAudioEffect();
                        this.storyNode.destroyAllChildren();
                        let node = cc.instantiate(prefab);
                        let size = cc.view.getVisibleSize();
                        node.x = node.y = 0;
                        node.width = size.width;
                        node.height = size.height;
                        this.storyNode.addChild(node);

                        let script = node.getComponent('StoryPiece');
                        if (script) {
                            script.pieceItem = pieceData;
                        }
                    }
                });
            } else {
                console.log('piece 数据无效');
            }
        } else if (pieceData && pieceData.type === cc.StoryMaster.Type.Pieces.PlotJump) {
            // todo 判断jump的有效性
            let pieces = StoryData.getPieceDataByPlotID(pieceData.jump);
            if (pieces && pieces.length > 0) {
                this._playNewPlot(pieceData.jump);
            } else {
                console.log(`无效的piece-jump:${pieceData.name}\njumpID:${pieceData.jump}`);
                // 无效的jump不会被打断,会继续执行接下来的逻辑
            }
        } else {
            console.log('未知的piece');
        }
    },
    start () {

    },

    // update (dt) {},
});

