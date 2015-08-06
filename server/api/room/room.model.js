var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var RoomSchema = new Schema({
	chatters: [{ type: Schema.Types.ObjectId, ref: 'User'}],
	messages: [{ type: Schema.Types.ObjectId, ref: 'Message'}],
  expired: {type: Boolean, default: false},
  timestamp: String
});

RoomSchema
  .path('chatters')
  .validate(function(chatters) {
  	if (chatters.length <= 2 && chatters.length > 0)
  		return true;
  	else
  		return false;
  }, 'There should be either 1 or 2 user(s) in a room');

module.exports = mongoose.model('Room', RoomSchema);