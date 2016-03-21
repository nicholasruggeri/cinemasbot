// Dipendenze terze parti
var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    ua = require('universal-analytics');

// Dipendenze
var helpers = require('./helpers/helpers'),
    services = require('./services/services'),
    events = require('./events/events');

var app = express();
var token = process.env.TELEGRAM_TOKEN;
var visitor = ua(process.env.UA_TOKEN);

var session_request = {},
    session_location = false,
    session_theaters = false,
    session_movies = false,
    session_theater_selected = false;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {

    // Log the request body.
    console.log(req.body);

    var chat_id = req.body.message.chat.id,
        user_action = req.body.message.text + " ",
        qs = {}; // object containing the query string that will be serialized

    switch (helpers.messageType(req)) {
        case 'text':
            console.log("user send text:" + req.body.message.text);
            visitor.pageview("/user-text").send();

            if (helpers.isCommand(user_action)) {
                console.log("user send command");

                var user_command = user_action.split(' ')[0],
                    user_parameter = user_action.substring(user_command.length + 1, user_action.length);

                // Commands
                switch(user_command) {
                    case '/start':
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard": true}),
                            chat_id: chat_id,
                            text: "Hello " + req.body.message.chat.first_name + ",\n send your position or use '/getcinema city' to receive the list of movie theaters near you.\n" + helpers.textResponse.example + "\n\nUse /help for list of commands." + helpers.textResponse.beer,
                            disable_web_page_preview: true
                        };
                        events.sendMessage(token, qs);
                        session_request[chat_id] = false;
                        visitor.pageview("/start").send();
                    break;

                    case '/author':
                    case '/creator':
                    case '/dev':
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard":true}),
                            chat_id: chat_id,
                            text: helpers.textResponse.author
                        };
                        events.sendMessage(token, qs);
                        session_request[chat_id] = false;
                        visitor.pageview("/author").send();
                    break;

                    case '/reset':
                    case '/end':
                    case '/quit':
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard": true}),
                            chat_id: chat_id,
                            text: "Search reset"
                        };
                        events.sendMessage(token, qs);
                        session_request[chat_id] = false;
                        session_location = false;
                        visitor.pageview("/reset").send();
                    break;

                    case '/help':
                    case '/info':
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard": true}),
                            chat_id: chat_id,
                            text: "This is the list of commands: /start /reset /getcinema /help" + helpers.textResponse.beer,
                            disable_web_page_preview: true
                        };
                        events.sendMessage(token, qs);
                        visitor.pageview("/help").send();
                    break;

                    case '/getcinema':
                    case '/getc':
                        if (!user_parameter) {
                            qs = {
                                reply_markup: JSON.stringify({"hide_keyboard": true}),
                                chat_id: chat_id,
                                text: "Add the name of your city after '/getcinema' or send your position.\n" + helpers.textResponse.example
                            };
                            events.sendMessage(token, qs);
                            visitor.pageview("/getcinema/not-parameter").send();
                        } else {
                            visitor.pageview("/city/" + user_parameter).send();
                            services.getCinema(user_parameter, function(theaters){
                                if (theaters.length > 0){
                                    var list_theaters = theaters.slice(0);
                                    list_theaters.push(['✖️']);
                                    qs = {
                                        reply_markup: JSON.stringify({"keyboard": list_theaters,"one_time_keyboard": true, "resize_keyboard": true}),
                                        chat_id: chat_id,
                                        text: 'Choose movie theatre:'
                                    };
                                    session_request[chat_id] = "cinema";
                                    session_location = user_parameter;
                                    session_theaters = theaters;
                                    console.log(theaters);
                                } else {
                                    qs = {
                                        reply_markup: JSON.stringify({"hide_keyboard":true}),
                                        chat_id: chat_id,
                                        text: helpers.textResponse.sorry + user_parameter
                                    };
                                    visitor.pageview("/city/" + user_parameter + "/cinemas-not-found").send();
                                }
                                events.sendMessage(token, qs);
                            });
                            visitor.pageview("/getcinema/ok-parameter").send();
                        }
                    break;

                    default:
                        qs = {
                            reply_markup: JSON.stringify({"hide_keyboard": true}),
                            chat_id: chat_id,
                            text: "Command not found, use /help for list of commands"
                        };
                        events.sendMessage(token, qs);
                        visitor.pageview("/command-not-found").send();
                }
            } else if (user_action.charAt(0) == '✖') {
                console.log("user close keyboard");
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard": true}),
                    chat_id: chat_id,
                    text: "Search closed"
                };
                events.sendMessage(token, qs);
                session_request[chat_id] = false;
                session_location = false;
                visitor.pageview("/reset").send();
            } else {
                console.log("user NOT send command");

                if (session_request[chat_id] == "cinema") {
                    // Scelgo cinema dalla lista
                    if (_.flatten(session_theaters).indexOf(req.body.message.text) > -1){
                        // Clicco su un cinema della lista
                        visitor.pageview("/getmovies/option-found").send();

                        session_theater_selected = req.body.message.text;
                        visitor.pageview("/theater/" + session_theater_selected).send();
                        services.getMovies(session_location, req.body.message.text, function(movies){
                            var list_movies = movies.slice(0);
                            list_movies.push(['✖️']);
                            qs = {
                                reply_markup: JSON.stringify({"keyboard": list_movies, "resize_keyboard": true}),
                                chat_id: chat_id,
                                text: 'Click on the movie you would like to find out showtimes'
                            };
                            events.sendMessage(token, qs);
                            session_request[chat_id] = "movie";
                            session_movies = movies;
                            console.log(movies);
                        });
                    } else {
                        // Scrivo un opzione errata
                        visitor.pageview("/getmovies/option-not-found").send();

                        qs = {
                            chat_id: chat_id,
                            text: helpers.textResponse.hint_keyboard
                        };
                        events.sendMessage(token, qs);
                    }
                }

                if (session_request[chat_id] == "movie") {
                    // Scelgo film dalla lista

                    if (_.flatten(session_movies).indexOf(req.body.message.text) > -1){
                        // Clicco su un film della lista
                        visitor.pageview("/gettimes/option-found").send();
                        visitor.pageview("/movie/" + req.body.message.text).send();

                        services.getTimes(session_location, session_theater_selected, req.body.message.text, function(movieTimes){
                            qs = {
                                chat_id: chat_id,
                                disable_web_page_preview: true,
                                text: movieTimes
                            };
                            events.sendMessage(token, qs);
                        });
                    } else {
                        // Scrivo un opzione errata
                        visitor.pageview("/gettimes/option-not-found").send();

                        qs = {
                            chat_id: chat_id,
                            text: helpers.textResponse.hint_keyboard
                        };
                        events.sendMessage(token, qs);
                    }
                }
            }
        break;

        case 'location':
            console.log("user send location")
            visitor.pageview("/user-location").send();

            user_location = req.body.message.location.latitude + "," + req.body.message.location.longitude;
            services.getCinema(user_location, function(theaters){
                if (theaters.length > 0){
                    var list_theaters = theaters.slice(0);
                    list_theaters.push(['✖️']);
                    qs = {
                        reply_markup: JSON.stringify({"keyboard": list_theaters, "one_time_keyboard": true, "resize_keyboard": true}),
                        chat_id: chat_id,
                        text: 'Choose movie theatre:'
                    };
                    session_request[chat_id] = "cinema";
                    session_location = user_location;
                    session_theaters = theaters;
                } else {
                    qs = {
                        reply_markup: JSON.stringify({"hide_keyboard": true}),
                        chat_id: chat_id,
                        text: helpers.textResponse.sorry + user_location
                    };
                    visitor.pageview("/city/" + user_parameter + "/cinemas-not-found-with-location").send();
                }
                events.sendMessage(token, qs);
            });
        break;
    };

    res.send();
});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
