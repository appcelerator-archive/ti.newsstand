
exports.sendRequest = function(params) {
    params  =  params || {};
    var url        = params.url,
        file       = params.file,
        onload     = params.onload,
        onerror    = params.onerror,
        onprogress = params.onprogress;

    var client = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            Ti.API.info('Received text: ' + this.responseText);
            onload && onload(this);
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.info('Error: ' + e.error);
            onerror && onerror(e);
        },
        timeout : 5000  // in milliseconds
    });

    if (onprogress) {
        client.ondatastream = function(e) {
            onprogress(e);
        }
    }

    // Prepare the connection.
    client.open('GET', url);
    // If file is passed then save downloaded data to it
    if (file) {
        client.file = file;
    }
    // Send the request.
    client.send();

    Ti.API.info('Sending request: ' + url);
}
