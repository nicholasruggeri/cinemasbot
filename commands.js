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
        console.log('user start bot')
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: "Hello " + req.body.message.chat.first_name + ",\n send your position or use '/getcinema city' to receive the list of movie theaters near you.\n" + helpers.textResponse.example + "\n\nUse /help for list of commands." + helpers.textResponse.beer,
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
    }

}