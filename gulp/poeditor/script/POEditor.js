const request = require("request");
const logger = require("./Logger");

/**
 * @type {?ConfigData}
 */
let config = null;

const poEditorApiRoot = "https://api.poeditor.com/v2";

/**
 * @enum {string}
 */

const CHAPTER = {
    PROJECT: "projects",
    LANGUAGE: "languages",
    TERM: "terms"
};

/**
 * @enum {string}
 */

const COMMAND = {
    ADD: "add",
    LIST: "list",
    EXPORT: "export",
    UPDATE: "update",
    DELETE: "delete",
    ADD_COMMENT: "add_comment"
};

const MESSAGES = [
    "POST TO PO_EDITOR",
    "LOAD LANGUAGES FROM SERVER",
    "UPDATE NOT EXISTING TERMS",
    "REFRESH LOCALIZATION",
    "UPDATE COMMENTS",
    "GET FROM PO EDITOR"
];

/**
 *
 * @param {CHAPTER} chapter
 * @param {COMMAND} command
 * @returns {string}
 */

function generateApiUrl(chapter, command) {
    return poEditorApiRoot + "/" + chapter + "/" + command;
}

/**
 * @desc Do sync request to url. If parameter count 2 POST, if 1 GET.
 * @param {string} url
 * @param {Object} [data]
 * @return {Promise<string>}
 */

function doRequest(url, data) {
    let options;
    const headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    };

    switch (arguments.length) {
        case 1: {
            options = { url: url, method: "GET", headers: headers};
            break;
        }
        case 2: {
            options = { url: url, method: "POST", headers: headers, form: data};
            break;
        }
        default: {
            return null;
        }
    }
    return new Promise((resolve, reject) => request(options, (error, res, body) => !error && res.statusCode === 200 ? resolve(body) : reject(error)));
}

function parseServerLanguages(response) {
    try {
        const responseData = JSON.parse(response);

        if (!responseData.result && !responseData.result.languages) {
            console.log("Error parsing server languages: " + response);
            return [];
        }

        const languageData = responseData.result.languages;

        return /*languageData.map(language => language.code)*/[
            "eng",
            "fra",
            "deu",
            "ita",
            "nor",
            "prt",
            "rus",
            "esp",
            "swe",
            "tur",
            "jpn"
        ];
    }
    catch (err) {
        console.log("Error parsing server languages: " + response);
        return [];
    }
}

async function updateNotExistingTerms(language, terms) {
    const keys = Object.keys(language);
    const termCount = terms.length;
    let i, term, index, id;

    for (i = 0; i < termCount; ++i) {
        term = terms[i];
        index = keys.indexOf(term.term);
        if (index !== -1) {
            keys.splice(index, 1);
        }
    }

    const newTermCount = keys.length;
    const result = [];
    for (i = 0; i < newTermCount; ++i) {
        id = keys[i];
        result.push({term: id, context: ""});
    }

    await doRequest(generateApiUrl(CHAPTER.TERM, COMMAND.ADD), {
        api_token: config.api_key,
        id: config.id,
        data: JSON.stringify(result)
    });
}

function generateLanguageData(langData) {
    const result = [];
    const keys = Object.keys(langData);
    const keyCount = keys.length;
    let i, key, id;

    for (i = 0; i < keyCount; ++i) {
        key = keys[i];
        id = key;
        result.push({
            term: id,
            context: "",
            translation: {
                content: langData[key],
                fuzzy: 0
            }
        });
    }

    return JSON.stringify(result);
}

/**
 * @param {ConfigData} config
 * @param {LocalisationData} comments
 * @param {LocalisationData} serverComments
 * @returns {Promise<void>}
 */

async function updateComments(config, comments, serverComments) {

    const resultComments = {};
    let key, id;

    for (key in comments) {
        if (comments[key] === serverComments[key] || comments[key] === "--------") {
            continue;
        }
        resultComments[key] = comments[key];
    }

    const commentData = [];

    for (key in resultComments) {
        id = key;
        commentData.push({
            term: id,
            context: "",
            comment: resultComments[key]
        });
    }

    const updateResult = await doRequest(generateApiUrl(CHAPTER.TERM, COMMAND.ADD_COMMENT), {
        api_token: config.api_key,
        id: config.id,
        data: JSON.stringify(commentData)
    });

    console.log(updateResult);
}

async function refreshLocalization(localLanguages, serverLanguages) {
    const localKeys = Object.keys(localLanguages);
    const localLanguageCount = localKeys.length;
    let lang, i, updateResult;
    for (i = 0; i < localLanguageCount; ++i) {
        lang = localKeys[i];
        if (serverLanguages.indexOf(lang) === -1) {
            console.log("Language " + lang + " isn't exist on server. Adding");
            await doRequest(generateApiUrl(CHAPTER.LANGUAGE, COMMAND.ADD), {
                api_token: config.api_key,
                id: config.id,
                language: lang
            });
            serverLanguages.push(lang);
        }
    }

    const serverLanguageCount = serverLanguages.length;

    for (i = 0; i < serverLanguageCount; ++i) {
        lang = serverLanguages[i];
        if (localKeys.indexOf(lang) === -1) {
            console.log("WARNING!!! Language " + lang + " isn't exist locally.");
            continue;
        }
        console.log("Refresh language " + lang + ".");
        updateResult = await doRequest(generateApiUrl(CHAPTER.LANGUAGE, COMMAND.UPDATE), {
            api_token: config.api_key,
            id: config.id,
            language: lang,
            fuzzy_trigger: 0,
            data: generateLanguageData(localLanguages[lang])
        });
    }
}

module.exports = {

    async langList(conf) {
        config = conf;
        const languages = await doRequest(generateApiUrl(CHAPTER.LANGUAGE, COMMAND.LIST), {
            api_token: config.api_key,
            id: config.id
        });
        return parseServerLanguages(languages);
    },

    /**
     * @param {ConfigData} conf
     * @param {LanguageBuffer} localData
     * @param {LocalisationData} comments
     * @returns {Promise<void>}
     */

    async postData(conf, localData, comments) {
        logger.logMessage(MESSAGES[0], logger.STATUS.START);
        config = conf;
        const localLanguages = localData;

        logger.logMessage(MESSAGES[1], logger.STATUS.START);
        const languages = await doRequest(generateApiUrl(CHAPTER.LANGUAGE, COMMAND.LIST), {
            api_token: config.api_key,
            id: config.id
        });
        const serverLanguages = parseServerLanguages(languages);
        logger.logMessage(MESSAGES[1], logger.STATUS.COMPLETE);
        logger.logMessage(MESSAGES[2], logger.STATUS.START);
        const terms = await doRequest(generateApiUrl(CHAPTER.TERM, COMMAND.LIST), {
            api_token: config.api_key,
            id: config.id,
            language: config.defaultLang
        });


        const parsedTerms = JSON.parse(terms);
        const serverTerms = parsedTerms.result.terms;
        const termCount = serverTerms.length;

        const serverComments = {};

        for (let i = 0; i < termCount; ++i) {
            serverComments[serverTerms[i].term] = serverTerms[i].comment || "";
        }

        logger.logMessage(MESSAGES[2], logger.STATUS.COMPLETE);
        await updateNotExistingTerms(localLanguages[config.defaultLang], serverTerms);
        logger.logMessage(MESSAGES[3], logger.STATUS.START);
        await refreshLocalization(localLanguages, serverLanguages);

        await updateComments(config, comments, serverComments);
        logger.logMessage(MESSAGES[3], logger.STATUS.COMPLETE);
        logger.logMessage(MESSAGES[0], logger.STATUS.COMPLETE);
    },

    async getData(conf) {
        config = conf;
        logger.logMessage(MESSAGES[5], logger.STATUS.START);
        logger.logMessage(MESSAGES[1], logger.STATUS.START);
        const languages = await doRequest(generateApiUrl(CHAPTER.LANGUAGE, COMMAND.LIST), {
            api_token: config.api_key,
            id: config.id
        });
        const serverLanguages = parseServerLanguages(languages);
        logger.logMessage(MESSAGES[1], logger.STATUS.COMPLETE);

        const langCount = serverLanguages.length;

        let i, j, langData, responseData, terms, localization, termCount, term, key;

        const result = {};

        for (i = 0; i < langCount; ++i) {
            langData = await doRequest(generateApiUrl(CHAPTER.TERM, COMMAND.LIST), {
                api_token: config.api_key,
                id: config.id,
                language: serverLanguages[i]
            });

            responseData = JSON.parse(langData);

            terms = responseData.result.terms;
            localization = {};
            termCount = terms.length;

            for (j = 0; j < termCount; ++j) {
                term = terms[j];
                key = term.term;
                localization[key] = term.translation.content;
            }

            result[serverLanguages[i]] = localization;
        }
        logger.logMessage(MESSAGES[5], logger.STATUS.COMPLETE);
        return result;
    }
};
