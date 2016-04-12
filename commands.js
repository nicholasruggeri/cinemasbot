var helpers = require('./helpers/helpers'),
    events = require('./events/events')

module.exports = {

    error: (chat_id, token) => {
        console.log('error command')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: "Command not found, use /help for list of commands"
        };
        events.sendMessage(token, qs)
    },

    notresults: (chat_id, token, user_parameter) => {
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard":true}),
            chat_id: chat_id,
            text: helpers.textResponse.sorry + user_parameter
        };
        events.sendMessage(token, qs);
    },

    notfound: (chat_id, token) => {
        qs = {
            chat_id: chat_id,
            text: helpers.textResponse.hint_keyboard
        };
        events.sendMessage(token, qs)
    },

    start: (chat_id, req, token) => {
        var user_name = req.body.message.chat.first_name;
        console.log('user start bot')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: "Hello " + user_name + ".\nNew features, update your Telegram if you have not done yet!\nUse /getcinema to receive the list of movie theaters near you.\n\nUse /help for list of commands.",
            disable_web_page_preview: true
        };
        events.sendMessage(token, qs)
    },

    reset: (chat_id, token) => {
        console.log('user reset command')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: "Search closed"
        };
        events.sendMessage(token, qs)
    },

    info: (chat_id, token) => {
        console.log('user get info')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: "This is the list of commands: /start /reset /getcinema /help" + helpers.textResponse.beer,
            disable_web_page_preview: true
        };
        events.sendMessage(token, qs)
    },

    creator: (chat_id, token) => {
        console.log('user get creator')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard":true}),
            chat_id: chat_id,
            text: helpers.textResponse.author
        };
        events.sendMessage(token, qs)
    },

    getMovies: (chat_id, token, movies) => {
        console.log('user get movies')
        var list_movies = movies.slice(0);
        list_movies.push(['✖️']);
        qs = {
            reply_markup: JSON.stringify({"keyboard": list_movies, "resize_keyboard": true}),
            chat_id: chat_id,
            text: 'Click on the movie you would like to find out showtimes'
        };
        events.sendMessage(token, qs);
    },

    getTimes: (chat_id, token, movieTimes) => {
        console.log('user get times')
        qs = {
            chat_id: chat_id,
            disable_web_page_preview: true,
            text: movieTimes
        };
        events.sendMessage(token, qs);
    },

    getCinema: (chat_id, token, theaters) => {
        console.log('user get theaters')
        var list_theaters = theaters.slice(0);
        list_theaters.push(['✖️']);
        qs = {
            reply_markup: JSON.stringify({"keyboard": list_theaters, "one_time_keyboard": true, "resize_keyboard": true}),
            chat_id: chat_id,
            text: 'Great! Now choose an option:'
        };
        events.sendMessage(token, qs);
    },

    notParameter: (chat_id, token) => {
        qs = {
            reply_markup: JSON.stringify({
                "keyboard": [
                    [
                        {
                            'text':'Send my current location',
                            'request_location': true
                        }
                    ],
                    [{'text':'✖'}]
                ]
            }),
            chat_id: chat_id,
            text: "Ok, now send your location"
        };
        events.sendMessage(token, qs);
    }







}