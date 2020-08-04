const gulp = require('gulp');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const jszip = require('jszip');
const JsonFormat = require('json-format');
const globby = require('globby');
const uglifyES = require('uglify-es');
const htmlMinifier = require('html-minifier');

// 打包目录
let packageDir = function(rootPath, zip) {
    let dir = fs.readdirSync(rootPath);
    for (let i = 0; i < dir.length; i++) {
        let itemDir = dir[i];
        let itemFullPath = path.join(rootPath, itemDir);
        let stat = fs.statSync(itemFullPath);
        if (stat.isFile()) {
            zip.file(itemDir, fs.readFileSync(itemFullPath));
        } else if (stat.isDirectory()) {
            packageDir(itemFullPath, zip.folder(itemDir));
        }
    }
};
let compressCode = function(jsFile, isMin) {
    if (fs.existsSync(jsFile)) {
        let data = fs.readFileSync(jsFile, 'utf-8');
        let result = uglifyES.minify(data, {
            compress: {
                // eslint-disable-next-line camelcase
                dead_code: true, // 移除未使用的code
                // eslint-disable-next-line camelcase
                drop_console: true, // 丢弃console代码,默认false
                // eslint-disable-next-line camelcase
                drop_debugger: true, // 丢弃debugger代码,默认true
            },
            output: {
                // comments: false,
            },
        });
        if (result.error) {
            // console.log("❎压缩出现错误: " + result.error.message);
            // console.log("❎发生错误的文件: " + jsFile);
            return false;
        } else {
            if (isMin) {
                let file = path.basenameNoExt(jsFile);
                file += '.min.js';
                fs.writeFileSync(file, result.code);
            } else {
                fs.writeFileSync(jsFile, result.code);
            }
            return true;
        }
    } else {
        console.log('文件不存在:' + jsFile);
        return false;
    }
};

gulp.task('打包插件-release', function() {
    packagePlugin('story-master', {
        isCompress: true,
        dontCopyFile: ['panel-test', 'temp'],
        dontMinJs: [],
        isRemoveTmp: true,
        ignorePanel: ['test'],
    });
});
gulp.task('打包插件-debug', function() {
    packagePlugin('story-master', {
        isCompress: false,
        dontCopyFile: ['panel-test', 'temp'],
        dontMinJs: [],
        isRemoveTmp: false,
        ignorePanel: ['test'],
    });
});
gulp.task('copy-to-test', () => {
    let demoDir = path.join(__dirname, '../../story-master-plugin-demo');
    if (!fs.existsSync(demoDir)) {
        console.error('demo项目不存在，请新建项目:', demoDir);
        return;
    }
    let packages = path.join(demoDir, 'packages');
    if (!fs.existsSync(packages)) {
        console.log('packages目录不存在');
        return;
    }

    let source = path.join(__dirname, '../out/story-master');
    let dest = path.join(packages, 'story-master');
    if (!fs.existsSync(source)) {
        console.log('不存在插件源码', source);
        return;
    }

    fse.copySync(source, dest);
    console.log('ok');
});
// 打包插件
var packagePlugin = function(pluginDirName, options) {
    let isCompress = options.isCompress;
    let dontCopyFile = options.dontCopyFile;
    let dontMinJs = options.dontMinJs;
    let isRemoveTmp = options.isRemoveTmp;

    dontCopyFile = dontCopyFile === undefined ? [] : dontCopyFile;
    dontMinJs = dontMinJs === undefined ? [] : dontMinJs;

    let projectRootPath = path.join(__dirname, '../'); // 项目根目录
    let projectPackagePath = path.join(projectRootPath, 'packages'); // 项目插件根目录
    let pluginOutPath = path.join(projectRootPath, 'out'); // 插件输出目录
    let pluginTmpPath = path.join(pluginOutPath, pluginDirName); // 插件输出目录
    let packageCfgName = 'package.json'; // 插件配置文件名字
    let packageDirPath = path.join(projectPackagePath, pluginDirName); // 插件根目录
    let packageCfgPath = path.join(packageDirPath, packageCfgName); // 插件配置文件路径

    // 创建插件的输出目录
    if (!fs.existsSync(pluginOutPath)) {
        fse.mkdirsSync(pluginOutPath);
    }
    if (!fs.existsSync(pluginTmpPath)) {
        fse.mkdirsSync(pluginTmpPath);
    }
    // 将插件先拷贝到out/pluginTmp目录下
    if (!fs.existsSync(packageDirPath)) {
        console.error('[ERROR] 没有发现插件目录: ' + packageDirPath);
        return;
    }
    // 清空临时目录
    fse.emptyDirSync(pluginTmpPath);
    // 补全路径
    let dontCopyFileArray = [];

    dontCopyFile.map(function(item) {
        let full = path.join(packageDirPath, item);
        let b = fs.existsSync(full);
        if (b) {
            dontCopyFileArray.push(full);
        } else {
            console.log('无效的过滤项: ' + item);
        }
    });

    // 可以在第三个参数,过滤掉不需要拷贝的文件
    // filter <Function>: Function to filter copied files. Return true to include, false to exclude.
    fse.copySync(packageDirPath, pluginTmpPath, function(file, dest) {
        let isInclude = true;
        let state = fs.statSync(file);
        if (state.isDirectory()) {
            // 文件夹,判断是否有这个文件夹
            for (let i = 0; i < dontCopyFileArray.length; i++) {
                let itemFile = dontCopyFileArray[i];
                if (fs.statSync(itemFile).isDirectory() && itemFile === file) {
                    isInclude = false;
                    break;
                }
            }
        } else if (state.isFile()) {
            // 文件 判断是否包含在文件夹内
            for (let i = 0; i < dontCopyFileArray.length; i++) {
                let itemFile = dontCopyFileArray[i];
                if (fs.statSync(itemFile).isDirectory()) {
                    if (file.indexOf(itemFile) === -1) {
                    } else {
                        isInclude = false;
                        break;
                    }
                } else if (fs.statSync(itemFile).isFile()) {
                    if (itemFile === file) {
                        isInclude = false;
                        break;
                    }
                }
            }
        } else {
        }
        if (!isInclude) {
            if (fs.statSync(file).isFile()) {
                console.log('⚠️[过滤] 文件: ' + file);
            } else if (fs.statSync(file).isDirectory()) {
                console.log('⚠️[过滤] 目录: ' + file);
            }
        }
        return isInclude;
    // let relative = path.relative(file, packageDirPath);
    });
    console.log('拷贝插件成功: ' + pluginTmpPath);
    // 删除掉package-lock.json
    let delFiles = ['package-lock.json', 'README.md'];
    for (let i = 0; i < delFiles.length; i++) {
        let packageLocalFilePath = path.join(pluginTmpPath, delFiles[i]);
        if (fs.existsSync(packageLocalFilePath)) {
            fs.unlinkSync(packageLocalFilePath);
            console.log('✅[删除] 文件: ' + packageLocalFilePath);
        }
    }

    // 修改插件必要的配置package.json, 删除无用的menu
    let pluginTmpPackageCfgPath = path.join(pluginTmpPath, packageCfgName); // 插件临时配置文件路径
    if (!fs.existsSync(pluginTmpPackageCfgPath)) {
        console.error('[ERROR] 没有发现配置的临时文件: ' + pluginTmpPackageCfgPath);
        return;
    }
    let cfgData = fs.readFileSync(pluginTmpPackageCfgPath, 'utf-8');
    let json = JSON.parse(cfgData);
    let menus = json['main-menu'];
    if (menus) {
        for (let key in menus) {
            let item = menus[key];
            if (item && item.del) {
                delete menus[key];
                console.log('✅[丢弃] 无用menus: ' + key);
            }
        }
    }

    // 删除dependencies
    let dependencies = json['dependencies'];
    if (dependencies) {
        delete json['dependencies'];
        console.log('✅[丢弃] 无用dependencies');
    }

    // 删除devDependencies
    let devDependencies = json['devDependencies'];
    if (devDependencies) {
        delete json['devDependencies'];
        console.log('✅[丢弃] 无用devDependencies');
    }
    // 删除测试面板字段
    if (Array.isArray(options.ignorePanel)) {
        options.ignorePanel.forEach(item => {
            let panelData = json[`panel.${item}`];
            if (panelData) {
                delete json[`panel.${item}`];
                console.log(`✅[丢弃] 无用面板：${item}`);
            }
        });
    }

    // 修改构建时间
    json['public'] = true;
    let time = new Date().toLocaleString();
    json['public-time'] = time;
    console.log('✅[修改] 构建时间: ' + time);

    let formatData = JsonFormat(json);

    fs.writeFileSync(pluginTmpPackageCfgPath, formatData);
    console.log('写入新的临时配置package.json完毕!');

    // 拷贝runtime-resource, 拷贝assets/plugin 到 tmp/下
    let runTimeResourcePath = null; // 插件设置的运行时资源路径
    if (json['runtime-resource']) {
        runTimeResourcePath = json['runtime-resource']['path'];
    }
    if (!runTimeResourcePath) {
        console.error('[ERROR] 未发现插件runtime-resource相关配置信息!');
        return;
    }
    let pluginRuntimeDir = path.join(
        projectRootPath,
        'assets/' + runTimeResourcePath
    );
    if (!fs.existsSync(pluginRuntimeDir)) {
        console.error('[ERROR] 插件的runtime-resource不存在: ' + pluginRuntimeDir);
        return;
    }
    let desPluginPath = path.join(pluginTmpPath, runTimeResourcePath);
    if (!fs.existsSync(desPluginPath)) {
        fse.mkdirsSync(desPluginPath);
    }
    fse.copySync(pluginRuntimeDir, desPluginPath);
    console.log('拷贝runtime-resource完成');
    // 拷贝runtime-resource.meta文件
    let metaSrc = pluginRuntimeDir + '.meta';
    if (!fs.existsSync(metaSrc)) {
        console.warn('[WARNING] 不存在runtime-resource.meta文件: ' + metaSrc);
    }
    fse.copyFileSync(metaSrc, desPluginPath + '.meta');

    //  压缩插件源码
    if (isCompress) {
    // 压缩js
        let exclude = '!' + pluginTmpPath + '/node_modules/**/*';
        let options = [pluginTmpPath + '/**/*.js', exclude];
        for (let i = 0; i < dontMinJs.length; i++) {
            let item = dontMinJs[i];
            let fullUrl = path.join(pluginTmpPath, item);
            if (fs.existsSync(fullUrl)) {
                options.push(`!${fullUrl}`);
                console.log('⚠️[压缩配置] 新增禁止压缩配置: ' + item);
            } else {
                console.log('⚠️[压缩配置] 无效的禁止压缩配置: ' + item);
            }
        }
        let paths = globby.sync(options);
        for (let i = 0; i < paths.length; i++) {
            let item = paths[i];
            let b = compressCode(item, false);
            if (b) {
                console.log(`✅[压缩] 成功(JS)[${i + 1}/${paths.length}]: ${item}`);
            } else {
                console.log(`❎[压缩] 失败(JS)[${i + 1}/${paths.length}]: ${item}`);
            }
        }
        // 压缩html,css
        let pattern2 = pluginTmpPath + '/**/*.html';
        let pattern3 = pluginTmpPath + '/**/*.css';
        let paths1 = globby.sync([pattern2, pattern3, exclude]);
        let minify = htmlMinifier.minify;
        for (let i = 0; i < paths1.length; i++) {
            let item = paths1[i];
            let itemData = fs.readFileSync(item, 'utf-8');
            let minifyData = minify(itemData, {
                removeComments: true, // 是否去掉注释
                collapseWhitespace: true, // 是否去掉空格
                minifyJS: false, // 是否压缩html里的js（使用uglify-js进行的压缩）
                minifyCSS: false, // 是否压缩html里的css（使用clean-css进行的压缩）
            });
            fs.writeFileSync(item, minifyData);
            console.log(`✅[压缩] 成功(HTML)[${i + 1}/${paths1.length}]: ${item}`);
        }
    }
    // 打包插件
    console.log('✅[打包] 目录: ' + pluginTmpPath);
    if (!fs.existsSync(pluginTmpPath)) {
        console.log('[ERROR] 打包目录不存在: ' + pluginTmpPath);
        return;
    }
    // eslint-disable-next-line new-cap
    let zip = new jszip();
    // 打包插件说明
    let readme = path.join(projectRootPath, '插件说明.md');
    if (fs.existsSync(readme)) {
        zip.file('插件说明.txt', fs.readFileSync(readme));
    }
    // 打包插件源代码
    packageDir(pluginTmpPath, zip.folder(pluginDirName));
    // 创建zip存放目录
    if (!fs.existsSync(pluginOutPath)) {
        fs.mkdirSync(pluginOutPath);
    }
    // 删除旧版本
    let zipFilePath = path.join(pluginOutPath, pluginDirName + '-plugin.zip');
    if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
        console.log('⚠️[删除] 旧版本压缩包: ' + zipFilePath);
    }
    // 生成压缩包
    zip
        .generateNodeStream({
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9,
            },
        })
        .pipe(fs.createWriteStream(zipFilePath))
        .on(
            'finish',
            function() {
                console.log('打包成功: ' + zipFilePath);
                // 删除目录
                if (isRemoveTmp) {
                    console.log('⚠️[删除] 打包临时目录:' + pluginTmpPath);
                    fse.removeSync(pluginTmpPath);
                }
                // 在文件夹中展示打包文件
                let platform = require('os').platform();
                let cmd = null;
                if (platform === 'darwin') {
                    cmd = 'open ' + pluginOutPath;
                } else if (platform === 'win32') {
                    cmd = `explorer ${pluginOutPath}`;
                }

                if (cmd) {
                    console.log('😂[CMD] ' + cmd);
                    let exec = require('child_process').exec;
                    exec(
                        cmd,
                        function(error, stdout, stderr) {
                            if (error) {
                                console.log(stderr);
                                return;
                            }
                            console.log(stdout);
                        }.bind(this)
                    );
                }
            }.bind(this)
        )
        .on(
            'error',
            function() {
                console.log('❌[打包]失败: ' + zipFilePath);
            }.bind(this)
        );
};
