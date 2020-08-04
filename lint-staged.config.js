const micromatch = require('micromatch');

module.exports = {
    'auto/**/*.js': [
        'prettier --write',
        'eslint --fix',
        'git add',
    ],

    'packages/story-master/**/*.js': files => {
        const match = micromatch.not(files, ['**/packages/story-master/panel-test/vue.js']);
        if (match.length >= 1) {
            console.log(`files: ${JSON.stringify(files)}`);
            return [`eslint --fix "${match.join(' ')}" `];
        } else {
            return [];
        }
    },
    'packages/story-master/**/*.css': [
        'stylelint --fix',
        'git add',
    ]
};
