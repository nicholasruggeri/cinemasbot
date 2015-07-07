var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    cheerio = require('cheerio'),
    cinemasBot = require('./cinemasbot');

var app = express();
var token = process.env.TELEGRAM_TOKEN;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {

    console.log('****** enter server');

    var chat_id = req.body.message.chat.id,
        text = req.body.message.text,
        qs = {}; // object containing the query string that will be serialized

    console.log('******* msg: ', text);

    switch(text) {
        case '/start':
            qs = {
                chat_id: chat_id,
                text: "Ciao, " + req.body.message.chat.first_name
            };
            cinemasBot.sendToTelegram(token, qs, res);
        break;
        case '/getcinema':
            cinemasBot.getCinema('bergamo', function(theaters){
                qs = {
                    reply_markup: JSON.stringify({ "keyboard": theaters}),
                    one_time_keyboard: true,
                    chat_id: chat_id,
                    text: 'Ecco i risultati'
                };
                cinemasBot.sendToTelegram(token, qs, res);
            });
        break;
    };

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
