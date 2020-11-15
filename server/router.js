const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/viewer', mid.requiresLogin, controllers.Viewer.viewerPage);
  app.get('/editor', mid.requiresLogin, controllers.Editor.editorPage);
  app.get('/account', mid.requiresLogin, controllers.Account.accountPage);
  app.get('/getDecks', mid.requiresLogin, controllers.Viewer.getDecks);
  app.get('/newDeck', mid.requiresLogin, controllers.Editor.newDeck);
  app.post('/editDeck', mid.requiresLogin, controllers.Editor.editDeck);
  app.post('/saveDeck', mid.requiresLogin, controllers.Editor.saveDeck);
  app.get('/searchCard', mid.requiresLogin, controllers.Editor.getCard);
  app.get('/loadDeck',mid.requiresLogin, controllers.Editor.loadDeck);
  app.get('/getAccountInfo', mid.requiresLogin, controllers.Account.getAccountInfo);
  app.post('/togglePremium', mid.requiresLogin, controllers.Account.togglePremium);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
