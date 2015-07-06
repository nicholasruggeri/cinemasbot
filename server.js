(function(exports) {

    var express = require('express'),
        bodyParser = require('body-parser'),
        request = require('request'),
        cheerio = require('cheerio'),
        cinemasBot = require('./cinemasbot');

    var app = express();
    // var token = 'bot118760525:AAFcwJxKeF7pWce47z57NcU4ONBCzR8hDbA';
    var token = process.env.TELEGRAM_TOKEN;


    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.post('/', function (req, res) {

        var chat_id = req.body.message.chat.id, // telegram chat ID
            text = req.body.message.text, // the text the user has written
            qs = {}; // object containing the query string that will be serialized

        if (text == "/start") {
            console.log('start');
            cinemasBot.getCinema('bergamo', function(theaters){
                console.log('theaters', theater);
                qs = {
                    chat_id: chat_id,
                    text: 'Ciao'
                };
                cinemasBot.sendToTelegram(token, qs);
            });
        } else {
            console.log('nope');
        }



    });

    // app.get('/near', function(req, res){
    //     location = cinemasBot.getQueryVariable('city', req);
    //     cinemasBot.getCinema(location, function(theaters){
    //         console.log(theaters);
    //     });
    // });

    // app.get('/theater', function(req, res){
    //     location = cinemasBot.getQueryVariable('city', req);
    //     theater = cinemasBot.getQueryVariable('theater', req);
    //     getTheater(location, theater, res);
    // });

    // app.get('/movie', function(req, res){
    //     location = cinemasBot.getQueryVariable('city', req);
    //     theater = cinemasBot.getQueryVariable('theater', req);
    //     movie = cinemasBot.getQueryVariable('movie', req);
    //     getMovie(location, theater, movie, res);
    // });

    app.listen(process.env.PORT);
    console.log('Magic happens on port ' + process.env.PORT);

}());


