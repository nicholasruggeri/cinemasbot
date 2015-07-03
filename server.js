var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    cheerio = require('cheerio');

var app = express();
// var token = 'bot118760525:AAFcwJxKeF7pWce47z57NcU4ONBCzR8hDbA';
var token = process.env.TELEGRAM_TOKEN;
var googleUrl;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.post('/', function (req, res) {

    console.log(JSON.stringify(req.body));

    var chat_id = req.body.message.chat.id, // telegram chat ID
        text = req.body.message.text.toLowerCase(), // the text the user has written
        qs = {}; // object containing the query string that will be serialized

    switch(text) {

        /**
         * START THE BOT OR START VOTING
         */
        case '/start':
            console.log('msg');
            qs = {
                reply_markup: JSON.stringify({ "keyboard": [ ["Yes", "No"] ] }),
                chat_id: chat_id,
                text: "Welcome, " + req.body.message.chat.first_name + ", please vote"
            };
        break;
        /**
         * VOTE YES
         */
        case 'yes':
            qs = {
                chat_id: chat_id,
                text: 'You said: ' + text,
                reply_markup: JSON.stringify({"hide_keyboard": true})
            };
        break;
        /**
         * VOTE NO
         */
        case 'no':
            qs = {
                chat_id: chat_id,
                text: 'You said: ' + text,
                reply_markup: JSON.stringify({"hide_keyboard": true})
            };
        break;

    }

    // sent the response message (telegram message)
    request({
        url: 'https://api.telegram.org/bot' + token + '/sendMessage',
        method: 'POST',
        qs: qs
    }, function (err, response, body) {
        if (err) { console.log(err); return; }

        console.log('Got response ' + response.statusCode);
        console.log(body);

        res.send();
    });
});
















app.get('/near', function(req, res){
    location = getQueryVariable('city', req);
    getCinema(location, res);
});

app.get('/theater', function(req, res){
    location = getQueryVariable('city', req);
    theater = getQueryVariable('theater', req);
    getTheater(location, theater, res);
});

app.get('/movie', function(req, res){
    location = getQueryVariable('city', req);
    theater = getQueryVariable('theater', req);
    movie = getQueryVariable('movie', req);
    getMovie(location, theater, movie, res);
});














var getQueryVariable = function(variable, req){
    var query = req.url,
        vars = query.split("?");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

var getCinema = function(location, res){
    googleUrl = 'http://www.google.it/movies?near='+location;
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
                element.name = name;
                // element.link = link;
                // element.info = info;
                theaters.push({theater: element});
            });
        }
        res.send(JSON.stringify(theaters, null, 4));
    });
}

var getTheater = function(location, theater, res){
    googleUrl = 'http://www.google.it/movies?near='+location;
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
                        console.log(name);
                        movies.push({film: element});
                    });
                }
            });
        };
        res.send(JSON.stringify(movies, null, 4));
    });
}

var getMovie = function(location, theater, movie, res){
    googleUrl = 'http://www.google.it/movies?near='+location;
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
                            res.send(responseTimes);
                            return;
                        }
                    });
                }
            });
        };
    });
}



app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
exports = module.exports = app;