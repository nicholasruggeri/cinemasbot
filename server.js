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
        user_action = req.body.message.text.split(" "),
        user_command = user_action[0];
        user_parameter = user_action.pop.join(" ");
        qs = {}; // object containing the query string that will be serialized

    console.log('******* user_command: ', user_command);
    console.log('******* user_parameter: ', user_command);

    switch(user_command) {
        case '/start':
            qs = {
                reply_markup: JSON.stringify({"hide_keyboard": true}),
                chat_id: chat_id,
                text: "Ciao " + req.body.message.chat.first_name + ", utilizza /getcinema seguito dalla tua città per ricevere la lista dei teatri e dei film della tua zona"
            };
            cinemasBot.sendToTelegram(token, qs);
        break;
        case '/getcinema':
            if (!user_parameter){
                cinemasBot.getCinema(user_parameter, function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({"hide_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Aggiungi una città dopo /getcinema'
                    };
                    cinemasBot.sendToTelegram(token, qs);
                });
            } else {
                cinemasBot.getCinema(user_parameter, function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({ "keyboard": theaters, "one_time_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Scegli il cinema:'
                    };
                    cinemasBot.sendToTelegram(token, qs);
                });
            }
        break;
    };

    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
