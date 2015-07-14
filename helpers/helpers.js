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
    }

}