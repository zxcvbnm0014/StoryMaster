const micromatch = require('micromatch');

module.exports = {
    'auto/**/*.js': [
        'prettier --write',
        'eslint --fix',
        'git add',
    ],

    'packages/story-master/**/*.js': files => {
        const match = micromatch.not(files, ['packages/story-master/panel-test/vue.js']);
        console.log('--file' + JSON.stringify(files));
        if (match.length < 1) {
            return ['git add'];
        }
        return [`eslint --fix "${match.join(' ')}" `, 'git add'];
    },
    'packages/story-master/**/*.css': [
        'stylelint --fix',
        'git add',
    ]
};
