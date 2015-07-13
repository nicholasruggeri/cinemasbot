var express = require('express'),
    request = require('request'),
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

var text_response = {
    beer: "\n\nIf you found @CinemasBot useful, buy us a 🍺!\nPaypal: http://tinyurl.com/beer-for-cinemasbot",
    author: "The creator of this amazing Bot is the brilliant @nicksruggeri 😎",
    hint_keyboard: "Use your keyboard with these options to reply",
    example: "Ex: /getcinema Venezia"
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {

    var chat_id = req.body.message.chat.id,
        user_action = req.body.message.text + " ",
        qs = {}; // object containing the query string that will be serialized

    switch (cinemasBot.typeMessage(req)) {
        case 'text':
            console.log("user send text")
            visitor.pageview("/user-text").send();

            if (user_action.charAt(0) == '/') {

                var user_command = user_action.split(' ')[0],
                    user_parameter = user_action.substring(user_command.length+1, user_action.length);

                // Commands
                switch(user_command) {
                    case '/start':
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard":true}),
                            chat_id: chat_id,
                            text: "Hello " + req.body.message.chat.first_name + ",\n send your position or use '/getcinema city' to receive the list of movie theaters near you.\n" + text_response.example + "\n\nUse /help for list of commands." + text_response.beer,
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
                            text: text_response.author
                        };
                        cinemasBot.sendMessage(token, qs);
                        session_request = false;
                        visitor.pageview("/author").send();
                        break;

                    case '/reset':
                    case '/end':
                    case '/quit':
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
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard":true}),
                            chat_id: chat_id,
                            text: "This is the list of commands: /start /reset /getcinema /help" + text_response.beer,
                            disable_web_page_preview: true
                        };
                        cinemasBot.sendMessage(token, qs);
                        visitor.pageview("/help").send();
                        break;

                    case '/getcinema':
                    case '/getc':
                        if (!user_parameter){
                            qs = {
                                reply_markup: JSON.stringify({"hide_keyboard": true}),
                                chat_id: chat_id,
                                text: "Add the name of your city after '/getcinema' or send your position.\n" + text_response.example
                            };
                            cinemasBot.sendMessage(token, qs);
                            visitor.pageview("/getcinema/not-parameter").send();
                        } else {
                            visitor.pageview("/city/"+user_parameter).send();
                            cinemasBot.getCinema(user_parameter, function(theaters){
                                if (theaters.length > 0){
                                    var list_theaters = theaters.slice(0);
                                    list_theaters.push(['✖️']);
                                    qs = {
                                        reply_markup: JSON.stringify({"keyboard": list_theaters,"one_time_keyboard": true,"resize_keyboard": true}),
                                        chat_id: chat_id,
                                        text: 'Choose movie theatre:'
                                    };
                                    session_request = "cinema";
                                    session_location = user_parameter;
                                    session_theaters = theaters;
                                    console.log(theaters);
                                } else {
                                    qs = {
                                        reply_markup: JSON.stringify({"hide_keyboard":true}),
                                        chat_id: chat_id,
                                        text: 'Sorry, cinemas not found in ' + user_parameter
                                    };
                                    visitor.pageview("/city/"+user_parameter+"/cinemas-not-found").send();
                                }
                                cinemasBot.sendMessage(token, qs);
                            });
                            visitor.pageview("/getcinema/ok-parameter").send();
                        }
                        break;

                    default:
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard":true}),
                            chat_id: chat_id,
                            text: "Command not found, use /help for list of commands"
                        };
                        cinemasBot.sendMessage(token, qs);
                        visitor.pageview("/command-not-found").send();
                }
            } else if (user_action.charAt(0) == '✖') {
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard":true}),
                    chat_id: chat_id,
                    text: "Search closed"
                };
                cinemasBot.sendMessage(token, qs);
                session_request = false;
                session_location = false;
                visitor.pageview("/reset").send();
            } else {

                if (session_request == "cinema") {

                    // Scelgo cinema dalla lista

                    if (_.flatten(session_theaters).indexOf(req.body.message.text) > -1){

                        // Clicco su un cinema della lista
                        visitor.pageview("/getmovies/option-found").send();

                        session_theater_selected = req.body.message.text;
                        visitor.pageview("/theater/"+session_theater_selected).send();
                        cinemasBot.getMovies(session_location, req.body.message.text, function(movies){
                            var list_movies = movies.slice(0);
                            list_movies.push(['✖️']);
                            qs = {
                                reply_markup: JSON.stringify({"keyboard": list_movies,"resize_keyboard": true}),
                                chat_id: chat_id,
                                text: 'Click on the movie you would like to find out showtimes'
                            };
                            cinemasBot.sendMessage(token, qs);
                            session_request = "movie";
                            session_movies = movies;
                            console.log(movies);
                        });
                    } else {

                        // Scrivo un opzione errata
                        visitor.pageview("/getmovies/option-not-found").send();

                        qs = {
                            chat_id: chat_id,
                            text: text_response.hint_keyboard
                        };
                        cinemasBot.sendMessage(token, qs);
                    }
                }
                if (session_request == "movie") {

                    // Scelgo film dalla lista

                    if (_.flatten(session_movies).indexOf(req.body.message.text) > -1){

                        // Clicco su un film della lista
                        visitor.pageview("/gettimes/option-found").send();
                        visitor.pageview("/movie/"+req.body.message.text).send();

                        cinemasBot.getTimes(session_location, session_theater_selected, req.body.message.text, function(movieTimes){
                            qs = {
                                chat_id: chat_id,
                                text: movieTimes
                            };
                            cinemasBot.sendMessage(token, qs);
                        });
                    } else {

                        // Scrivo un opzione errata
                        visitor.pageview("/gettimes/option-not-found").send();

                        qs = {
                            chat_id: chat_id,
                            text: text_response.hint_keyboard
                        };
                        cinemasBot.sendMessage(token, qs);
                    }
                }
            }

            break;

        case 'location':
            console.log("user send location")
            visitor.pageview("/user-location").send();

            user_location = req.body.message.location.latitude + "," + req.body.message.location.longitude;
            cinemasBot.getCinema(user_location, function(theaters){
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
                cinemasBot.sendMessage(token, qs);
            });
            break;
    };


    res.send();

});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
