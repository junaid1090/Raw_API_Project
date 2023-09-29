/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Date: 26/02/2023
 *
 */

// module saffolding
const handler = {};

handler.simpleHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'This is sample url',
    });
};

module.exports = handler;
