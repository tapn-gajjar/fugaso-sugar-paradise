module.exports = {
    /**
     * @param {string[]} languages
     */

    generateLanguages(languages) {
        return languages.map(language => {
            const nameSplit = language.split("-");
            return nameSplit[0] + "_" +  nameSplit[nameSplit.length === 1 ? 0 : 1].toUpperCase();
        });
    },

    /**
     * @method
     * @param {LanguageBuffer} data
     * @param {string[]} languageIDs
     * @returns {LanguageBuffer}
     */

    updateLanguageData(data, languageIDs) {
        for (let i = 0; i < languageIDs.length; ++i) {
            if (data.hasOwnProperty(languageIDs[i])) {
                continue;
            }
            data[languageIDs[i]] = {};
        }
        return this._sortObject(data);
    },

    /**
     * @public
     * @param {LocalisationData} standard
     * @param {ConfigData} config
     * @returns {LanguageBuffer}
     */

    generateBufferFromStandard(standard, config) {
        const result = {};
        result[config.defaultLang] = standard;
        return result;
    },

    /**
     * @param {LanguageBuffer} poLocale
     * @param {LocalisationData} hash
     * @returns {LanguageBuffer}
     */

    generateLocaleFromPO(poLocale, hash) {
        const result = {};
        const languages = Object.keys(poLocale);
        const langCount = languages.length;
        const hashKeys = Object.keys(hash);
        const hashKeyCount = hashKeys.length;
        let languageID, language, resultLanguage, hashKey, hashValue, i, j;

        for (i = 0; i < langCount; ++i) {
            languageID = languages[i];
            language = poLocale[languageID];
            resultLanguage = {};
            result[languageID] = resultLanguage;

            for (j = 0; j < hashKeyCount; ++j) {
                hashKey = hashKeys[j];
                hashValue = hash[hashKey];
                resultLanguage[hashKey] = language.hasOwnProperty(hashValue) ? language[hashValue] : "-----------";
            }
        }

        return result;
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
