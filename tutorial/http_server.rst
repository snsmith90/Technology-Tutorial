.. _http_server:


***********
HTTP Server
***********

SilkJS comes with an HTTP server that is written almost entirely in JavaScript using the SilkJS libraries and modules. The HTTP server can serve both static and dynamic content, and is very fast. This walkthrough will get you started at building WWW applications using the SilkJS HTTP server.

.. _setting_up_an_application:

Setting up an Application
=========================

The server is started from the command line:::

	$ httpd-silk.js bootstrap.js

The bootstrap.js program is a startup script that you will write to load your API into the server, as well as your "Servlet" request handler methods. The bootstrap is loaded and run before the server pre-forks the child processes. This means each child will have all the API libraries and request handlers you've loaded available to them.

With that in mind, a good initial layout for your application might look something like this:

* Application/
	* bootstrap.js
	* docroot/
	* server/

You'll name your Application directory as the name of the application or WWW site.

The docroot directory will contain your static content and your dynamic "JSP" style pages. You might organize your docroot into a /css, a /js, an /img, directories. Your CSS files will be served by requests for /css/whatever.css, your JavaScript files will be served by requests for /js/whatever, and so on. Otherwise you'll organize your static HTML and dynamic pages as you would for a server like Apache; if you make an about/ folder, a request for /about/ will attempt to serve the directory index page for the about/ folder.

The HTTP server has a default Config object, which you can modify in your bootstrap.js script. The Config object contains the path to your documentRoot, the numChildren (number of children to pre-fork), MySQL connection parameters, and directoryIndex setup. The Config.directoryIndex member is an array of filenames that will be looked for if the request is for a directory. The defaults are::

	'index.jst',
	'index.coffee',
	'index.md',
	'index.html'

Thus if a directory is requested by URI, an index.jst will be served if found, an index.coffee served if index.jst not found, etc. If none of the directoryIndex filenames are found, then a notFound error occurs.

The server/ directory might contain any custom classes, modules, etc., that you might want to require() or include() for your application. This site, for example, has a templates/ folder which contains CoffeeScript snippets to generate the Header, Footer, Navigation, etc., and they are included by .coffee pages dynamically run upon request.

.. _jst:

What is Jst?
''''''''''''

It's a lot like JSP (or PHP), except the language is JavaScript AND you can call any function of any class you've done include() on in your main program.

::

	<% var title = 'Hello from Jst'; %>
	<html>
		<head>
		  <title><%= title %></title>
		</head>
		<body>
		  <h1>Users</h1>
		  <ul>

	<% forEach(SQL.getDataRows('SELECT * FROM Users'), function(user) { %>
		    <li><%= user.username %></li>
	<% } %>

		  </ul>
		</body>
	</html>

<%
// any JavaScript can go here 
%>

<%= JavaScript expression %>
(emits result of the expression)

.. _actions:

Actions
-------

"Servlet" style requests are handled by "action" methods that are pre-loaded into the server. These are simply global methods that have names that end with _action(). If there is an action method for the first element of the requested URI, it is called; anything else in the URI is ignored, though the action method may examine the URI and perform appropriate logic in response. If the _action() method returns, the normal HTTP server processing will continue - the documentRoot is searched for a file that is served statically or JSP style.

For example, if you have defined a global foo_action() method, and the requested URI is /foo, or /foo/, or /foo/anything/else/you/want, then foo_action() is called to handle the request. The same thing is true if you have a function bar_action() and the URI is /bar.

A special case main_action() method may be defined. It handles the / request URI, but only that URI.

If you want to have a function that is called on each request, you can set HttpChild.requestHandler to your own function; this function will be executed for each request, and if it returns, the normal HTTP server processing will occur. You might want to install a requestHandler to authenticate a user by cookie, each request.

When a 404 occurs, the server will look for a notFound_action() method and will call that. If that function returns, the built-in 404 handler will execute.

.. _req_and_res:

The req and res Objects
-----------------------

There is a global req and global res object set up in the HTTP environment per request. These are available in the onRequest() method, in your action methods, and in your dynamic pages.

The req object represents information about the request. 

It contains the headers, the host name requested, the port, the method (GET, PUT, etc.), the requested URI, the HTTP protocol, the client's IP address, and the path to the script that is being executed (if it is not a script, this is meaningless).

The req.data member contains the post variables, query_string variables, multi-part/mime variables, and cookies. It is a has of key/value pairs, where key is the name of the variable or cookie, and value is the value. For POST data that is a file upload, the value is a hash containing information about the file, and the base64 encoded file data.

The res object represents information your code is preparing to send to the client as the response.

You may set the response code to something other than 200 (OK) by setting res.status. You may set the content's MIME type to something other than text/html by setting res.contentType.

The res.data member is free for you to use for any purpose you choose. Think of it as a "global" variable you can pass to all functions, initialized per request.

There are several functions provided by res that you will use heavily:

* res.stop() - call this to end your request processing without allowing the server to do its normal processing (e.g. serving static or dyanmic content from documentRoot).
* res.write(s) - write a string to the client; these are buffered until you call res.stop(), then sent.
* res.writeln(s) - same as res.write() but adds a newline to the output.
* res.sendFile(path) - sends a file of your choosing, does not return.
* res.redirect(uri) - send a 302 redirect to the specified URI.
* res.setHeader(key, value) - sets a header to be sent to the client.
* res.setCookie(key, value, expires, path, domain) - set a cookie, only key/value are required.

