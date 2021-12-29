'use strict';

var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var app = express();

// const io = require('socket.io')(http, {
//     cors: {
//         origin: "http://localhost:8100",
//         methods: ["GET", "POST"],
//         transports: ['websocket', 'polling'],
//         credentials: true
//     },
//     allowEIO3: true
// });

// http server
var server = app.listen(3000);
var io = require('socket.io')(server);

// https server
// var socketIo = require('socket.io');

// var path = require('path');
// var serveIndex = require('serve-index');
// var log4js = require('log4js');
// log4js.configure({
//     appenders: {
//         file: {
//             type: 'file',
//             filename: 'app.log',
//             layout: {
//                 type: 'pattern',
//                 pattern: '%r %p - %m',
//             }
//         }
//     },
//     categories: {
//        default: {
//           appenders: ['file'],
//           level: 'debug'
//        }
//     }
// });
// var logger = log4js.getLogger();

app.use(express.static('public'));
// app.use(serveIndex('./public'));
// app.use(express.static('./public'));
// app.use("/", express.static(path.join(__dirname, "public")));

// https server
// var options = {
// 	// key : fs.readFileSync('./cert/test.key'),
// 	// cert: fs.readFileSync('./cert/test.pem')
// 	key : fs.readFileSync('./cert/private.key'),
// 	cert: fs.readFileSync('./cert/certificate.pem')
// 	// requestCert: false
// }
// var privateKey  = fs.readFileSync('./cert/private.key', 'utf8');
// var certificate = fs.readFileSync('./cert/certificate.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};

// http server
// var http_server = http.createServer(app);
// var PORT = 80;

// https server
// var SPORT = 443;
// var https_server = https.createServer(options, app).listen(SPORT);
// // var https_server = https.createServer(credentials, app);

// bind socket.io with https_server
// var https_socket = socketIo(https_server);

//connection
// https_socket.on('connection', (socket)=>{
// https_socket.sockets.on('connection', (socket)=>{
io.on('connection', (socket) => {

	socket.on('message', (room, data)=>{
		socket.to(room).emit('message', room, data);
	});

	//该函数应该加锁
	socket.on('join', (room)=> {

		socket.join(room);

		// var myRoom = https_socket.sockets.adapter.rooms[room];
		// var myRoom = io.sockets.adapter.rooms[room];
		// var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;

		io.of("/").in(room).allSockets().then(items => {
		// https_socket.of("/").in(room).allSockets().then(items => {
			var users = 0;
			items.forEach(item=>{
                // console.log('UserID: '+item);
				users += 1;
            })
			// logger.log('the number of user in room is: ' + users);
			console.log('the number of user in room is: ' + users);
			console.log('the room is: ' + room);

			//Control # of attendance, now set to 2 in maximum
			//for convenience purpose of client control，if multiple people here,
			//should send attendance # to conditional statement
			if(users < 3) {
				socket.emit('joined', room, socket.id);	
				if (users > 1) {
					socket.to(room).emit('otherjoin', room, socket.id);
				}
			}else {
				socket.leave(room);
				socket.emit('full', room, socket.id);	
			}
			//socket.to(room).emit('joined', room, socket.id);// except myself
			//io.in(room).emit('joined', room, socket.id)// all people in the room
			//socket.broadcast.emit('joined', room, socket.id);// all nodes except myself	
		})
	});

	socket.on('leave', (room)=> {
		// var myRoom = https_socket.sockets.adapter.rooms[room];
		// var myRoom = io.sockets.adapter.rooms[room];
		// var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;

		//users - 1;
		io.of("/").in(room).allSockets().then(items => {
		// https_socket.of("/").in(room).allSockets().then(items => {
			var users = 0;
			items.forEach(item=>{
                // console.log('UserID: '+item);
				users += 1;
            })

			// logger.log('the number of user in room is: ' + (users-1));
			console.log('the number of user in room is: ' + (users-1));
	
			socket.to(room).emit('bye', room, socket.id)// all people in the room, except myself
			socket.emit('leaved', room, socket.id);	
			//socket.to(room).emit('joined', room, socket.id);// except myself
			//io.in(room).emit('joined', room, socket.id)// all people in the room
			//socket.broadcast.emit('joined', room, socket.id);// all nodes except myself
		})
	});
});

// https_server.listen(3333, '127.0.0.1');
// http_server.listen(PORT, '0.0.0.0');
// https_server.listen(SPORT, '0.0.0.0');

// const port = process.env.PORT || 3000;
// http.listen(port, () => {
//     console.log('listening on http://localhost:', port);
// })





