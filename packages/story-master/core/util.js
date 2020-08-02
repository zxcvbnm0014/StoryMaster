let StoryMaster = Editor.require('packages://story-master/code/StoryMaster.js');
let Fs = require('fire-fs');
let Path = require('fire-path');

module.exports = {
    calcNextIndex(array) {
    // 过滤出数组中的所有数字,并转化为数字
        array = array.map(function(item) {
            let num = item.toString().replace(/[^0-9]/gi, '');
            return parseInt(num);
        });
        // 过滤重复值
        array = array.filter(function(item, index, self) {
            return self.indexOf(item) === index;
        });
        // 排序
        array.sort(function(a, b) {
            return a - b;
        });
        // 去掉为0的开头
        let began = array[0];
        if (began !== undefined && began === 0) {
            array.splice(0, 1);
        }

        // 找出空缺的值
        let ret = 1;
        for (let index = 0; index < array.length; ) {
            if (array[index] !== ret) {
                break;
            } else {
                ret++;
                index++;
            }
        }
        // 将返回值补充为2位
        return ret;
    },
    serializePlot(root) {
        let array = [];
        for (let i = 0; i < root.length; i++) {
            let item = root[i];
            this._serializePlot(item, array);
        }
        return array;
    },
    _serializePlot(data, array) {
        array.push({ id: data.id, name: data.name, piece: data.piece });
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
};
