const https = require('https');

const models = require('../models');

const { Deck } = models;

const editorPage = (req, res) => res.render('deck-editor');

//If creating new deck just open editor
const newDeck = (req, res) => res.json({ redirect: '/editor' });

//Edit deck with deck name
const editDeck = (req, res) => {
    let url = '/editor';
    url += '?deckName=';
    url+=req.body.deckName;
    url = encodeURI(url);
    res.json({ redirect: url })
};

//Get card based on search and generate json
const getCard = (req, res) => {
  const url = `https://api.scryfall.com/cards/search?q="${req.query.searchString}"`;
  // Create response callback
  const responseRecieved = (resScryfall) => {
    let data = '';
    // Add data
    resScryfall.on('data', (d) => {
      data += d;
    });
    // Use completed data and return it
    resScryfall.on('end', () => {
      let returnedItems = JSON.parse(data);
      returnedItems = returnedItems;
      let result = {};
      // If there was any data returned
      if (returnedItems.data) {
        // Use the first search result (May Change Later)
        returnedItems = returnedItems.data[0];
        // Double Sided Cards (Images, Text, Cost)
        if (returnedItems.card_faces) {
          result.faceInfo = [];
          returnedItems.card_faces.forEach((face) => {
            result.faceInfo.push({
              face_name: face.name,
              face_text: face.oracle_text,
              face_image: face.image_uris.normal,
              face_manaCost: face.mana_cost,
            });
          });
        }
        // Single Sided Cards
        else {
          console.log(returnedItems);
          result.faceInfo = [{
            face_name: returnedItems.name,
            face_text: returnedItems.oracle_text,
            face_image: returnedItems.image_uris.normal,
            face_manaCost: returnedItems.mana_cost,
          }];
        }
        // All Cards
        result.scryfallURI = returnedItems.scryfall_uri;
        result.legalities = returnedItems.legalities;
        result.priceUSD = returnedItems.prices.usd;
        result.purchaseLink = returnedItems.purchase_uris.tcgplayer;

        return res.json({ result });
      }
      // if No data was returned
      result = {
        message: 'No card found',
        id: 'emptySearchResults',
      };
      return res.json({ result });
    });
  };
    // Start request
  https.get(url, responseRecieved).end();
};


//Either update or create new entry based on name and owner
const saveDeck = (req, res) => {
  const deckModelToSave = {
    name: req.body.saveString,
    cards: req.body.deck,
    owner: req.session.account._id,
  };

  const deckSearch = {
    name: req.body.saveString,
    owner: req.session.account._id,
  };

  const deckPromise = Deck.DeckModel.findOneAndUpdate(deckSearch, deckModelToSave, {
    new: true,
    upsert: true,
  });

  deckPromise.then((response) => {
    console.log(response);
    res.json({ message: 'Success' });
  });


  deckPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occured' });
  });

  return deckPromise;
};

//Load deck based on owner and name
const loadDeck = (req, res) => {
    Deck.DeckModel.findOneByOwnerAndName(req.session.account._id, req.query.deckName, (err, docs) => {
        if(err){
            return res.json({message: 'Error Saving'});
        }
        console.log(docs);
        res.json({deck: docs});
    })

};

module.exports.editorPage = editorPage;
module.exports.newDeck = newDeck;
module.exports.editDeck = editDeck;
module.exports.getCard = getCard;
module.exports.saveDeck = saveDeck;
module.exports.loadDeck = loadDeck;
