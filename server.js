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
        user_action = req.body.message.text,
        user_command = user_action.split(' ')[0];
        user_parameter = user_action.split(' ')[1] || false;
        qs = {}; // object containing the query string that will be serialized

    console.log('******* msg: ', user_command);

    switch(user_command) {
        case '/start':
            qs = {
                reply_markup: JSON.stringify({"hide_keyboard": true}),
                chat_id: chat_id,
                text: "Ciao, " + req.body.message.chat.first_name
            };
            cinemasBot.sendToTelegram(token, qs);
        break;
        case '/getcinema':
            cinemasBot.getCinema(user_parameter, function(theaters){
                qs = {
                    reply_markup: JSON.stringify({ "keyboard": theaters, "one_time_keyboard": true}),
                    chat_id: chat_id,
                    text: user_parameter ? 'Ecco i risultati' : 'Controlla il comando'
                };
                cinemasBot.sendToTelegram(token, qs);
            });
        break;
        case 'Capitol Multisala':
            cinemasBot.getCinema('treviso', function(theaters){
                qs = {
                    chat_id: chat_id,
                    text: 'Ecco i risultati di treviso \n test a capo'
                };
                cinemasBot.sendToTelegram(token, qs);
            });
        break;
    };

    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
