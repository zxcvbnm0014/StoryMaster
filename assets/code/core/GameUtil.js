module.exports = {
    transformUrl(url) {
        if (url) {
            let indexTitleStr = "db://assets/resources/";
            let indexTitle = url.indexOf(indexTitleStr);
            let indexEndStr = ".prefab";
            let indexEnd = url.indexOf(indexEndStr);
            if (indexTitle !== -1 && indexEnd !== -1) {
                let indexLen = indexTitleStr.length;
                let ret = url.substring(indexLen, indexEnd);
                return ret;
            } else {
                return null;
            }
        } else {
            return null;
        }
    },
}
