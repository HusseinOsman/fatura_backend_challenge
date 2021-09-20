const fs = require('fs');
const path = require("path");

module.exports = async function (models) {
    const seedsFld = __dirname + '/seeds'
    fs.readdirSync(seedsFld)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(async function (file) {
            const model = file.split('.').slice(0, -1).join('.')
            const seedFile = fs.readFileSync(path.join(seedsFld, file));
            const data = JSON.parse(seedFile) || [];

            const count = await models[model].count();
            if (!count) {
                await models[model].createEach(data);
            }

        });

    return true;
};