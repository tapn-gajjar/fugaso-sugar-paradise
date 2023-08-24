const fs = require("fs");
const path = require("path");
const {google} = require('googleapis');
const readlineSync = require('readline-sync');
const logger = require("./Logger");

const credentialPath = path.resolve(__dirname, "../credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = path.resolve(__dirname, "../token.json");

let spreadsheetId;

const MESSAGES = [
    "ADD DATA TO SPREADSEET",
    "SAVE DATA FROM SPREADSEET TO JSON",
    "GET AUTHOR",
    "CREATE PAGE",
    "READ LOCAL JSON'S",
    "CLEAR SPREADSHEET",
    "UPDATE FIELDS OF SPREADSHEET",
    "GET AVAILABLE SPREADSHEETS",
    "GET FIELDS OF SPREADSHEET",
    "SAVE LOCALIZATION TO JSON'S"
];

module.exports = {
    /**
     * @param {string} serverID
     * @param {LanguageBuffer} languages
     * @param {string} defaultKey
     * @param {boolean} breakOnExist
     * @param {LocalisationData | null} hash
     * @returns {Promise<void>}
     */
    async updateLocale(spreadsheetID, serverID, languages, defaultKey, breakOnExist, hash) {
        logger.logMessage(MESSAGES[0], logger.STATUS.START);
        await init(
            spreadsheetID,
            serverID,
            async (auth, spreadsheets, isSpreadsheetExist) => {
                if (isSpreadsheetExist && breakOnExist) {
                    console.log("PAGE " + serverID + " EXIST. AND CAN'T BE CREATE TRY UPDATE");
                    return;
                }

                if (!isSpreadsheetExist) {
                    console.log("PAGE " + serverID + " ISN'T EXIST. TRY TO CREATE IT");
                    await createPage(spreadsheets, auth, serverID);
                }

                const hashEmpty = hash === null;
                const langIds = Object.keys(languages);
                const langCount = langIds.length;
                const defaultLang = languages[defaultKey];
                const fields = [langIds];
                const emptyField = "";
                let i, key, language, field;

                for (key in defaultLang) {
                    if (!defaultLang.hasOwnProperty(key)) {
                        continue;
                    }
                    field = [];
                    field.push(key);
                    field.push(hashEmpty ? emptyField : hash[key]);
                    for (i = 0; i < langCount; ++i) {
                        language = languages[langIds[i]];
                        field.push(language.hasOwnProperty(key) ? language[key] : emptyField);
                    }
                    fields.push(field);
                }
                langIds.unshift("hash");
                langIds.unshift("key");

                await clearSheet(spreadsheets, auth, serverID);
                await updateFields(spreadsheets, auth, serverID, fields);
            });
        logger.logMessage(MESSAGES[0], logger.STATUS.COMPLETE);
    },

    async getLocale(spreadsheetID, serverID) {
        logger.logMessage(MESSAGES[1], logger.STATUS.START);
        return await init(
            spreadsheetID,
            serverID,
            async (auth, spreadsheets, isSpreadsheetExist) => {
                if (!isSpreadsheetExist) {
                    console.log("Spreadsheet with name " + serverID + " isn't exist");
                    return null;
                }

                const cellId = "Z";

                const pageData = await getFields(spreadsheets, auth, serverID, cellId);
                const dataSize = pageData.length;
                const languageIds = pageData[0];
                const languageIdCount = languageIds.length;
                const langInfo = {};

                let i, j, fieldData, fieldDataSize;

                for (i = 2; i < languageIdCount; ++i) {
                    langInfo[languageIds[i]] = {};
                }

                for (i = 1; i < dataSize; ++i) {
                    fieldData = pageData[i];
                    fieldDataSize = fieldData.length;
                    for (j = 2; j < fieldDataSize; ++j) {
                        langInfo[languageIds[j]][fieldData[0]] = fieldData[j];
                    }
                }

                logger.logMessage(MESSAGES[1], logger.STATUS.COMPLETE);

                return langInfo;
            });
    },

    async getHash(spreadsheetID, serverID) {
        logger.logMessage(MESSAGES[1], logger.STATUS.START);
        return await init(
            spreadsheetID,
            serverID,
            async (auth, spreadsheets, isSpreadsheetExist) => {
                if (!isSpreadsheetExist) {
                    console.log("Spreadsheet with name " + serverID + " isn't exist");
                    return null;
                }

                const cellId = "B";

                const pageData = await getFields(spreadsheets, auth, serverID, cellId);
                const dataSize = pageData.length;
                const hash = {};

                let i, fieldData, fieldDataSize;

                for (i = 1; i < dataSize; ++i) {
                    fieldData = pageData[i];
                    fieldDataSize = fieldData.length;
                    hash[fieldData[0]] = fieldData[1];
                }

                logger.logMessage(MESSAGES[1], logger.STATUS.COMPLETE);

                return hash;
            });
    },

    async getPOLocale(spreadsheetID) {
        logger.logMessage(MESSAGES[1], logger.STATUS.START);
        const serverID = "po_editor";
        return await init(
            spreadsheetID,
            serverID,
            async (auth, spreadsheets, isSpreadsheetExist) => {
                if (!isSpreadsheetExist) {
                    console.log("Spreadsheet with name " + serverID + " isn't exist");
                    return null;
                }

                const cellId = "Z";

                const pageData = await getFields(spreadsheets, auth, serverID, cellId);
                const dataSize = pageData.length;
                const languageIds = pageData[0];
                const languageIdCount = languageIds.length;
                const languages = {};
                const comments = {};

                let i, j, fieldData, fieldDataSize;

                for (i = 2; i < languageIdCount; ++i) {
                    languages[languageIds[i]] = {};
                }

                for (i = 1; i < dataSize; ++i) {
                    fieldData = pageData[i];
                    fieldDataSize = fieldData.length;
                    comments[fieldData[1]] = fieldData[0];
                    for (j = 2; j < fieldDataSize; ++j) {
                        languages[languageIds[j]][fieldData[1]] = fieldData[j];
                    }
                }

                logger.logMessage(MESSAGES[1], logger.STATUS.COMPLETE);

                return {languages, comments};
            });
    }
};

async function init(spreadsheetID, serverID, callback) {
    spreadsheetId = spreadsheetID;
    const auth = await getAuthor();
    const sheets = google.sheets({version: 'v4', auth});
    const spreadsheets  = sheets.spreadsheets;
    const existingSheets = await listSpeadSheets(spreadsheets);
    const sheetIndex = existingSheets.indexOf(serverID);
    return await callback(auth, spreadsheets, sheetIndex !== -1);
}

/**
 * @desc Generate information about author that edit document.
 * @return {Promise<google.auth.OAuth2>}
 */

async function getAuthor() {
    logger.logMessage(MESSAGES[2], logger.STATUS.START);
    const  credentials = JSON.parse(fs.readFileSync(credentialPath, "utf8"));

    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const result = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if(!fs.existsSync(TOKEN_PATH)) {
        const authUrl = result.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const code = readlineSync.question('Enter the code from that page here: ');
        await createToken(code, result);
    }
    else {
        const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH));
        result.setCredentials(tokenData);
    }
    logger.logMessage(MESSAGES[2], logger.STATUS.COMPLETE);
    return result;
}

async function createToken(code, auth) {
    return new Promise( (resolve, reject) => auth.getToken(code, (err, token) => {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            reject(err);
        }
        auth.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve();
    }));
}

/**
 * @desc Return list of sheets in spreadsheet
 * @param {google.sheets.spreadsheets} spreadsheets
 * @return {Promise<string[]>}
 */

async function listSpeadSheets(spreadsheets) {
    return new Promise((resolve, reject) => spreadsheets.get({
            spreadsheetId: spreadsheetId
        }, (err, response) => err ? reject(err) : resolve(response.data.sheets.map(sheet => sheet.properties.title))
    ));
}

/**
 * @desc Create page in spreadsheet
 * @param {google.sheets.spreadsheets} spreadsheets
 * @param {google.auth.OAuth2} auth
 * @param {string} title
 */

async function createPage(spreadsheets, auth, title) {
    logger.logMessage(MESSAGES[3], logger.STATUS.START);
    const request = {
        auth: auth,
        spreadsheetId: spreadsheetId,

        resource: {
            requests: [
                {
                    addSheet: {
                        properties:{
                            title: title
                        }
                    }
                }
            ]
        }
    };

    return new Promise((resolve, reject) => spreadsheets.batchUpdate(request, (err, response) => {
        logger.logMessage(MESSAGES[3], logger.STATUS.START);
        return err ? reject(err) : resolve(response);
    }));
}

async function updateFields(spreadsheets, auth, page, fields) {
    logger.logMessage(MESSAGES[6], logger.STATUS.START);
    return new Promise((resolve, reject) => {

        spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: page + "!A1",
            valueInputOption: 'USER_ENTERED',
            resource: {range: page + "!A1",
                majorDimension: 'ROWS',
                values: fields
            }
        } ,(err, resp) => {

            if (err) {
                console.log('Data Error :', err);
                reject(err);
            }
            logger.logMessage(MESSAGES[6], logger.STATUS.COMPLETE);
            resolve(resp);

        });
    });
}

async function clearSheet(spreadsheets, auth, page) {
    logger.logMessage(MESSAGES[5], logger.STATUS.START);
    return new Promise((resolve, reject) =>
        spreadsheets.values.clear({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: page + "!A1:Z",
            resource: {}
        } ,(err, resp) => {
            logger.logMessage(MESSAGES[5], logger.STATUS.COMPLETE);
            return err ? reject(err) : resolve(resp);
        }));
}

/**
 * Return fields of spreadsheet.
 * @param {google.sheets.spreadsheets} spreadsheets
 * @param {google.auth.OAuth2} auth
 *
 */
async function getFields(spreadsheets, auth, page, cellId) {
    logger.logMessage(MESSAGES[8], logger.STATUS.START);
    return new Promise((resolve, reject) =>
    spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: page + "!A1:" + cellId,
    }, (err, response) => {
        logger.logMessage(MESSAGES[8], logger.STATUS.COMPLETE);
        return err ? reject(err) : resolve(response.data.values);
    }));
}
