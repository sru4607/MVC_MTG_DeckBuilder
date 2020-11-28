const models = require('../models');

const { Deck } = models;

const { Account } = models;

// Process the viewer page
const viewerPage = (req, res) => {
  // Get account information
  Account.AccountModel.findOneByOwner(req.session.account._id, (error, accountDocs) => {
    // Get decks that the account owns
    Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
      // If any error
      if (err) {
        return res.status(400).json({ error: 'An error occured' });
      }
      // Get token
      const token = req.csrfToken();
      // Render page
      return res.render('deck-viewer', { decks: docs, csrf: token, premium: accountDocs.premium });
    });
  });
};

// Get a list of all the decks saved
const getDecks = (request, response) => {
  const req = request;
  const res = response;

  return Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
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
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.json({ res: docs });
  });
};

module.exports.removeDeck = removeDeck;
module.exports.viewerPage = viewerPage;
module.exports.getDecks = getDecks;
