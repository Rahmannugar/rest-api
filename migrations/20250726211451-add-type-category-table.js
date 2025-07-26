"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.addColumn("category", "category_type", {
    type: "string",
    notNull: false,
  });
};

exports.down = function (db) {
  return db.removeColumn("category", "category_type");
};

exports._meta = {
  version: 1,
};
