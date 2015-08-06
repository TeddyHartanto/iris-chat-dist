/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 */

'use strict';

var Message = require('./message.model');

// Get list of messages
exports.index = function(req, res) {
  Message.find(function (err, msgs) {
    if(err) { return handleError(res, err); }
    return res.json(200, msgs); // sent as an array [Obj1, Obj2]
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {
  var timestamp = new Date(), hours = timestamp.getHours(), minutes = timestamp.getMinutes();
  if (hours/10 < 1) hours = '0' + hours;
  if (minutes/10 < 1) minutes = '0' + minutes;
  req.body.timestamp = hours + ':' + minutes;

  Message.create(req.body, function(err, msg) {
    if(err) { return handleError(res, err); }
    return res.json(201, msg); // sent as an Object containing data (try it out in client side)
  });
};

function handleError(res, err) {
  return res.send(500, err);
}