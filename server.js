(function(exports) {

    var express = require('express'),
        bodyParser = require('body-parser'),
        request = require('request'),
        cheerio = require('cheerio'),
        cinemasBot = require('./cinemasbot');

    var app = express();
    var token = 'bot118760525:AAFcwJxKeF7pWce47z57NcU4ONBCzR8hDbA';
    // var token = process.env.TELEGRAM_TOKEN;

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.post('/', function (req, res) {

        var chat_id = req.body.message.chat.id, // telegram chat ID
            // text = req.body.message.text.toLowerCase(). // the text the user has written
            text = req.body.message.text, // the text the user has written
            qs = {}; // object containing the query string that will be serialized

        switch(text) {

            /**
             * START THE BOT
             */
            case '/start':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard": true}),
                    chat_id: chat_id,
                    text: "Ciao, " + req.body.message.chat.first_name + ", usa /getcinema o /getfilm per avere le informazioni che preferisci"
                };
                request({
                    url: 'https://api.telegram.org/' + token + '/sendMessage',
                    method: 'POST',
                    qs: qs
                }, function (err, response, body) {
                    if (err) { console.log(err); return; }

                    console.log('Got response ' + response.statusCode);
                    console.log(body);

                    res.send();
                });
            break;

            case '/reset':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard": true}),
                    chat_id: chat_id,
                    text: "Reset keyboard"
                };
                request({
                    url: 'https://api.telegram.org/' + token + '/sendMessage',
                    method: 'POST',
                    qs: qs
                });
            break;

            case '/getcinema':
                var results;
                cinemasBot.getCinema('bergamo', function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({ "keyboard": theaters}),
                        chat_id: chat_id,
                        text: 'Ecco i risultati'
                    };
                    request({
                        url: 'https://api.telegram.org/' + token + '/sendMessage',
                        method: 'POST',
                        qs: qs
                    }, function (err, response, body) {
                        if (err) { console.log(err); return; }

                        // console.log('Got response ' + response.statusCode);
                        // console.log(body);

                        res.send();
                    });
                })
            break;

        }
    });

    app.get('/near', function(req, res){
        location = cinemasBot.getQueryVariable('city', req);
        cinemasBot.getCinema(location, function(theaters){
            console.log(theaters);
        });
    });

    app.get('/theater', function(req, res){
        location = cinemasBot.getQueryVariable('city', req);
        theater = cinemasBot.getQueryVariable('theater', req);
        getTheater(location, theater, res);
    });

    app.get('/movie', function(req, res){
        location = cinemasBot.getQueryVariable('city', req);
        theater = cinemasBot.getQueryVariable('theater', req);
        movie = cinemasBot.getQueryVariable('movie', req);
        getMovie(location, theater, movie, res);
    });

    app.listen(process.env.PORT);
    console.log('Magic happens on port ' + process.env.PORT);

}());


