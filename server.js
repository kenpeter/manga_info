// server use strict
'use strict'

// what is hapi?
// it is web framework
const Hapi = require('hapi');
// request, get.....
const Request = require('request');
// template render plugin
const Vision = require('vision');
// handlebar like twig
const Handlebars = require('handlebars');
// lodash filter, loop through element, then return the one matching
const LodashFilter = require('lodash.filter');
// take n elements from array
const LodashTake = require('lodash.take');

// hapi server
const server = new Hapi.Server();

// host: 127.0.0.1
// port: 3000
server.connection({
	host: '127.0.0.1',
	port: 3000
});

// register vision for template render
// Register vision for our views
server.register(Vision, (err) => {
  // error
  // server views
	server.views({
	  // engines
		engines: {
		  // html, handle bars
			html: Handlebars
		},
		// related to current dir
		relativeTo: __dirname,
		// views
		path: './views',
	});
});

// server route
// Show teams standings
server.route({
  // get method
	method: 'GET',
	// home path
	path: '/',
	// handler, func
	handler: function (request, reply) {
	  // request
	  // get
	  // api table
	  // func, error, response, body
		Request.get('https://www.mangaeden.com/api/list/0/', function (error, response, body) {
		  // error
			if (error) {
			  // throw error
				throw error;
			}

      // json parse body
			const data = JSON.parse(body);

			// reply, what is reply
			// .view, index
			// result data
			
			//console.log(data);
			
			let tmpData = data.manga;
			tmpData.sort(function(a, b) {
			  return b.h - a.h; // switch it, so get descending
			});
			
			reply.view('index', { result: tmpData });
		});
	}
});

// server
// route
// Show a particular team
server.route({
  // get
	method: 'GET',
	// a team, id
	path: '/manga/{id}',
	// handler
	// request, reply
	handler: function (request, reply) {
	  // request.params.id
	  // so need to encode
	  // encode uri comp
	  // team id, request, param, id
		const mangaId = encodeURIComponent(request.params.id);

    // ``
    // ${xxxxx}
    // individual team
		Request.get(`https://www.mangaeden.com/api/manga/${mangaId}`, function (error, response, body) {
			if (error) {
				throw error;
			}

			const result = JSON.parse(body);

      /*
      // also can get fixtures
			Request.get(`http://api.football-data.org/v1/teams/${teamID}/fixtures`, function (error, response, body) {
				if (error) {
					throw error;
				}

        // take first 5
				const fixtures = LodashTake(LodashFilter(JSON.parse(body).fixtures, function (match) {
					return match.status === 'SCHEDULED';
				}), 5);

        // to team
				reply.view('team', { result: result, fixtures: fixtures });
			});
			*/
			
			//console.log(result);
			
			reply.view('manga', { result: result, mangaId: mangaId });
			
		});
	}
});


server.route({
	method: 'GET',
	path: '/chapter/{chapterId}/{mangaId}',
	handler: function (request, reply) {
    const chapterId = encodeURIComponent(request.params.chapterId);
    const mangaId = encodeURIComponent(request.params.mangaId);

    // ``
    // ${xxxxx}
    // individual team
		Request.get(`https://www.mangaeden.com/api/chapter/${chapterId}`, function (error, response, body) {
			if (error) {
				throw error;
			}

			let result = JSON.parse(body);
			let imgs = result.images;
			imgs.sort(function(a, b) {
			  return a[0] - b[0]; // switch it, so get descending
			});
			
			//console.log(imgs);
			
			reply.view('chapter', { result: imgs, mangaId: mangaId, chapterId: chapterId });
			
		});
	}
});


/*
// get team id
// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
	return teamUrl.slice(38);
});
*/

// start it
server.start((err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
});
