let StoryConfig = require('StoryConfig');
module.exports = {
    serializePlotArray: [],
    getUnitPiecePrefab() {
        let initData = StoryConfig.file.init.data;
        if (initData.unit) {
            let pieces = StoryConfig.file.piece.data;
            for (let key in pieces) {
                let item = pieces[key];
                for (let i = 0; i < item.length; i++) {
                    let piece = item[i];
                    if (piece.id === initData.unit) {
                        return { piece: key, item: piece };
                    }
                }
            }
            return null;
        } else {
            return null;
        }
    },
    getBeganPrefab() {
        let piece = this.serializePlotArray[0].piece;
        let data = this.getPieceDataByID(piece);
        return data[0];
    },
    getBeganPlot() {
        return this.serializePlotArray[0];
    },
    // 返回的plot是经过处理的
    getNextPlotData(plotID) {
        for (let i = 0; i < this.serializePlotArray.length; i++) {
            let item = this.serializePlotArray[i];
            if (item.id === plotID) {
                if (i === this.serializePlotArray.length - 1) {
                    return null;
                } else {
                    return this._findValidPiece(i + 1);
                }
            }
        }
        return null;
    },
    _findValidPiece(index) {
        for (let i = index; i < this.serializePlotArray.length; i++) {
            let item = this.serializePlotArray[i];
            let pieceData = this.getPieceDataByID(item.piece);
            if (pieceData && pieceData.length > 0) {
                return item;
            } else {
                console.log(`出现空白剧情:${item.name}`);
            }
        }
        return null;
    },
    serializePlot() {
        // 将所有的pieces按照顺序放在一个array里面
        let array = [];
        let root = StoryConfig.file.plot.data;
        for (let i = 0; i < root.length; i++) {
            let item = root[i];
            this._serializePlot(item, array);
        }
        this.serializePlotArray = array;
    },
    _serializePlot(data, array) {
        if (data.type === cc.StoryMaster.Type.Plot.Piece) {
            array.push({ id: data.id, name: data.name, piece: data.piece });
        } else {
            cc.log(`过滤章节数据：${JSON.stringify(data)}`);
        }
        for (let i = 0; i < data.children.length; i++) {
            this._serializePlot(data.children[i], array);
        }
    },

    getPlotDataByPieceID(pieceID) {
        for (let i = 0; i < this.serializePlotArray.length; i++) {
            let item = this.serializePlotArray[i];
            if (item.piece === pieceID) {
                return item;
            }
        }
        return null;
    },
    getPlotDataByID(id) {
        for (let i = 0; i < this.serializePlotArray.length; i++) {
            let item = this.serializePlotArray[i];
            if (item.id === id) {
                return item;
            }
        }
        return null;
    },
    getPieceDataByPlotID(plotID) {
        let plotData = this.getPlotDataByID(plotID);
        if (plotData) {
            let pieceData = this.getPieceDataByID(plotData.piece);
            return pieceData;
        }
        return null;
    },
    getPieceDataByID(pieceID) {
        let pieces = StoryConfig.file.piece.data;
        for (let key in pieces) {
            let item = pieces[key];
            if (key === pieceID) {
                return item;
            }
        }
        return null;
    },
    getNextPieceItemByPrefabID(prefabID) {
        let pieces = StoryConfig.file.piece.data;
        for (let key in pieces) {
            let item = pieces[key];
            for (let i = 0; i < item.length; i++) {
                let piece = item[i];
                if (piece.id === prefabID) {
                    if (i + 1 >= item.length) {
                        // 当前pieces尾部
                        return null;
                    } else {
                        return item[i + 1];
                    }
                }
            }
        }
        return null;
    },
    getNextPieceItemByKeyAndPrefab(pieceKey, prefab) {
        let pieces = StoryConfig.file.piece.data;

        if (pieces && pieces[pieceKey]) {
            let array = pieces[pieceKey];
            for (let i = 0; i < array.length; i++) {
                let item = array[i];
                if (item.id === prefab) {
                    if (i + 1 >= array.length) {
                        return null;
                    } else {
                        return array[i + 1];
                    }
                }
            }
        }
    },
};
