var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    cinemasBot = require('./cinemasbot');

var app = express();
var token = process.env.TELEGRAM_TOKEN;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var session_request = false,
    session_location = false,
    session_theaters = false;


app.post('/', function (req, res) {

    var chat_id = req.body.message.chat.id,
        user_action = req.body.message.text + " ",
        user_command = user_action.split(' ')[0],
        user_parameter = user_action.substring(user_command.length+1, user_action.length),
        qs = {}; // object containing the query string that will be serialized



    console.log('******* user_action: ', user_action);
    console.log('******* user_command: ', user_command);
    console.log('******* user_parameter: ', user_parameter);
    console.log('******* session_request: ', session_request);


    if (user_command.charAt(0) == '/') {
        // Commands
        switch(user_command) {
            case '/start':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Ciao " + req.body.message.chat.first_name + ", utilizza /getcinema seguito dalla tua città per ricevere la lista dei teatri e dei film nella tua zona"
                };
                cinemasBot.sendMessage(token, qs);
                break;

            case '/reset':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Ricerca resettata"
                };
                cinemasBot.sendMessage(token, qs);
                session_request = false;
                session_location = false;
                break;

            case '/getcinema':
                if (!user_parameter){
                    qs = {
                        reply_markup: JSON.stringify({"hide_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Aggiungi una città dopo /getcinema'
                    };
                    cinemasBot.sendMessage(token, qs);
                } else {
                    cinemasBot.getCinema(user_parameter, function(theaters){
                        qs = {
                            reply_markup: JSON.stringify({"keyboard": theaters,"one_time_keyboard": true,"resize_keyboard": true}),
                            chat_id: chat_id,
                            text: 'Scegli il cinema:'
                        };
                        cinemasBot.sendMessage(token, qs);
                        session_request = true;
                        session_location = user_parameter;
                        session_theaters = theaters;
                        console.log('******* session_request: ', session_request);
                    });
                }
                break;
        }

    } else {
        if (session_request) {
            if (_.flatten(session_theaters).indexOf(req.body.message.text) > -1){
                cinemasBot.getMovies(session_location, req.body.message.text, function(movies){
                    qs = {
                        reply_markup: JSON.stringify({"keyboard": movies,"one_time_keyboard": true,"resize_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Clicca sul film per saperne gli orari'
                    };
                    cinemasBot.sendMessage(token, qs);
                    // session_request = false;
                    // session_location = false;
                });
            } else {
                qs = {
                    chat_id: chat_id,
                    text: 'Usa la tastiera con le opzioni per rispondere'
                };
                cinemasBot.sendMessage(token, qs);
            }
        }
    }


    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
