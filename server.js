(function() {

    console.log('init')

    var express = require('express'),
        bodyParser = require('body-parser'),
        request = require('request'),
        cheerio = require('cheerio');
        // cinemasBot = require('./cinemasbot');

    var app = express();
    var token = process.env.TELEGRAM_TOKEN;



    var cinemasBot = {

        sendToTelegram: function(token, qs){
            console.log('****** enter sendToTelegram');

            request({
                url: 'https://api.telegram.org/' + token + '/sendMessage',
                method: 'POST',
                qs: qs
            }, function (err, response, body) {
                if (err) { console.log(err); return; }
                console.log('Got response ' + response.statusCode);
                console.log(body);
            });

        },

        getQueryVariable: function(variable, req){
            var query = req.url,
                vars = query.split("?");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
            }
            return(false);
        },

        getCinema: function(location, callback){
            var googleUrl = 'http://www.google.it/movies?near='+location;
            request(googleUrl, function(error, response, html){
                if(!error){
                    var $ = cheerio.load(html);
                    var theaters = [];
                    $('.theater > .desc > .name a').each(function(index){
                        var element = {};
                        var data = $(this);
                        var name = data.text(),
                            info = data.parent().parent().find('.info').text(),
                            link = data.attr('href');
                        element = name;
                        theaters.push([element]);
                    });
                    if (typeof callback == "function")
                        return callback(theaters);
                    else
                        return theaters;
                } else {
                    return 'error';
                }
            });
        }

        getTheater: function(location, theater){
            var googleUrl = 'http://www.google.it/movies?near='+location;
            request(googleUrl, function(error, response, html){
                if(!error){
                    var $ = cheerio.load(html);
                    var movies = [];
                    $('.theater .desc h2.name a').each(function(index){
                        var text = $(this).text()
                        if (decodeURI(text) == decodeURI(theater)){
                            var data = $(this);
                            data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
                                var element = {};
                                var data = $(this);
                                var name = data.find('a').text();
                                element.name = name;
                                movies.push({film: element});
                            });
                        }
                    });
                };
            });
        },

        getMovie: function(location, theater, movie){
            var googleUrl = 'http://www.google.it/movies?near='+location;
            request(googleUrl, function(error, response, html){
                if(!error){
                    var $ = cheerio.load(html);
                    var times = [];
                    $('.theater .desc h2.name a').each(function(index){
                        var text = $(this).text()
                        if (decodeURI(text) == decodeURI(theater)){
                            var data = $(this);
                            data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
                                var text = $(this).find('.name').text();
                                if (decodeURI(text) == decodeURI(movie)){
                                    var data = $(this);
                                    var movieTimes = data.find('.times').text();
                                    var responseTimes = "Gli orari di " + decodeURI(movie) + " sono: " + movieTimes;
                                    return;
                                }
                            });
                        }
                    });
                };
            });
        }

    }












    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.post('/server', function (req) {

        console.log('****** enter server')

        var chat_id = req.body.message.chat.id,
            text = req.body.message.text,
            qs = {}; // object containing the query string that will be serialized

        console.log('******* msg: ', text);

        switch(text) {
            case '/start':
                qs = {
                    chat_id: chat_id,
                    text: "Ciao, " + req.body.message.chat.first_name + ", usa /getcinema o /getfilm per avere le informazioni che preferisci"
                };
                cinemasBot.sendToTelegram(token, qs);
            break;
            case '/reset':
                qs = {
                    reply_markup: JSON.stringify({"hide_keyboard": true}),
                    chat_id: chat_id,
                    text: "Chiudo keyboard"
                };
                // cinemasBot.sendToTelegram(token, qs); commento se no mi fa sclerare :P
            break;
            case '/getcinema':
                cinemasBot.getCinema('bergamo', function(theaters){
                    qs = {
                        reply_markup: JSON.stringify({ "keyboard": theaters}),
                        chat_id: chat_id,
                        text: 'Ecco i risultati'
                    };
                    cinemasBot.sendToTelegram(token, qs);
                });
            break;
        };

    });

    app.listen(process.env.PORT);
    console.log('Magic happens on port ' + process.env.PORT);

}());