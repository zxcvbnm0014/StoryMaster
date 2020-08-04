const StoryData = require('StoryData');
const GameUtil = require('GameUtil');
module.exports = {
    _getNextPlot (plotData) {
        let nextPlotData = StoryData.getNextPlotData(plotData.id);
        if (nextPlotData) {
            let piece = StoryData.getPieceDataByID(nextPlotData.piece);
            if (piece && piece.length > 0) {
                return { next: piece[0], piece: piece, plot: nextPlotData };
            } else {
                // TODO 剧情的画布数量为0,寻找下个剧情
                return this._getNextPlot(nextPlotData);
            }
        } else {
            // 故事完结了
            return null;
        }
    },
    getNextPiece (plotData, pieceData) {
        // let pieceItem = StoryData.getNextPieceItemByPrefabID(pieceData.id);
        let pieceItem = StoryData.getNextPieceItemByKeyAndPrefab(plotData.piece, pieceData.id);
        if (pieceItem) {
            // 找到剧情的下个piece
            return { next: pieceItem, piece: pieceData, plot: plotData };
        } else {
            // 到达该剧情的尾部，如果没有跳转，寻找下个剧情
            // TODO 对跳转类型的判断
            return this._getNextPlot(plotData);
        }
    },
    preloadNextPiece (plotData, pieceData) {
        let nextPieceInfo = this.getNextPiece(plotData, pieceData);
        if (nextPieceInfo) {
            let nextPiece = nextPieceInfo.next.prefab;
            let prefabUrl = GameUtil.transformUrl(nextPiece);
            cc.loader.loadRes(prefabUrl);
        }
    },
};