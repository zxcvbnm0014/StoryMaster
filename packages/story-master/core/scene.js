const PkgPreview = {
    run: 'story-runner',
    story: 'story-story',
    unit: 'story-unit',
};
const PreviewRun = Editor.lang === 'zh' ? '作品预览' : 'App Preview';
const PreviewUnit = Editor.lang === 'zh' ? '故事测试' : 'Story Preview';
const PreviewStory = Editor.lang === 'zh' ? '故事预览' : 'Story Test';

function _addTag(uiSelect, value, text) {
    let children = uiSelect.children;

    let isAdd = false;
    for (let i = 0; i < children.length; i++) {
        let item = children[i];
        if (item.value === value) {
            isAdd = true;
            break;
        }
    }
    if (isAdd) {
        console.log('已经添加过标签了');
    } else {
        let option = document.createElement('option');
        option.text = text;
        option.value = value;
        uiSelect.append(option);
    }
}

// eslint-disable-next-line camelcase
function addTagToPlayButtonsWith$2_1_1() {
    let previewArray = document.getElementsByClassName('preview');
    if (previewArray && previewArray.length > 0) {
        let preview = previewArray[0];
        let uiSelectArray = preview.getElementsByTagName('ui-select');
        if (uiSelectArray && uiSelectArray.length) {
            let uiSelect = uiSelectArray[0];
            _addTag(uiSelect, PkgPreview.story, PreviewStory);
            _addTag(uiSelect, PkgPreview.unit, PreviewUnit);
            return true;
        }
    }
    return false;
}

function _removeTag(uiSelect, value, text) {
    let children = uiSelect.children;

    let isIn = false;
    for (let i = 0; i < children.length; i++) {
        let item = children[i];
        if (item.value === value) {
            isIn = true;
            uiSelect.removeChild(item);
            break;
        }
    }
}

// eslint-disable-next-line camelcase
function removeTagToPlayButtonsWith$2_1_1() {
    let previewArray = document.getElementsByClassName('preview');
    if (previewArray && previewArray.length > 0) {
        let preview = previewArray[0];
        let uiSelectArray = preview.getElementsByTagName('ui-select');
        if (uiSelectArray && uiSelectArray.length) {
            let uiSelect = uiSelectArray[0];
            _removeTag(uiSelect, PkgPreview.story, PreviewStory);
            _removeTag(uiSelect, PkgPreview.unit, PreviewUnit);
            return true;
        }
    }
    return false;
}

function load() {
    let playButtons = document.getElementById('playButtons');
    if (playButtons) {
    // 在cocos creator 2.1.1之前,使用的是polymer,所以拿到标签就可以访问数据
        let added = playButtons.platformList.some(x => x.value === PkgPreview.run);
        if (!added) {
            // playButtons.platformList = [].concat(playButtons.platformList, {text: PreviewRun, value: PkgPreview.run});
        }
        added = playButtons.platformList.some(x => x.value === PkgPreview.story);
        if (!added) {
            playButtons.platformList = [].concat(playButtons.platformList, {
                text: PreviewStory,
                value: PkgPreview.story,
            });
        }
        added = playButtons.platformList.some(x => x.value === PkgPreview.unit);
        if (!added) {
            playButtons.platformList = [].concat(playButtons.platformList, {
                text: PreviewUnit,
                value: PkgPreview.unit,
            });
        }
    } else {
        let b = addTagToPlayButtonsWith$2_1_1();
        if (!b) {
            Editor.warn(
                '[Story-Master]: 插件加载异常,可能是你的Creator版本过高导致[故事测试],[故事预览]快捷功能无法使用!'
            );
        }
    }
}

load();

module.exports = {
    load,
    unload: function() {
        let playButtons = document.getElementById('playButtons');
        if (playButtons) {
            // playButtons.platformList = playButtons.platformList.filter(x => x.value !== PkgPreview.run);
            playButtons.platformList = playButtons.platformList.filter(
                x => x.value !== PkgPreview.unit
            );
            playButtons.platformList = playButtons.platformList.filter(
                x => x.value !== PkgPreview.story
            );
        } else {
            removeTagToPlayButtonsWith$2_1_1();
        }
    },
    // 根据对话框模板，进行创建

    loadTalkTemplate() {
        let root = new cc.Node();
    },
    getStoryPieceInfo(data) {
        let uuid = '46c8f4ce-e961-4d5f-853e-e35f5dde4c69';
        cc.AssetLibrary.loadAsset(uuid, function(error, prefab) {
            if (error) {
                console.log(error);
            } else {
                let node = cc.instantiate(prefab);
                let script = node.getComponent('StoryPiece');
                if (script) {
                    Editor.log(script.test);
                }
            }
        });
    },
    getRootNodeUUID(event, data) {
        let scene = cc.director.getScene().getChildren();
        let prefabNode = scene[0];
        if (prefabNode) {
            event.reply && event.reply(null, prefabNode.uuid);
        }
    },
    existsScriptInRoot(event, scriptName) {
        let b = false;
        let scene = cc.director.getScene().getChildren();
        let root = scene[0];
        if (root) {
            let children = root.children;
            for (let i = 0; i < children.length; i++) {
                let node = children[i];
                let script = node.getComponent(scriptName);
                if (script) {
                    b = true;
                    break;
                }
            }
        }
        event.reply && event.reply(b);
    },
    addPrefabToCurrent(event, uuid) {
        cc.AssetLibrary.loadAsset(uuid, function(error, prefab) {
            if (error) {
                console.log(error);
                event.reply && event.reply('未加载到prefab', uuid);
            } else {
                let node = cc.instantiate(prefab);
                let scene = cc.director.getScene().getChildren();
                let prefabNode = scene[0];
                if (prefabNode) {
                    node.x = node.y = 0;
                    prefabNode.addChild(node);
                    event.reply && event.reply(null, node.uuid);
                }
            }
        });
    },
    adjustPrefabToBottom(event, uuid) {
        let node = cc.engine.getInstanceById(uuid);
        if (node) {
            let widget = node.addComponent(cc.Widget);
            widget.isAlignBottom = true;
            widget.bottom = 0;
            setTimeout(
                function() {
                    node.removeComponent(widget);
                }.bind(this),
                10
            );
            event.reply && event.reply(true, null);
        } else {
            event.reply && event.reply(false, '未找到该节点');
        }
    },
    adjustPrefabToTopIndex(event, uuid) {
        let node = cc.engine.getInstanceById(uuid);
        if (node) {
            node.zIndex = cc.macro.MAX_ZINDEX;
            event.reply && event.reply(true, null);
        } else {
            event.reply && event.reply(false, '未找到该节点');
        }
    },
};
