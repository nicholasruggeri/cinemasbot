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

    console.log('****** enter server');

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

        if (user_command == '/start') {
            qs = {
                reply_markup: JSON.stringify({"hide_keyboard":true}),
                chat_id: chat_id,
                text: "Ciao " + req.body.message.chat.first_name + ", utilizza /getcinema seguito dalla tua città per ricevere la lista dei teatri e dei film nella tua zona"
            };
            cinemasBot.sendMessage(token, qs);
        } else if (user_command == '/getcinema'){
            if (!user_parameter){
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard": true}),
                    chat_id: chat_id,
                    text: 'Aggiungi una città dopo /getcinema'
                };
                cinemasBot.sendMessage(token, qs);
            } else {
                console.log('******* session_request: ', session_request);
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
        }

    } else {
        console.log('other command');
        console.log('******* session_request: ', session_request);
        if (session_request) {
            // inserire controllo se user_action == session_theaters[i]
            if (_.flatten(session_theaters).indexOf(user_action) > -1){
                console.log('click keyboard');
            } else {
                console.log(_.flatten(session_theaters));
            }


            // cinemasBot.getMovies(session_location, user_action, function(movies){
            //     qs = {
            //         reply_markup: JSON.stringify({"keyboard": movies,"one_time_keyboard": true,"resize_keyboard": true}),
            //         chat_id: chat_id,
            //         text: 'Clicca sul film per saperne gli orari'
            //     };
            //     console.log('MOVIES', movies);
            //     cinemasBot.sendMessage(token, qs);
            //     session_request = false;
            //     session_location = false;
            // });
        }
    }


    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
