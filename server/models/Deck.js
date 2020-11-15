const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let DeckModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();
const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: setName,
  },

  cards: {
    type: String,
    min: 0,
    required: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
});

DeckSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  favoriteColor: doc.favoriteColor,
});

DeckSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DeckModel.find(search).select('name').lean().exec(callback);
};

DeckSchema.statics.findOneByOwnerAndName = (ownerId, name, callback) => {
  const search = {
    owner: convertId(ownerId),
    name,
  };

  return DeckModel.findOne(search).select('cards').lean().exec(callback);
};

DeckSchema.statics.removeByData = (data, callback) => {
  DeckModel.findByIdAndDelete(data.id).exec(callback);
};

DeckModel = mongoose.model('Deck', DeckSchema);


module.exports.DeckModel = DeckModel;
module.exports.DeckSchema = DeckSchema;
