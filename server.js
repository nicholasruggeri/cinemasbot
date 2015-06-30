var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();


app.get('/', function(req, res){

    function getQueryVariable(variable){
        var query = req.url,
            vars = query.split("?");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }

    var url = req.url,
        location = getQueryVariable('near'),
        googleUrl;

    googleUrl = 'http://www.google.it/movies?near='+location;




    request(googleUrl, function(error, response, html){


        if(!error){
            var $ = cheerio.load(html);
            var theaters = [];

            $('.theater > .desc > .name a').each(function(index){

                var element = {};
                var data = $(this);

                var name = data.text(),
                    info = data.parent().parent().find('.info').text();

                element.name = name;
                element.info = info;

                theaters.push({theater: element});

            });
        }

        fs.writeFile('output.json', JSON.stringify(theaters, null, 4), function(err){
            console.log('File successfully written! - Check your project directory for the output.json file');
        });

        res.send(JSON.stringify(theaters, null, 4));
    });
});

app.listen(process.env.PORT);
console.log('Magic happens on port ' + process.env.PORT);
exports = module.exports = app;