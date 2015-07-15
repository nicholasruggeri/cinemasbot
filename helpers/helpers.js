module.exports = {

    messageType: function(data) {
        if (data.body.message.text)
            return "text";
        else if (data.body.message.location)
            return "location";
    },

    isCommand: function(data) {
        if (data.charAt(0) == '/')
            return true;
        else
            return false;
    },

    textResponse: {
        beer: "\n\nIf you found @CinemasBot useful, offer me a 🍺!\nPaypal: http://bit.ly/1HYoLFB",
        author: "The creator of this amazing Bot is the brilliant @nicksruggeri 😎",
        hint_keyboard: "Use your keyboard with these options to reply",
        example: "Ex: /getcinema Venezia or /getcinema 31010 (postal code)"
    }

}