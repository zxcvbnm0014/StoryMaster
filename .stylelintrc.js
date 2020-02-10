module.exports = {
    processors: [],
    plugins: [],
    extends: 'stylelint-config-standard', // 这是官方推荐的方式
    rules: {
        'at-rule-no-unknown': null,
        'block-no-empty': true,
        'max-empty-lines': 5,
        'font-family-no-missing-generic-family-keyword': null,
        'no-descending-specificity': null,
        'indentation': [4],
    }
};
