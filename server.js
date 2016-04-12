"use strict";

// Dipendenze terze parti
var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    ua = require('universal-analytics');

// Dipendenze
var helpers = require('./helpers/helpers'),
    services = require('./services/services'),
    events = require('./events/events'),
    commands = require('./commands');

var app = express(),
    token = process.env.TELEGRAM_TOKEN,
    visitor = ua(process.env.UA_TOKEN);

var qs = {}; // object containing the query string that will be serialized

var session_request = {},
    session_location = false,
    session_theaters = false,
    session_movies = false,
    session_theater_selected = false;

let user_location;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/', function (req, res) {

    // Log the request body.
    console.log('req',req.message);

    if (req.message !== undefined){

        var chat_id = req.body.message.chat.id,
            user_action = req.body.message.text + " ";

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
                            session_request[chat_id] = false;
                            commands.start(chat_id, req, token)
                            visitor.pageview("/start").send();
                        break;

                        case '/author':
                        case '/creator':
                        case '/dev':
                            session_request[chat_id] = false;
                            commands.creator(chat_id, token)
                            visitor.pageview("/author").send();
                        break;

                        case '/reset':
                        case '/end':
                        case '/quit':
                            session_request[chat_id] = false;
                            session_location = false;
                            commands.reset(chat_id, token)
                            visitor.pageview("/reset").send()
                        break;

                        case '/help':
                        case '/info':
                            commands.info(chat_id, token)
                            visitor.pageview("/help").send();
                        break;

                        case '/getcinema':
                        case '/getc':
                            if (!user_parameter) {
                                commands.notParameter(chat_id, token)
                                visitor.pageview("/getcinema/not-parameter").send();
                            } else {
                                visitor.pageview("/city/" + user_parameter).send();
                                services.getCinema(user_parameter, function(theaters){
                                    if (theaters.length > 0){
                                        session_request[chat_id] = "cinema";
                                        session_location = user_parameter;
                                        session_theaters = theaters;
                                        commands.getCinema(chat_id, token, theaters)
                                        events.sendMessage(token, qs);
                                    } else {
                                        commands.notresults(chat_id, token, user_parameter)
                                        visitor.pageview("/city/" + user_parameter + "/cinemas-not-found").send();
                                    }
                                });
                                visitor.pageview("/getcinema/ok-parameter").send();
                            }
                        break;

                        default:
                            commands.error(chat_id, token)
                            visitor.pageview("/command-not-found").send();

                    }
                } else if (user_action.charAt(0) == '✖') {

                    session_request[chat_id] = false;
                    session_location = false;
                    commands.reset(chat_id, token)
                    visitor.pageview("/reset").send()

                } else {

                    console.log("user NOT send command")

                    if (session_request[chat_id] == "cinema") {
                        // Scelgo cinema dalla lista
                        if (_.flatten(session_theaters).indexOf(req.body.message.text) > -1){
                            // Clicco su un cinema della lista
                            visitor.pageview("/getmovies/option-found").send()

                            session_theater_selected = req.body.message.text;
                            visitor.pageview("/theater/" + session_theater_selected).send();
                            services.getMovies(session_location, req.body.message.text, function(movies){
                                commands.getMovies(chat_id, token, movies)
                                session_request[chat_id] = "movie";
                                session_movies = movies;
                            });
                        } else {
                            visitor.pageview("/getmovies/option-not-found").send();
                            commands.notfound(chat_id, token)
                        }
                    }

                    if (session_request[chat_id] == "movie") {
                        // Scelgo film dalla lista

                        if (_.flatten(session_movies).indexOf(req.body.message.text) > -1){
                            // Clicco su un film della lista
                            visitor.pageview("/gettimes/option-found").send();
                            visitor.pageview("/movie/" + req.body.message.text).send();

                            services.getTimes(session_location, session_theater_selected, req.body.message.text, function(movieTimes){

                                commands.getTimes(chat_id, token, movieTimes)

                            });
                        } else {
                            visitor.pageview("/getmovies/option-not-found").send();
                            commands.notfound(chat_id, token)
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

                        commands.getCinema(chat_id, token, theaters)
                        session_request[chat_id] = "cinema";
                        session_location = user_location;
                        session_theaters = theaters;
                    } else {
                        commands.notresults(chat_id, token, user_parameter)
                        visitor.pageview("/city/" + user_parameter + "/cinemas-not-found-with-location").send();
                    }
                });

            break;

        };

        res.send();

    } else {
        console.log('inline query')
    }



});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
