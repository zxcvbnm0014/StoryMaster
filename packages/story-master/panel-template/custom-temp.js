let Core = Editor.require('packages://story-master/core/core.js');
const Msg = Editor.require('packages://story-master/core/msg.js');

module.exports = function() {
    Vue.component('custom-temp', {
        props: ['data'],
        template: Core.loadFile('panel-template/custom-temp.html'),
        data() {
            return {
                isRename: false,
                prefabUUID: null,
            };
        },
        directives: {},
        created() {
            if (this.data.prefab) {
                Editor.assetdb.queryUuidByUrl(
                    this.data.prefab,
                    function(error, uuid) {
                        if (error) {
                            console.log(error);
                        } else {
                            if (uuid) {
                                this.prefabUUID = uuid;
                            } else {
                                this.prefabUUID = null;
                            }
                        }
                    }.bind(this)
                );
            }
        },
        methods: {
            onCustomTempMenu() {
                Editor.Ipc.sendToMain(
                    'story-master:onCustomTemplateMenu',
                    event.x,
                    event.y,
                    this.data
                );
            },
            onChangeName() {
                this.isRename = false;
                if (this.data.name.length === 0) {
                    this.data.name = this.preName;
                } else {
                    if (this.data.name !== this.preName) {
                        // 通知保存数据
                        Editor.Ipc.sendToPanel(
                            'story-master.template',
                            'onCustomTempRename',
                            null
                        );
                    }
                }
            },
            onFocus() {
                this.preName = this.data.name;
            },
            onDoubleClickRename() {
                this.isRename = true;
                setTimeout(
                    function() {
                        this.$els.rename.focus();
                    }.bind(this),
                    10
                );
            },
            onBtnAddPrefab() {
                if (this.prefabUUID) {
                    Core.callSceneScript('addPrefabToCurrent', this.prefabUUID, function(
                        error,
                        uuid
                    ) {
                        if (error) {
                            console.log(error);
                        } else {
                        }
                    });
                } else {
                    Editor.log('请先指定预制模版!');
                }
            },
            onBtnEditorPrefab() {
                if (this.prefabUUID) {
                    Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', this.prefabUUID);
                } else {
                    Editor.log('请先指定预制模版!');
                }
            },
            onChangePrefab() {
                Editor.assetdb.queryUrlByUuid(
                    this.prefabUUID,
                    function(error, url) {
                        if (error) {
                            console.log(error);
                        } else {
                            if (url) {
                                this.data.prefab = url;
                                Editor.Ipc.sendToPanel(
                                    'story-master.template',
                                    'onCustomTempRename',
                                    null
                                );
                                // Editor.Ipc.sendToPanel('story-master.template', 'isExistsSamePrefab', this.data, function (result, data) {
                                //     if (result) {
                                //         let result = Editor.Dialog.messageBox(
                                //             {
                                //                 type: "question",
                                //                 title: "提示",
                                //                 buttons: ['确定', '取消'],
                                //                 message: `模版[${data.name}]已经指向了该Prefab,是否使用该Prefab?`,
                                //                 defaultId: 0,
                                //                 cancelId: 1,
                                //                 noLink: !0,
                                //             }
                                //         );
                                //         if (result === 0) {
                                //             this.data.prefab = url;
                                //             Editor.Ipc.sendToPanel('story-master.template', 'onCustomTempRename', null);
                                //         }
                                //     }
                                // }.bind(this));
                            }
                        }
                    }.bind(this)
                );
            },
        },
    });
};
