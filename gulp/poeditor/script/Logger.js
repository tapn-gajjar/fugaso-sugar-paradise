module.exports = {
    STATUS: {
        START: "START",
        COMPLETE: "COMPLETE"
    },
    logMessage: function(message, status) {
        console.log(message + ": " + status);
    }
};
