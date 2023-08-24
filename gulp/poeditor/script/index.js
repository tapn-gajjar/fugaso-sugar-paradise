const spreadSheet = require("./SpreadSheets");
const POEditor = require("./POEditor");
const LocalData = require("./LocalData");
const LanguageUtil = require("./LanguageUtil");

module.exports = {
    /**
     * @desc Sort all files in language directory by keys.
     * @public
     */

    sortLanguages() {
        LocalData.sortLanguages();
    },

    async addFromStandardToSpreadsheet() {
        const config = LocalData.getConfig();
        const standard = LocalData.getStandard(config);
        const localLang = LanguageUtil.generateBufferFromStandard(standard, config);
        await updateSpreadsheet(config, localLang, true);
    },

    async updateFromStandardToSpreadsheet() {
        const config = LocalData.getConfig();
        const standard = LocalData.getStandard(config);
        const localLang = LanguageUtil.generateBufferFromStandard(standard, config);
        await updateSpreadsheet(config, localLang, false);
    },

    async addFromLocaleToSpreadsheet() {
        const config = LocalData.getConfig();
        const localLang = LocalData.getData(config);
        await updateSpreadsheet(config, localLang, true);
    },

    async updateFromLocaleToSpreadsheet() {
        const config = LocalData.getConfig();
        const localLang = LocalData.getData(config);
        await updateSpreadsheet(config, localLang, false);
    },

    async getFromSpreadsheet() {
        const config = LocalData.getConfig();
        const infoData = LocalData.getInfoData(config);
        const langData = await spreadSheet.getLocale(config.spreadsheetId, infoData.langID);
        LocalData.saveData(langData, config);
    },

    async generateHash() {
        const config = LocalData.getConfig();
        let hash = LocalData.getHash(config);

        if (hash !== null) {
            console.log("HASH EXIST CAN'T GENERATE IT AGAIN, TRY UPDATE");
            return;
        }
        const infoData = LocalData.getInfoData(config);
        hash = await spreadSheet.getHash(config.spreadsheetId, infoData.langID);

        LocalData.saveHash(hash, config);
    },

    async updateHash() {
        const config = LocalData.getConfig();
        let hash = LocalData.getHash(config);

        const infoData = LocalData.getInfoData(config);
        hash = await spreadSheet.getHash(config.spreadsheetId, infoData.langID);

        LocalData.saveHash(hash, config);
    },

    async refreshPO() {
        const config = LocalData.getConfig();
        /**
         * @type {POData}
         */
        const poData = await spreadSheet.getPOLocale(config.spreadsheetId);
        await POEditor.postData(config, poData.languages, poData.comments);
    },

    async generateLocaleFromPO() {
        const config = LocalData.getConfig();
        const locale = await POEditor.getData(config);
        const hash = LocalData.getHash(config);

        if (hash === null) {
            console.log("CAN'T GENERATE LOCALE, HASH EMPTY");
            return;
        }

        const langData = LanguageUtil.generateLocaleFromPO(locale, hash);
        LocalData.saveData(langData, config);
    },

    async updateLocalLanguages() {
        const config = LocalData.getConfig();
        const infoData = LocalData.getInfoData(config);
        const languageIDs = await POEditor.langList(config);
        const languages = LanguageUtil.generateLanguages(languageIDs);
        infoData.languageIDs = languages;
        LocalData.saveInfoData(infoData, config);
    }
};

/**
 * @param {ConfigData} config
 * @param {LanguageBuffer} localLang
 * @param {boolean} breakOnExist
 * @returns {Promise<void>}
 */

async function updateSpreadsheet(config, localLang, breakOnExist) {
    const hashData = LocalData.getHash(config);
    const infoData = LocalData.getInfoData(config);
    const languageIDs = await POEditor.langList(config);
    localLang = LanguageUtil.updateLanguageData(localLang, languageIDs);
    await spreadSheet.updateLocale(config.spreadsheetId, infoData.langID, localLang, config.defaultLang, breakOnExist, hashData);
}

/**
 * @desc Value of config file
 * @typedef {Object}
 * @name ConfigData
 * @property {string} api_key - API key of PO Editor.
 * @property {int} id - ID of project in PO Editor.
 * @property {string} languageDir - Directory where language files stored.
 * @property {string} infoPath - Path to file that store porject name and information about languages.
 * @property {string} defaultLang - Default lang for manipulate with PO editor.
 * @property {string} spreadsheetId - ID of spreadsheet that for store and update localisation.
 */

/**
 * @desc Game file that contains languages list and game id.
 * @typedef {Object}
 * @name InfoData
 * @property {string[]} languageIDs - Array with IDs of languages that use game.
 * @property {string} defaultLanguage - Default language that use game.
 * @property {string} serverID - ID of server that use game.
 */

/**
 * @desc Object that store localisation information.
 * @typedef {Object.<string, string>}
 * @name LocalisationData
 */

/**
 * @desc Object that store all language information.
 * @typedef {Object.<string, LocalisationData>}
 * @name LanguageBuffer
 */

/**
 * @desc Object that store information for PO editor.
 * @typedef {Object}
 * @name POData
 * @property {LanguageBuffer} languages
 * @property {LocalisationData} comments
 */
