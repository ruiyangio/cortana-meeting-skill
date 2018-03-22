function convertToODataFormat(date) {
    let dateStr = `2018-${date.getMonth() + 1}-${date.getDate()}T${_pad(
        date.getHours()
    )}:${_pad(date.getMinutes())}:00Z`;

    return dateStr;
}

function _pad(value) {
    if (value < 10) {
        return '0' + value;
    }

    return JSON.stringify(value);
}

module.exports = {
    convertToODataFormat: convertToODataFormat
};
