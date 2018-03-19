const constants = require('../constants');
const axios = require('axios');

function _makeRequest(url, method, body, token) {
    let options = {
        url: url,
        method: method,
        headers: {}
    };

    if (token) {
        options.headers[constants.AUTH_HEADER_NAME] = `${
            constants.BEARER
        } ${token}`;
    }

    if (body) {
        options.headers['Content-Type'] = constants.JSON_HEADER;
        options.data = body;
    }

    return axios(url, options).then(response => {
        return response.data;
    });
}

/**
 * Make get call
 * @param {String} url
 * @param {String} token
 * @returns {Promise<Object>}
 */
function getCall(url, token) {
    return _makeRequest(url, 'get', null, token);
}

/**
 * Make put call
 * @param {String} url
 * @param {Object} body
 * @param {String} token
 * @returns {Promise<Object>}
 */
function putCall(url, body, token) {
    return _makeRequest(url, 'put', body, token);
}

/**
 * Make post call
 * @param {String} url
 * @param {Object} body
 * @param {String} token
 * @returns {Promise<Object>}
 */
function postCall(url, body, token) {
    return _makeRequest(url, 'post', body, token);
}

module.exports = {
    getCall: getCall,
    putCall: putCall,
    postCall: postCall
};
