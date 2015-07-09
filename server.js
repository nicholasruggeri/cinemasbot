var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    ua = require('universal-analytics'),
    cinemasBot = require('./cinemasbot');

var app = express();
var token = process.env.TELEGRAM_TOKEN;
var visitor = ua(process.env.UA_TOKEN);

var session_request = false,
    session_location = false,
    session_theaters = false,
    session_movies = false,
    session_theater_selected = false;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {

    var chat_id = req.body.message.chat.id,
        user_action = req.body.message.text + " ",
        qs = {}; // object containing the query string that will be serialized

    if (user_action.charAt(0) == '/') {

        var user_command = user_action.split(' ')[0],
            user_parameter = user_action.substring(user_command.length+1, user_action.length);

        console.log('*** - COMMAND - Name: ' + req.body.message.chat.first_name);
        console.log('*** - COMMAND: '+user_command+' - Name: ' + req.body.message.chat.first_name);
        console.log('*** - PARAMETER: '+user_parameter+' - Name: ' + req.body.message.chat.first_name);

        // Commands
        switch(user_command) {
            case '/start':

                console.log('*** - COMMAND: /START - Name: ' + req.body.message.chat.first_name);

                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Hello " + req.body.message.chat.first_name + ", use '/getcinema' followed by the name of your town to receive the list of movie theaters near you.  Use /help for list of commands. \n If you found @CinemasBot useful, buy us a beer! Paypal: http://tinyurl.com/beer-for-cinemasbot",
                    disable_web_page_preview: true
                };
                cinemasBot.sendMessage(token, qs);
                session_request = false;
                visitor.pageview("/start").send();
                break;

            case '/author':
            case '/creator':
            case '/dev':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "The creator of this amazing Bot is the brilliant @nicksruggeri"
                };
                cinemasBot.sendMessage(token, qs);
                session_request = false;
                visitor.pageview("/author").send();
                break;

            case '/reset':
            case '/end':
            case '/quit':
                console.log('*** - COMMAND: /RESET - Name: ' + req.body.message.chat.first_name);
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Search reset"
                };
                cinemasBot.sendMessage(token, qs);
                session_request = false;
                session_location = false;
                visitor.pageview("/reset").send();
                break;

            case '/help':
            case '/info':
                console.log('*** - COMMAND: /HELP - Name: ' + req.body.message.chat.first_name);
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "This is the list of commands: \n /start\n /reset\n /getcinema\n /help \n If you found @CinemasBot useful, buy us a beer! Paypal: http://tinyurl.com/beer-for-cinemasbot",
                    disable_web_page_preview: true
                };
                cinemasBot.sendMessage(token, qs);
                visitor.pageview("/help").send();
                break;

            case '/getcinema':
                if (!user_parameter){
                    console.log('*** - COMMAND: /GETCINEMA NOT PARAMETER- Name: ' + req.body.message.chat.first_name);
                    qs = {
                        reply_markup: JSON.stringify({"hide_keyboard": true}),
                        chat_id: chat_id,
                        text: "Add the name of your city after '/getcinema'. Ex: '/getcinema Venezia'"
                    };
                    cinemasBot.sendMessage(token, qs);
                } else {
                    console.log('*** - COMMAND: /GETCINEMA '+user_parameter+' - Name: ' + req.body.message.chat.first_name);
                    cinemasBot.getCinema(user_parameter, function(theaters){
                        if (theaters.length > 0){
                            qs = {
                                reply_markup: JSON.stringify({"keyboard": theaters,"one_time_keyboard": true,"resize_keyboard": true}),
                                chat_id: chat_id,
                                text: 'Choose movie theatre:'
                            };
                            session_request = "cinema";
                            session_location = user_parameter;
                            session_theaters = theaters;
                        } else {
                            qs = {
                                reply_markup: JSON.stringify({"hide_keyboard":true}),
                                chat_id: chat_id,
                                text: 'Sorry, cinemas not found in ' + user_parameter
                            };
                        }
                        cinemasBot.sendMessage(token, qs);
                    });
                    visitor.pageview("/city/" + session_location).send();
                }
                break;

            default:
                console.log('*** - ERROR COMMAND: - Name: ' + req.body.message.chat.first_name);
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Command not found, use /help for list of commands"
                };
                cinemasBot.sendMessage(token, qs);
                visitor.pageview("/error-command").send();

        }

    } else {

        if (session_request == "cinema") {
            if (_.flatten(session_theaters).indexOf(req.body.message.text) > -1){
                console.log('*** STEP 2 - CHOOSE CINEMA - Name: ' + req.body.message.chat.first_name);
                session_theater_selected = req.body.message.text;
                cinemasBot.getMovies(session_location, req.body.message.text, function(movies){
                    qs = {
                        reply_markup: JSON.stringify({"keyboard": movies,"resize_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Click on the movie you would like to find out showtimes'
                    };
                    cinemasBot.sendMessage(token, qs);
                    session_request = "movie";
                    session_movies = movies;
                });
                visitor.pageview("/getcinema/"+ session_location + "/" + session_theater_selected ).send();
            } else {
                console.log('*** STEP 2 - CHOOSE CINEMA ERROR - Name: ' + req.body.message.chat.first_name);
                qs = {
                    chat_id: chat_id,
                    text: 'Use your keyboard with these options to reply'
                };
                cinemasBot.sendMessage(token, qs);
                visitor.pageview("/getcinema/error").send();
            }
        }
        if (session_request == "movie") {

            if (_.flatten(session_movies).indexOf(req.body.message.text) > -1){
                console.log('*** STEP 3 - CHOOSE MOVIE - Name: ' + req.body.message.chat.first_name);
                cinemasBot.getTimes(session_location, session_theater_selected, req.body.message.text, function(movieTimes){
                    qs = {
                        chat_id: chat_id,
                        text: movieTimes
                    };
                    cinemasBot.sendMessage(token, qs);
                    visitor.pageview("/getmovie/"+ session_location + "/"+ session_theater_selected +"/"+ req.body.message.text).send();
                });
            } else {
                console.log('*** STEP 3 - CHOOSE MOVIE ERROR - Name: ' + req.body.message.chat.first_name);
                qs = {
                    chat_id: chat_id,
                    text: 'Use your keyboard with these options to reply'
                };
                cinemasBot.sendMessage(token, qs);
                visitor.pageview("/getmovie/error").send();
            }
        }
    }

    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
