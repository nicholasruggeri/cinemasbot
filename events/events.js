var request = require('request');
var ua = require('universal-analytics');

// Dipendenze
// var events = require('./events/events');

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
    },

    sendListCinema: function (theaters) {

        if (theaters.length > 0){
            var list_theaters = theaters.slice(0);
            list_theaters.push(['✖️']);
            qs = {
                reply_markup: JSON.stringify({"keyboard": list_theaters,"one_time_keyboard": true,"resize_keyboard": true}),
                chat_id: chat_id,
                text: 'Choose movie theatre:'
            };
            session_request = "cinema";
            session_location = user_location;
            session_theaters = theaters;
        } else {
            qs = {
                reply_markup: JSON.stringify({"hide_keyboard":true}),
                chat_id: chat_id,
                text: 'Sorry, cinemas not found in ' + user_location
            };
            visitor.pageview("/city/"+user_parameter+"/cinemas-not-found-with-location").send();
        }
        sendMessage(token, qs);

    }

}