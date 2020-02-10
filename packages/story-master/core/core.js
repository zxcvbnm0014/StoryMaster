const Fs = require('fire-fs');
const Path = require('fire-path');
const PackageName = 'story-master';
const StoryMaster = Editor.require(
    `packages://${PackageName}/code/StoryMaster.js`
);
module.exports = {
    packageName: PackageName,
    loadFile(file) {
        let url = Editor.url(`packages://${PackageName}/${file}`);
        if (url) {
            if (Fs.existsSync(url)) {
                return Fs.readFileSync(url, 'utf-8');
            }
        } else {
            console.error(`文件名无效:${file}`);
            return '';
        }
    },

    callSceneScript(func, data, cb) {
        Editor.Scene.callSceneScript(PackageName, func, data, cb);
    },
    replaceSpecialChar(str) {
        str = str.toString();
        str = str.replace(/"/g, '“');
        str = str.replace(/'/g, '“');
        str = str.replace(/\r/g, '');
        str = str.replace(/\n/g, '');
        return str;
    },

    _getAssetsDB() {
        if (Editor.isMainProcess) {
            return Editor.assetdb;
        } else {
            return Editor.remote.assetdb;
        }
    },
    async makeDirs(dir) {
        let assetdb = this._getAssetsDB();
        if (assetdb.exists(dir)) {
            return true;
        } else {
            let b = await this.makeDirs(Path.dirname(dir));
            if (b) {
                await this.makeDir(dir);
            }
        }
        return true;
    },
    async makeDir(url) {
        let assetdb = this._getAssetsDB();
        return await new Promise(function(resolve, reject) {
            if (!assetdb.exists(url)) {
                assetdb.create(url, null, function(error, info) {
                    if (error) {
                        reject(error);
                        return false;
                    } else {
                        resolve(info);
                        console.log('创建目录成功: ' + url);
                        return true;
                    }
                });
            } else {
                resolve(null);
            }
        });
    },
    async writeFile(url, data) {
        let assetdb = this._getAssetsDB();
        let dir = Path.dirname(url);
        await this.makeDirs(dir);
        return new Promise(function(resolve, reject) {
            assetdb.create(url, data, function(error, info) {
                if (error) {
                    reject(error);
                    return false;
                } else {
                    resolve(info);
                    return info;
                }
            });
        });
    },
    async queryUuidByUrl(url) {
        return new Promise(function(resolve, reject) {
            Editor.assetdb.queryUuidByUrl(url, function(error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    },
    getTemplate() {
        let url = Editor.url(`packages://${PackageName}/package.json`);
        if (Fs.existsSync(url)) {
            let data = Fs.readFileSync(url, 'utf-8');
            data = JSON.parse(data);
            if (data.public) {
                return StoryMaster.GameCfg.template.public;
            }
        }
        return StoryMaster.GameCfg.template.dev;
    },
    setDefaultLayout() {
        let EditorWin = null;
        if (Editor.isMainProcess) {
            EditorWin = Editor.Window;
        } else {
            EditorWin = Editor.remote.Window;
        }
        if (EditorWin) {
            Editor.Ipc.sendToPanel(
                'story-master.piece',
                'forceSetOpenedPrefabID',
                null
            );
            EditorWin.main.resetLayout(`packages://${PackageName}/core/layout.json`);
        }
    },
    initCfg() {
        let assetdb = this._getAssetsDB();
        (async () => {
            // 创建配置文件
            let cfgFiles = [
                { url: StoryMaster.GameCfg.plot.plugin, init: '[]' },
                { url: StoryMaster.GameCfg.piece.plugin, init: '{}' },
                { url: StoryMaster.GameCfg.init.plugin, init: '{}' },
            ];
            for (let i = 0; i < cfgFiles.length; i++) {
                let item = cfgFiles[i];
                let b = assetdb.exists(item.url);
                if (!b) {
                    await this.writeFile(item.url, item.init);
                }
            }
            // 创建目录
            await this.makeDirs(StoryMaster.GameCfg.piece.prefab);
            await this.makeDirs(StoryMaster.GameCfg.myResDir);
            await this.makeDirs(StoryMaster.GameCfg.myTemplateDir);

            // 将模版拷贝到目录下
            await this.makeDirs(StoryMaster.GameCfg.templateDir);

            let tempDir = StoryMaster.GameCfg.templateDir;
            let temp = this.getTemplate();

            let array = [
                // TODO piece模版待定,问题是如何自定义添加
                // temp.StoryPiece,
                temp.StoryTalk,
                temp.StoryOptions,
            ];
            for (let i = 0; i < array.length; i++) {
                let item = array[i];
                let fullPath = Editor.url(item);
                if (Fs.existsSync(fullPath)) {
                    let fileName = Path.basename(fullPath);
                    let destUrl = `${tempDir}/${fileName}`;
                    if (Fs.existsSync(Editor.url(destUrl))) {
                        console.log(`模版已经拷贝: ${destUrl}`);
                    } else {
                        let itemData = Fs.readFileSync(fullPath, 'utf-8');
                        await this.writeFile(destUrl, itemData);
                    }
                } else {
                    Editor.error(`模版丢失: ${item}`);
                }
            }
            this.setDefaultLayout();
        })();
    },
};
