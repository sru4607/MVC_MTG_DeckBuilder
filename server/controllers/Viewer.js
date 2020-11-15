const models = require('../models');

const { Deck } = models;

//load viewer page
const viewerPage = (req, res) => {
  Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    const token = req.csrfToken();
    return res.render('deck-viewer', { decks: docs });
  });
};


// Get a list of all the decks saved
const getDecks = (request, response) => {
  const req = request;
  const res = response;

  return Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.json({ decks: docs });
  });
};

// Remove a deck that is saved
const removeDeck = (request, response) => {
  const req = request;
  const res = response;
  return Deck.DeckModel.removeByData(req.query, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.json({ res: docs });
  });
};

module.exports.removeDeck = removeDeck;
module.exports.viewerPage = viewerPage;
module.exports.getDecks = getDecks;
