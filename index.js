var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true);

  //Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  var queryString = parsedUrl.query;

  //Get the HTTP method
  var method = request.method.toLowerCase();

  //Get the headers as an object
  var headers = request.headers;

  //Get the payloads, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  request.on('data', function(data){
    buffer += decoder.write(data);
  });

  request.on('end', function(){
    buffer += decoder.end();

    //Choose the handler this request should go to. If one is not found, use the notFound handlers
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //Construct the data object to send to the handlers
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryString,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    //Route the requestto the handler specified in the router
    chosenHandler(data, function(statusCode, payload){
      //Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      //Return the response
      response.setHeader('Content-Type', 'application/json');
      response.writeHead(statusCode);
      response.end(payloadString);

      console.log('Returning this response: ', statusCode, payloadString);

    });

  });
}).listen(3400);

var handlers = {};

handlers.hello = function(data, callback){
  callback(200, {'data' : data.payload});
}

handlers.notFound = function(data, callback){
  callback(404);
}

var router = {
  'hello' : handlers.hello
}
