'use strict';

var Room = require('./room.model');

// socket.rooms[0] is the default room containing socketId
// here we add users to room which is stored in socket.rooms[1]
exports.register = function(socketio, socket) {
	socket.on('joinRoom', function(roomId) {
	    socket.join(roomId);
	});
	socket.on('leaveRoom', function() {
		Room.findById(socket.rooms[1], function(err, room) {
			if (err) { console.log(err); }
			room.expired = true;
			room.save(function(err) {
				if (err) { console.log(err); }
			});
		});
		socketio.to(socket.rooms[1]).emit('leaveRoom');
		socket.leave(socket.rooms[1]);
	});
	socket.on('sendMessage', function(message) {
		socketio.to(socket.rooms[1]).emit('sendMessage', message);
	});
	socket.on('secondUser', function() {
		socketio.to(socket.rooms[1]).emit('secondUser');
	})
}