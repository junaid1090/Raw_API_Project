/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Date: 26/02/2023
 *
 */

// module saffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(404, {
        message: 'Your requested url was not found!',
    });
};

module.exports = handler;
