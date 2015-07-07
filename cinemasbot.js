var request = require('request'),
    cheerio = require('cheerio');

module.exports = {

    sendToTelegram: function(token, qs, res){
        console.log('****** enter sendToTelegram');
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

            res.send();
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
}


    // getTheater: function(location, theater, res){
    //     var googleUrl = 'http://www.google.it/movies?near='+location;
    //     request(googleUrl, function(error, response, html){
    //         if(!error){
    //             var $ = cheerio.load(html);
    //             var movies = [];
    //             $('.theater .desc h2.name a').each(function(index){
    //                 var text = $(this).text()
    //                 if (decodeURI(text) == decodeURI(theater)){
    //                     var data = $(this);
    //                     data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
    //                         var element = {};
    //                         var data = $(this);
    //                         var name = data.find('a').text();
    //                         element.name = name;
    //                         movies.push({film: element});
    //                     });
    //                 }
    //             });
    //         };
    //         // res.send(JSON.stringify(movies, null, 4));
    //     });
    // },

    // getMovie: function(location, theater, movie, res){
    //     var googleUrl = 'http://www.google.it/movies?near='+location;
    //     request(googleUrl, function(error, response, html){
    //         if(!error){
    //             var $ = cheerio.load(html);
    //             var times = [];
    //             $('.theater .desc h2.name a').each(function(index){
    //                 var text = $(this).text()
    //                 if (decodeURI(text) == decodeURI(theater)){
    //                     var data = $(this);
    //                     data.parent().parent().siblings('.showtimes').find('.movie').each(function(){
    //                         var text = $(this).find('.name').text();
    //                         if (decodeURI(text) == decodeURI(movie)){
    //                             var data = $(this);
    //                             var movieTimes = data.find('.times').text();
    //                             var responseTimes = "Gli orari di " + decodeURI(movie) + " sono: " + movieTimes;
    //                             res.send(responseTimes);
    //                             return;
    //                         }
    //                     });
    //                 }
    //             });
    //         };
    //     });
    // }