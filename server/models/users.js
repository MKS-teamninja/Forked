var db = require('../db');
var uuid = require('uuid');


var User = module.exports;

User.create = function (user_id, user_name) {
  return db('users').returning('user_id').insert({
    user_id: user_id,
    user_name: user_name
  }).then(function (data) {
    //Assume data back is the inserted object?
    console.log("User.create res data: ", data);
    return data[0];
  })
};

User.createSession = function (user_id, sessionToken) {
  return db('sessions').insert({
    user_id: user_id,
    sessionToken :sessionToken
  }).then(function (data) {
    console.log("users.js line 23, data: ", data);
    return data.sessionToken;
  })
};

//Find functions return first result
//Implied to be only result
User.findByName = function (name) {
  return db('users').where({
    user_name: name
  }).then(function (data) {
    return data[0];
  })
};

User.findById = function (id) {
  return db('users').where({
    user_id: id
  }).then(function (data) {
    return data[0];
  })
};

User.findSessionByToken = function (token) {
  return db('sessions').where({
    sessionToken: token
  }).then(function (data) {
    return data[0];
  })
};

User.deleteSessionToken = function(token){
  return db('sessions').where({sessionToken: token}).del();
};
