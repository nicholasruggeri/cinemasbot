var request = require('request');

module.exports = {

    sendMessage: function(token, qs){
        request({
            url: 'https://api.telegram.org/' + token + '/sendMessage',
            method: 'POST',
            qs: qs
        }, function (err, response, body) {
            if (err) {
                console.log("ERROR SENDMESSAGE", err); return;
            }
        });
    }

}