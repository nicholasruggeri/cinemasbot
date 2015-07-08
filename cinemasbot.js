var request = require('request'),
    cheerio = require('cheerio');

module.exports = {

    sendMessage: function(token, qs){
        console.log('****** enter sendMessage');
        request({
            url: 'https://api.telegram.org/' + token + '/sendMessage',
            method: 'POST',
            qs: qs
        }, function (err, response, body) {
            if (err) {
                console.log(err); return;
            }
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
        console.log('****** enter getCinema');
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
    },

    getMovies: function(location, theater, callback){
        console.log('****** enter getMovies');
        var googleUrl = 'http://www.google.it/movies?near='+location;
        request(googleUrl, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                var movies = [];
                $('.theater .desc h2.name a').each(function(index){
                    var text = $(this).text()
                    if (text == theater){
                        var data = $(this);
                        data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
                            var element = {};
                            var data = $(this);
                            var name = data.find('.name a').text();
                            element = name;
                            movies.push([element]);
                        });
                    }
                });
                if (typeof callback == "function"){
                    return callback(movies);
                } else {
                    return movies;
                }
            } else {
                return 'error';
            }
        });
    },

    getTimes: function(location, theater, movie, callback){
        console.log('****** enter getTimes');
        var googleUrl = 'http://www.google.it/movies?near='+location;
        request(googleUrl, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                $('.theater .desc h2.name a').each(function(){
                    var text = $(this).text()
                    if (text == theater){
                        var data = $(this);
                        data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
                            var text = $(this).find('.name a').text();
                            if (text == movie){
                                var data = $(this);
                                var movieTimes = data.find('.times').text();
                                var responseTimes = "The show times for " + decodeURI(movie) + " are: " + movieTimes;
                                if (typeof callback == "function")
                                    return callback(responseTimes);
                                else
                                    return responseTimes;
                            }
                        });
                    }
                });
            } else {
                return 'error';
            }
        });
    }
}