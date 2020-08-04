const micromatch = require('micromatch');

module.exports = {
    'packages/story-master/panel-test/vue.js': [
    ],
    'packages/story-master/**/*.js': [
        'prettier --write',
        'eslint --fix',
        'git add',
    ],
    'auto/**/*.js': [
        'prettier --write',
        'eslint --fix',
        'git add',
    ],

    // 'packages/story-master/**/*.css': files => {
    //     const match = micromatch.not(files, ['**/avg-electron/src/lib/**/*.css']);
    //     if (match.length < 1) {
    //         return ['git add'];
    //     }
    //     return [`stylelint --fix "${match.join(' ')}" `, 'git add'];
    // },
    'packages/story-master/**/*.css':[
        'stylelint --fix',
        'git add',
    ]
};
