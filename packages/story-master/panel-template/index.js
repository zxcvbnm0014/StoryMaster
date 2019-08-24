let Fs = require("fire-fs");
let Core = Editor.require("packages://story-master/core/core.js");
let StoryMaster = Editor.require("packages://story-master/code/StoryMaster.js");
Editor.require("packages://story-master/panel-template/custom-temp.js")();

Editor.Panel.extend({
    style: "",
    template: Core.loadFile('panel-template/index.html'),

    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                (async () => {
                    console.log("created");
                    // 先读取profile里面的配置
                    Editor.Profile.load(StoryMaster.GameCfg.profile, function (error, profile) {
                        if (error) {
                            console.log(error);
                        } else {
                            let template = Core.getTemplate();
                            this.profile = profile;
                            this.customTemp = profile.data.customTemp || [];
                            this.templateTalkPrefab = profile.data.templateTalkPrefab || template.StoryTalk;
                            Editor.assetdb.queryUuidByUrl(this.templateTalkPrefab, function (error, uuid) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    if (uuid) {
                                        this.templateTalkPrefabUUID = uuid;
                                    } else {
                                        this.templateTalkPrefabUUID = null;
                                    }
                                }
                            }.bind(this));

                            this.templateOptionPrefab = profile.data.templateOptionPrefab || template.StoryOptions;
                            Editor.assetdb.queryUuidByUrl(this.templateOptionPrefab, function (error, uuid) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    if (uuid) {
                                        this.templateOptionPrefabUUID = uuid;
                                    } else {
                                        this.templateOptionPrefabUUID = null;
                                    }
                                }
                            }.bind(this));
                        }
                    }.bind(this));

                })();


            },
            data: {
                profile: null,
                templateTalkPrefab: null,
                templateTalkPrefabUUID: null,
                templateOptionPrefab: null,
                templateOptionPrefabUUID: null,

                customTemp: [
                    // {
                    //     name: "11",
                    //     prefab: "db://assets/code/template/StoryPiece.prefab",
                    // },
                ],
            },
            methods: {
                onChangePrefabTalk() {
                    Editor.assetdb.queryUrlByUuid(this.templateTalkPrefabUUID, function (error, url) {
                        if (error) {
                            console.log(error);
                        } else {
                            this.templateTalkPrefab = url;
                            this._saveProfile();
                        }
                    }.bind(this));
                },
                onChangePrefabOption() {
                    Editor.assetdb.queryUrlByUuid(this.templateOptionPrefabUUID, function (error, url) {
                        if (error) {
                            console.log(error);
                        } else {
                            this.templateOptionPrefab = url;
                            this._saveProfile();
                        }
                    }.bind(this));
                },
                onBtnClickAddCustomTemplate() {
                    this.customTemp.push({name: "模版名字", prefab: ""});
                    this._saveProfile();
                },
                setDefaultCfg() {
                    let template = Core.getTemplate();
                    let fullUrl1 = Editor.url(template.StoryTalk);
                    if (Fs.existsSync(fullUrl1)) {
                        let ret = await
                        Core.queryUuidByUrl(template.StoryTalk);
                        this.templateTalkPrefab = ret;
                    } else {
                        this.templateTalkPrefab = null;
                    }


                    let fullUrl2 = Editor.url(template.StoryOptions);
                    if (Fs.existsSync(fullUrl2)) {
                        let ret = await
                        Core.queryUuidByUrl(template.StoryOptions);
                        this.templateOptionPrefab = ret;
                    } else {
                        this.templateOptionPrefab = null;
                    }
                },
                onBtnClickAddTalkPrefab() {
                    let prefabUUID = this.templateTalkPrefabUUID;
                    let scriptName = "StoryTalk";
                    if (prefabUUID) {
                        // 最终选择的了这种方式
                        Core.callSceneScript("existsScriptInRoot", scriptName, function (ret) {
                            if (ret) {
                                Editor.Dialog.messageBox({
                                    type: "warning",
                                    title: "提示",
                                    buttons: ['确定'],
                                    message: `发现场景中存在${scriptName}组件\n不能重复添加!`,
                                    defaultId: 0,
                                    cancelId: 1,
                                    noLink: !0,
                                });
                            } else {
                                Core.callSceneScript("addPrefabToCurrent", prefabUUID, function (error, uuid) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        Core.callSceneScript("adjustPrefabToBottom", uuid);
                                    }
                                })
                            }
                        })


                        // let uuid = Editor.assetdb.remote.urlToUuid();
                        // Core.callSceneScript("getRootNodeUUID", null, function (root) {
                        //     Editor.Ipc.sendToPanel('scene', 'scene:create-nodes-by-uuids', [this.templateTalkPrefab], root);
                        // }.bind(this));
                    } else {
                        Editor.Dialog.messageBox({
                            type: "error", title: "错误", buttons: ['确定'], message: `请指定模版!`,
                        });
                    }
                },
                onBtnClickAddOptionPrefab() {
                    let prefabUUID = this.templateOptionPrefabUUID;
                    let scriptName = "StoryOptionBox";
                    if (prefabUUID) {
                        Core.callSceneScript("existsScriptInRoot", scriptName, function (ret) {
                            if (ret) {
                                Editor.Dialog.messageBox({
                                    type: "warning",
                                    title: "提示",
                                    buttons: ['确定'],
                                    message: `发现场景中存在${scriptName}组件\n不能重复添加!`,
                                    defaultId: 0,
                                    cancelId: 1,
                                    noLink: !0,
                                });
                            } else {
                                Core.callSceneScript("addPrefabToCurrent", prefabUUID, function (error, uuid) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        Core.callSceneScript("adjustPrefabToTopIndex", uuid);
                                    }
                                })
                            }
                        })
                    } else {
                        Editor.Dialog.messageBox({
                            type: "error", title: "错误", buttons: ['确定'], message: `请指定模版!`,
                        });
                    }
                },
                onBtnClickEditorTalkPrefab() {
                    if (this.templateTalkPrefab) {
                        Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', this.templateTalkPrefabUUID);
                    }
                },
                onBtnClickEditorOptionPrefab() {
                    if (this.templateOptionPrefab) {
                        Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', this.templateOptionPrefabUUID);
                    }
                },
                _saveProfile() {
                    if (this.profile) {
                        this.profile.data.customTemp = this.customTemp;
                        this.profile.data.templateTalkPrefab = this.templateTalkPrefab;
                        this.profile.data.templateOptionPrefab = this.templateOptionPrefab;

                        this.profile.save();
                    }
                },
                onCustomTempRename(data) {
                    this._saveProfile();
                },
                onCustomTemplateMenu(data) {
                    for (i = 0; i < this.customTemp.length; i++) {
                        let item = this.customTemp[i];
                        if (item.name === data.name && item.prefab === data.prefab) {

                            let result = Editor.Dialog.messageBox(
                                {
                                    type: "question",
                                    title: "提示",
                                    buttons: ['确定', '取消'],
                                    message: `确定要删除配置: ${data.name}?\n注意:此操作并不会删除相应的Prefab!`,
                                    defaultId: 0,
                                    cancelId: 1,
                                    noLink: !0,
                                }
                            );
                            if (result === 0) {
                                this.customTemp.splice(i, 1);
                                this._saveProfile();
                            }
                            break;
                        }
                    }
                },
            },

        })
    },

    messages: {
        onCustomTempRename(event, data) {
            this.plugin.onCustomTempRename(data);
        },
        onCustomTemplateMenu(event, data) {
            this.plugin.onCustomTemplateMenu(data);
        },
        isExistsSamePrefab(event, data) {
            let allCfg = this.plugin.customTemp;
            for (let i = 0; i < allCfg.length; i++) {
                let item = allCfg[i];
                if (item.prefab === data.prefab) {
                    event.reply && event.reply(true, item);
                    return;
                }
            }
            event.reply && event.reply(false, null);

        },
    }
});
