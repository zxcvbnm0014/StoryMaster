module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        "no-console": "off",
        //禁止使用debugger
        'no-debugger': 2,
        // 强制使用===和!==, 忽略 null
        'eqeqeq': ['error', 'always', { "null": "ignore" }],
        'no-dupe-keys': 2, //在创建对象字面量时不允许键重复 {a:1,a:1}
        'no-dupe-args': 2, //函数参数不能重复
        'no-duplicate-case': 2, //switch中的case标签不能重复
        "no-func-assign": 2,//禁止重复的函数声明
        "no-redeclare": 2,//禁止重复声明变量
        // 指定数组的元素之间要以空格隔开(, 后面)， never参数：[ 之前和 ] 之后不能带空格，always参数：[ 之前和 ] 之后必须带空格
        'array-bracket-spacing': [2, 'never'],
        // 禁止或强制在单行代码块中使用空格(禁用)
        'block-spacing': [1, 'never'],
        //强制使用一致的缩进 第二个参数为 "tab" 时，会使用tab，
        // if while function 后面的{必须与if在同一行，java风格。
        'brace-style': [2, '1tbs', {
            allowSingleLine: true
        }],
        // 双峰驼命名格式
        camelcase: ['error', { allow: ['^\\$_'] }],
        // 控制逗号前后的空格
        'comma-spacing': [2, {
            before: false,
            after: true
        }],
        // 强制使用尾逗号
        // https://github.com/airbnb/javascript#commas--dangling
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        }],
        // 控制逗号在行尾出现还是在行首出现 (默认行尾)
        // http://eslint.org/docs/rules/comma-style
        'comma-style': [2, 'last'],
        //"SwitchCase" (默认：0) 强制 switch 语句中的 case 子句的缩进水平
        // 以方括号取对象属性时，[ 后面和 ] 前面是否需要空格, 可选参数 never, always
        'computed-property-spacing': [2, 'never'],
        // 用于指统一在回调函数中指向this的变量名，箭头函数中的this已经可以指向外层调用者，应该没卵用了
        // e.g [0,"that"] 指定只能 var that = this. that不能指向其他任何值，this也不能赋值给that以外的其他值
        'consistent-this': [1, 'that'],
        // 强制使用命名的 function 表达式
        'func-names': 0,
        // 文件末尾强制换行
        'eol-last': 0,
        indent: [2, 4, {
            SwitchCase: 1
        }],
        // 强制在对象字面量的属性中键和值之间使用一致的间距
        'key-spacing': [2, {
            beforeColon: false,
            afterColon: true
        }],
        // 强制使用一致的换行风格
        'linebreak-style': [0, 'unix'],
        // 要求在注释周围有空行 ( 要求在块级注释之前有一空行)
        'lines-around-comment': [1, {
            beforeBlockComment: true
        }],
        // 强制一致地使用函数声明或函数表达式，方法定义风格，参数：
        // declaration: 强制使用方法声明的方式，function f(){} e.g [2, "declaration"]
        // expression：强制使用方法表达式的方式，var f = function() {} e.g [2, "expression"]
        // allowArrowFunctions: declaration风格中允许箭头函数。 e.g [2, "declaration", { "allowArrowFunctions": true }]
        'func-style': 0,
        // 强制回调函数最大嵌套深度 5层
        'max-nested-callbacks': [1, 5],
        // 禁止使用指定的标识符
        'id-blacklist': 0,
        // 强制标识符的最新和最大长度
        'id-length': 0,
        // 要求标识符匹配一个指定的正则表达式
        'id-match': 0,
        // 强制在 JSX 属性中一致地使用双引号或单引号
        'jsx-quotes': 0,
        // 强制在关键字前后使用一致的空格 (前后腰需要)
        'keyword-spacing': 2,
        // 强制一行的最大长度
        'max-len': [1, 200],
        // 强制最大行数
        'max-lines': 0,
        // 强制 function 定义中最多允许的参数数量
        'max-params': [1, 7],
        // 强制 function 块最多允许的的语句数量
        'max-statements': [1, 200],
        // 强制每一行中所允许的最大语句数量
        'max-statements-per-line': 0,
        // 要求构造函数首字母大写 （要求调用 new 操作符时有首字母大小的函数，允许调用首字母大写的函数时没有 new 操作符。）
        'new-cap': [2, {
            newIsCap: true,
            capIsNew: false
        }],
        // 要求调用无参构造函数时有圆括号
        'new-parens': 2,
        // 要求或禁止 var 声明语句后有一行空行
        'newline-after-var': 0,
        // 禁止使用 Array 构造函数
        'no-array-constructor': 2,
        // 禁用按位运算符
        'no-bitwise': 0,
        // 要求 return 语句之前有一空行
        'newline-before-return': 0,
        // 要求方法链中每个调用都有一个换行符
        'newline-per-chained-call': 1,
        // 禁用 continue 语句
        'no-continue': 0,
        // 禁止在代码行后使用内联注释
        'no-inline-comments': 0,
        // 禁止 if 作为唯一的语句出现在 else 语句中
        'no-lonely-if': 0,
        // 禁止混合使用不同的操作符
        'no-mixed-operators': 0,
        // 不允许空格和 tab 混合缩进
        'no-mixed-spaces-and-tabs': 2,
        // 不允许多个空行
        'no-multiple-empty-lines': [2, {
            max: 2
        }],
        // 不允许否定的表达式
        'no-negated-condition': 0,
        // 不允许使用嵌套的三元表达式
        'no-nested-ternary': 0,
        // 禁止使用 Object 的构造函数
        'no-new-object': 2,
        // 禁止使用一元操作符 ++ 和 --
        'no-plusplus': 0,
        // 禁止使用特定的语法
        'no-restricted-syntax': 0,
        // 禁止 function 标识符和括号之间出现空格
        'no-spaced-func': 2,
        // 不允许使用三元操作符
        'no-ternary': 0,
        // 禁用行尾空格
        'no-trailing-spaces': 2,
        // 禁止标识符中有悬空下划线_bar
        'no-underscore-dangle': 0,
        // 禁止可以在有更简单的可替代的表达式时使用三元操作符
        'no-unneeded-ternary': 2,
        // 禁止属性前有空白
        'no-whitespace-before-property': 0,
        // 强制花括号内换行符的一致性
        'object-curly-newline': 0,
        // 强制在花括号中使用一致的空格
        'object-curly-spacing': 0,
        // 强制将对象的属性放在不同的行上
        'object-property-newline': 0,
        // 强制函数中的变量要么一起声明要么分开声明
        'one-var': [2, {
            initialized: 'never'
        }],
        // 要求或禁止在 var 声明周围换行
        'one-var-declaration-per-line': 0,
        // 要求或禁止在可能的情况下要求使用简化的赋值操作符
        'operator-assignment': 0,
        // 强制操作符使用一致的换行符
        'operator-linebreak': [2, 'after', {
            overrides: {
                '?': 'before',
                ':': 'before'
            }
        }],
        // 要求或禁止块内填充
        'padded-blocks': 0,
        // 要求对象字面量属性名称用引号括起来
        'quote-props': 0,
        // 强制使用一致的反勾号、双引号或单引号
        quotes: [2, 'single', 'avoid-escape'],
        // 要求使用 JSDoc 注释
        'require-jsdoc': ['off'],
        // 要求或禁止使用分号而不是 ASI（这个才是控制行尾部分号的，）
        semi: [2, 'always'],
        // 强制分号之前和之后使用一致的空格
        'semi-spacing': 0,
        // 要求同一个声明块中的变量按顺序排列
        'sort-vars': 0,
        // 强制在块之前使用一致的空格
        'space-before-blocks': [2, 'always'],
        'space-before-function-paren': [0, 'never'],
        // 强制在圆括号内使用一致的空格
        'space-in-parens': [0, 'never'],
        // 要求操作符周围有空格
        'space-infix-ops': 2,
        // 强制在一元操作符前后使用一致的空格
        'space-unary-ops': [2, {
            words: true,
            nonwords: false
        }],
        // 强制在注释中 // 或 /* 使用一致的空格
        'spaced-comment': [
            2,
            'always',
            {
                markers: ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!']
            }
        ],
        // 要求或禁止 Unicode BOM
        'unicode-bom': 0,
        // 要求正则表达式被括号括起来
        'wrap-regex': 0,
    }
};