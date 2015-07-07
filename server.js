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
        user_action = [req.body.message.text],
        user_command = user_action.split(' ')[0],
        user_parameter = user_action.substring(user_command.length+1, user_action.length),
        qs = {}; // object containing the query string that will be serialized

    console.log('******* user_action: ', user_action);
    console.log('******* user_command: ', user_command);
    console.log('******* user_parameter: ', user_parameter);

    switch(user_command) {
        case '/start':
            qs = {
                reply_markup: JSON.stringify({"hide_keyboard": true}),
                chat_id: chat_id,
                text: "Ciao " + req.body.message.chat.first_name + ", utilizza /getcinema seguito dalla tua città per ricevere la lista dei teatri e dei film della tua zona"
            };
            cinemasBot.sendMessage(token, qs);
        break;
        case '/getcinema':
            if (!user_parameter){
                cinemasBot.getCinema(user_parameter, function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({"hide_keyboard": true}),
                        reply_to_message_id: req.body.message.id,
                        chat_id: chat_id,
                        text: 'Aggiungi una città dopo /getcinema'
                    };
                    cinemasBot.sendMessage(token, qs);
                });
            } else {
                cinemasBot.getCinema(user_parameter, function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({ "keyboard": theaters, "one_time_keyboard": true, "selective": true}),
                        reply_to_message_id: req.body.message.id,
                        chat_id: chat_id,
                        text: 'Scegli il cinema:'
                    };
                    cinemasBot.sendMessage(token, qs);
                });
            }
        break;
    };

    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
