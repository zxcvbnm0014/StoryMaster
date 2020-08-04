module.exports = {
    _getNextPlot (plotData) {
        let nextPlotData = StoryData.getNextPlotData(plotData.id);
        if (nextPlotData) {
            let piece = StoryData.getPieceDataByID(nextPlotData.piece);
            if (piece && piece.length > 0) {
                return piece[0];
            } else {
                // TODO 剧情的画布数量为0,寻找下个剧情
                return this._getNextPlot(nextPlotData);
            }
        } else {
            // 故事完结了
            return null;
        }
    },
    preloadNextPiece (plotData, pieceData) {
        const StoryData = require('StoryData');
        let nextPiece = null;
        let pieceItem = StoryData.getNextPieceItemByKeyAndPrefab(plotData.piece, pieceData.id);

        if (pieceItem) {
            // 找到剧情的下个piece
            nextPiece = pieceItem;
        } else {
            // 到达该剧情的尾部，寻找下个剧情
            nextPiece = this._getNextPlot(plotData);
        }

        if (nextPiece) {
            let prefabUrl = GameUtil.transformUrl(nextPiece.prefab);
            cc.loader.loadRes(prefabUrl);
        }
    },
};