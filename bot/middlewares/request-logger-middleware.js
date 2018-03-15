module.exports = function requestMiddleWare(req, res, next) {
    if (req.body) {
        console.log(req.body);
    }
    else {
        let requestData = '';

        req.on('data', chunk => {
            requestData += chunk;
        });

        req.on('end', () => {
            try {
                console.log(JSON.parse(requestData));
            }    
            catch (err) {
                console.log('Request Logger: receive - invalid request data received.');
                res.send(400);
                res.end();
                return;
            }
        });
    }
    return next();
}
