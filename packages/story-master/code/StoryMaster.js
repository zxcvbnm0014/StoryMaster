let StoryMaster = {
    Msg: {
        OnJumpNewPlot: 'StoryMaster_Msg_OnJumpNewPlot', // 跳转到新的剧情
        OnPieceTalkOver: 'StoryMaster_Msg_OnPieceTalkOver', // 对话结束
        OnGoNextPiece: 'StoryMaster_Msg_OnGoNextPiece',
        OnEnableGlobalTouch: 'StoryMaster_Msg_OnEnableGlobalTouch',
        PieceHasOptions: 'StoryMaster_Msg_PieceHasOptions',
        PieceShowOptions: 'StoryMaster_Msg_PieceShowOptions',
        UserTouch: 'StoryMaster_Msg_UserTouch', // 用户点击
    },
    Type: {
        Pieces: {
            Content: 1, // 内容
            PlotJump: 2, // 剧情跳转
        },
    },
    GameCfg: {
        profile: 'profile://project/story-master.json',
        myResDir: 'db://assets/my-resources',
        myTemplateDir: 'db://assets/my-template',
        templateDir: 'db://assets/template',

        // 剧情
        plot: {
            plugin: 'db://assets/resources/plot.json',
            game: 'plot.json',
        },
        // 片段内容
        piece: {
            plugin: 'db://assets/resources/piece.json',
            prefab: 'db://assets/resources/piece', // 存放所有的片段
            game: 'piece.json',
        },
        // 游戏初始化使用
        init: {
            plugin: 'db://assets/resources/init.json',
            game: 'init.json',
        },

        template: {
            dev: {
                StoryPiece: 'db://assets/code/template/StoryPiece.prefab',
                StoryTalk: 'db://assets/code/template/StoryTalk.prefab',
                StoryOptions: 'db://assets/code/template/StoryOptions.prefab',
            },
            public: {
                StoryPiece: 'db://story-master-code/template/StoryPiece.prefab',
                StoryTalk: 'db://story-master-code/template/StoryTalk.prefab',
                StoryOptions: 'db://story-master-code/template/StoryOptions.prefab',
            },
        },
    },
};
cc.StoryMaster = module.exports = StoryMaster;
