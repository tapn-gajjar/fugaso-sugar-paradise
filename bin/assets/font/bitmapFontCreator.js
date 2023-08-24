const fs = require('fs');
const path = require('path');

function apply() {
    const folder = "";
    const jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, folder, 'bitmapFontCreator.json')));
    for (let jsonDataKey in jsonData) {
        const json = jsonData[jsonDataKey];

        let height;
        let spaceWidth = json.spaceWidth || 0;
        const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, folder, jsonDataKey + '.json')));
        const chars = [];
        for (let frameName in data.frames) {
            const {frame, sourceSize} = data.frames[frameName];
            if (!height) height = sourceSize.h;
            let id;
            let xMulti = 0.5;
            let yMulti = 0;
            if (json.hasOwnProperty(frameName) && json[frameName].hasOwnProperty("xMulti"))
                xMulti = json[frameName]["xMulti"];
            if (json.hasOwnProperty(frameName) && json[frameName].hasOwnProperty("yMulti"))
                yMulti = json[frameName]["yMulti"];
            let yOffset = Math.round((sourceSize.h - frame.h) * yMulti);
            let xOffset = Math.floor((sourceSize.w - frame.w) * xMulti);
            switch (frameName) {
                case 'comma':
                    id = ','.charCodeAt(0);
                    yOffset = json.commaOffset || yOffset;
                    xOffset = json.commaXOffset || xOffset;
                    break;
                case 'dot':
                    id = '.'.charCodeAt(0);
                    yOffset = json.dotOffset || yOffset;
                    xOffset = json.dotXOffset || xOffset;
                    break;
                default:
                    if (json.hasOwnProperty(frameName) && json[frameName].hasOwnProperty("yOffset"))
                        yOffset = json[frameName]["yOffset"];
                    if (json.hasOwnProperty(frameName) && json[frameName].hasOwnProperty("xOffset"))
                        xOffset = json[frameName]["xOffset"];
                    id = frameName.charCodeAt(0);
                    break;
            }

            const char = `<char id="${id}" x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" xoffset="${xOffset}" yoffset="${yOffset}" xadvance="${sourceSize.w}" page="0" chnl="15" />`;
            chars.push(char);
        }
        if (spaceWidth) chars.push(`<char id="32" x="0" y="0" width="0" height="0" xoffset="0" yoffset="0" xadvance="${spaceWidth}" page="0" chnl="15"/>`);
        const result = `<?xml version="1.0"?><font>
    <info face="${jsonDataKey}" size="${height}" bold="0" italic="0" charset="" unicode="1" stretchH="0" smooth="0" padding="0,0,0,0" spacing="1,1" outline="0"/>
    <common lineHeight="${height}" base="28" scaleW="0" scaleH="0" pages="1" packed="0" alphaChnl="0" redChnl="4" greenChnl="4" blueChnl="4"/>
    <pages><page id="0" file="${jsonDataKey}.png" /></pages>
    <chars count="${chars.length}">${chars.join('')}</chars>
    </font>
    `;
        const destination = path.resolve(folder, jsonDataKey + '.xml');
        fs.writeFileSync(destination, result);
    }
}

apply();