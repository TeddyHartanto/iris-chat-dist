/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /rooms              ->  either find an available room or create a new one
 * POST	   /rooms/send		   ->  push message into the room for storing in database
 * GET     /usersId/history    ->  get a list of rooms where one of the chatters is the user with the given userId
 * GET     /rooms/roomId       ->  get the room specified by the roomId
 */

'use strict';

var Room = require('./room.model');
var ObjectId = require('mongoose').Types.ObjectId;

// Join a room or create a new one
exports.join = function(req, res) {
	Room.findOne({ chatters: req.body.userId, expired: false }, function(err, existingRoom) {
		if (err) { handleErro(res, err); }
		if (existingRoom) {
			return res.json(200, existingRoom);
		}
		else {
			Room.findOne({ chatters: {$size: 1}, expired: false}, function(err, room) {
				if (err) { handleError(res, err); }
				if (room) {
					room.chatters.push(req.body.userId);
					room.save(function(err) {
						if (err) { handleError(res, err); }
						return res.json(200, room);
					});
				}
				else {
					var timestamp = new Date(), hours = timestamp.getHours(), minutes = timestamp.getMinutes();
					if (hours/10 < 1) hours = '0' + hours;
					if (minutes/10 < 1) minutes = '0' + minutes;

					var aRoom = {}
					aRoom.chatters = [req.body.userId];
					aRoom.timestamp = timestamp.toDateString().substring(4) + ', '
									+ hours + ':' + minutes;

					Room.create(aRoom, function(err, newRoom) {
						if (err) { handleError(res, err); }
						return res.json(201, newRoom);
					});
				}
			});
		}
	});
};

// push a message to the room the user is currently in
// needs roomId and msgId
exports.send = function(req, res) {
	Room.findById(req.body.roomId, function(err, room) {
		if (err) { handleError(res, err); }
		room.messages.push(req.body.msgId);
		room.save(function(err) {
			if (err) { handleError(res, err); }
			return res.json(201, room);
		})
	})
};

// given the userId, show the list of rooms that contains that user and the room must be the ones that contains 2 chatters
exports.getHistory = function(req, res) {
	Room.find({ $and: [{ chatters: new ObjectId(req.params.userId)}, { chatters: { $size: 2 }}]}, function(err, rooms) {
		if (err) { handleError(res, err); }
		return res.json(200, rooms);
	})
}

// given the roomId, show the room
exports.show = function(req, res) {
	Room.findById(req.params.roomId)
		.populate('messages')
		.exec(function(err, room) {
			if (err) return handleError(res, err);
			return res.send(200, room);
		});
}

function handleError(res, err) {
	return res.send(500, err);
}