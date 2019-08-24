let StoryConfig = {
    file: {
        init: {data: [], name: "init"},
        piece: {data: [], name: "piece"},
        plot: {data: [], name: "plot"},
    },
    _init: false,
    _completeCallBack: null,

    init(cb) {
        if (this._init === false) {
            this._init = true;
            this._completeCallBack = cb;
            this._index = 0;
            this._totalIndex = 0;
            for (let i in this.file) {
                this._totalIndex++;
            }
            for (let k in this.file) {
                let item = this.file[k];
                this._loadJson(item['name'], item);
            }
        } else {
            console.log("[StoryConfig] has init");
            cb && cb();
        }
    },
    _loadJson(file, data) {
        // let url = cc.url.raw("resources/cfg/" + file + ".json");
        let url = "" + file;
        cc.loader.loadRes(url,
            function (curCount, totalCount, itemObj) {
            },
            function (err, results) {
                this._index++;
                if (err) {
                    console.log("解析配置文件" + file + "失败: " + err);
                } else {
                    if (results) {
                        // 在2.0中,返回的数据对象有变化
                        data['data'] = results.json || results;
                        console.log("---------------------------");
                        console.log(JSON.stringify(results.json));
                        console.log("---------------------------");
                        this._onProgress(file);
                        if (this._index >= this._totalIndex) {// 加载完成
                            this._onComplete();
                        }
                    } else {
                        this._onError(file);
                    }
                }
            }.bind(this));
    },
    _onProgress(file) {
        console.log("Json loaded: " + file);
    },
    _onComplete() {
        console.log("Json 加载完成");
        if (this._completeCallBack) {
            this._completeCallBack();
        }
    },
    _onError(file) {
        console.log("Json error: " + file);
    },
};
cc.StoryConfig = module.exports = StoryConfig;
