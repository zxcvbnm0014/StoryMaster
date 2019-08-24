let StoryMaster = Editor.require("packages://story-master/code/StoryMaster.js");
let Fs = require("fire-fs");
let Path = require("fire-path");

module.exports = {
    serializePlot(root) {
        let array = [];
        for (let i = 0; i < root.length; i++) {
            let item = root[i];
            this._serializePlot(item, array);
        }
        return array;
    },
    _serializePlot(data, array) {
        array.push({id: data.id, name: data.name, piece: data.piece});
        for (let i = 0; i < data.children.length; i++) {
            this._serializePlot(data.children[i], array);
        }
    },
    // 取出plot的数据
    getPlotData() {
        let url = Editor.url(StoryMaster.GameCfg.plot.plugin);
        if (Fs.existsSync(url)) {
            let data = Fs.readFileSync(url, 'utf-8');
            data = JSON.parse(data);
            return this.serializePlot(data);
        }
    },


}
