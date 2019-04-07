'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require(__dirname + '/../config.json');
var db = {};

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.pw, config.dev);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    let model = sequelize.import(path.join(__dirname, file));
    console.log(path.join(__dirname, file))
    db[model.name] = model;
    console.log('model.name:' + model.name);
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Sequelize.Op;

db.Chat_log = require('./chat_log')(sequelize, Sequelize);
db.Chat_user = require('./chat_user')(sequelize, Sequelize);


module.exports = db;
