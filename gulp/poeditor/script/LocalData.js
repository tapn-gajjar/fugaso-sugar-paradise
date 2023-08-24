const fs = require("fs");
const path = require("path");

const suffix = ".json";

/**
 * @enum {string}
 */
const SERVICE_NAMES = {
    STANDARD: "standard",
    HASH: "hash"
};

module.exports = {
    /**
     * PUBLIC METHODS
     * -----------------------------------------------------------------------------------------------------------------
     */

    /**
     * @desc Sort all files in language directory by keys.
     * @public
     */

    sortLanguages() {
        const config = this.getConfig();
        const languageDirPath = this._toGlobal(config.languageDir);
        const languageFiles = fs.readdirSync(languageDirPath);

        languageFiles.forEach(fileName => {
            const language = this._getLanguageJson(fileName, config);
            this._saveLanguageJson(fileName, language, config);
        });
    },

    /**
     * @param {ConfigData} [config]
     * @returns {LanguageBuffer}
     */

    getData(config = this.getConfig()) {
        const languageDirPath = this._toGlobal(config.languageDir);
        const languageFiles = fs.readdirSync(languageDirPath);
        const fileCount = languageFiles.length;
        const result = {};
        let fileName, i, languageCode;

        for (i = 0; i < fileCount; ++i) {
            fileName = languageFiles[i];
            if (this._isFileService(fileName)) {
                continue;
            }
            languageCode = this._fileNameToCode(fileName);
            result[languageCode] = this._getLanguageJson(fileName, config);
        }

        return this._sortObject(result);
    },

    /**
     * @param {ConfigData} config
     * @param {LanguageBuffer} languages
     */

    saveData (languages, config = this.getConfig()) {
        let key, language, fileName;
        for (key in languages) {
            if (!languages.hasOwnProperty(key)) {
                continue;
            }
            language = languages[key];
            fileName = this._codeToFileName(key);
            this._saveLanguageJson(/*fileName*/key, language, config);
        }
    },

    /**
     * @public
     * @param {ConfigData} [config]
     * @returns {InfoData}
     */

    getInfoData(config = this.getConfig()) {
        const infoDataPath = this._toGlobal(config.infoPath);
        return this._readJson(infoDataPath);
    },

    /**
     * @public
     * @param {ConfigData} [config]
     * @param {InfoData} data
     */

    saveInfoData(data, config = this.getConfig()) {
        const infoDataPath = this._toGlobal(config.infoPath + suffix);
        this._writeJson(infoDataPath, data);
    },

    /**
     * @public
     * @param {ConfigData} [config]
     * @returns {LocalisationData | null}
     */

    getStandard(config = this.getConfig()) {
        return this._getLanguageJson(SERVICE_NAMES.STANDARD, config);
    },

    /**
     * @param {ConfigData} [config]
     * @param {LocalisationData} data
     */

    saveHash(data, config = this.getConfig()) {
        this._saveLanguageJson(SERVICE_NAMES.HASH, data, config);
    },

    /**
     * @param {ConfigData} [config]
     * @return {LocalisationData}
     */

    getHash(config = this.getConfig()) {
        return this._getLanguageJson(SERVICE_NAMES.HASH, config);
    },

    /**
     * @public
     * @returns {ConfigData}
     */

    getConfig() {
        return this._readJson(path.resolve(__dirname, "../config"));
    },

    /**
     * PRIVATE METHODS
     * -----------------------------------------------------------------------------------------------------------------
     */

    /**
     * @desc Convert file name to language code
     * @example
     *  pt_PT => pt
     *  en_US => en-us
     * @param {string} name
     * @return {string}
     * @private
     */

    _fileNameToCode(name) {
        const languageCode = name.split(".")/*[0].split("_")*/;
        const firstId = languageCode[0];
        const secondId = languageCode[1].toLowerCase();

        return /*firstId !== secondId ? firstId + "-" + secondId : firstId*/firstId;
    },

    /**
     * @desc Convert language code to  fileName
     * @example
     *  pt => pt_PT
     *  en-us => en_US
     * @param code
     * @private
     * @returns {string}
     */

    _codeToFileName(code) {
        const nameSplit = code.split("-");
        return nameSplit[0] + "_" +  nameSplit[nameSplit.length === 1 ? 0 : 1].toUpperCase();
    },

    /**
     *
     * @param {string} path
     * @returns {Object | null}
     * @private
     */

    _readJson(path) {
        if (path.indexOf(suffix) === -1) {
            path += suffix;
        }
        return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : null;
    },

    /**
     * @param {string} path
     * @param {Object} json
     * @private
     */

    _writeJson(path, json) {
        if (path.indexOf(suffix) === -1) {
            path += suffix;
        }
        fs.writeFileSync(path, JSON.stringify(json, null, '\t'));
    },

    /**
     * @param {string} fileName
     * @returns {boolean}
     * @private
     */

    _isFileService(fileName) {
        return fileName.indexOf(SERVICE_NAMES.STANDARD) !== -1 || fileName.indexOf(SERVICE_NAMES.HASH) !== -1;
    },

    /**
     * @param {string} localPath
     * @returns {string}
     * @private
     */

    _toGlobal(localPath) {
        const workingPath = process.cwd();
        return path.join(workingPath, localPath);
    },

    /**
     * @param {string} name
     * @param {ConfigData} [config]
     * @returns {LocalisationData | null}
     * @private
     */

    _getLanguageJson(name, config = this.getConfig()) {
        const filePath = this._toGlobal(path.join(config.languageDir, name));
        return this._readJson(filePath);
    },

    /**
     * @param {string} name
     * @param {LocalisationData} data
     * @param {ConfigData} [config]
     * @private
     */

    _saveLanguageJson(name, data, config = this.getConfig()) {
        const filePath = this._toGlobal(path.join(config.languageDir, name));
        return this._writeJson(filePath, this._sortObject(data));
    },

    /**
     * @desc Sort object by keys.
     * @param {Object.<string,*>} data
     * @private
     * @returns {Object.<string,*>}
     */

    _sortObject(data) {
        const sortedData = {};
        const languageKeys = Object.keys(data);
        languageKeys.sort().forEach(key => sortedData[key] = data[key]);
        return sortedData;
    }
};
