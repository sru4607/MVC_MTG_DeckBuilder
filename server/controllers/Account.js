const models = require('../models');

const { Account } = models;

// Login page
const loginPage = (req, res) => {
  const token = req.csrfToken();
  res.render('login', { csrfToken: token });
};

// Logout processing
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Login Processing
const login = (request, response) => {
  const req = request;
  const res = response;

  // force cast to string to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/viewer' });
  });
};

// Signup processing
const signup = (request, response) => {
  const req = request;
  const res = response;

  console.log(req);

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/viewer' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

const accountPage = (req, res) => res.render('account');

// Toggles the premium based on owner
const togglePremium = (req, res) => {
  let premiumToSet = false;
  Account.AccountModel.findOneByOwner(req.session.account._id, (err, docs) => {
    console.log(docs);
    premiumToSet = !docs.premium;

    const replace = {
      premium: premiumToSet,
    };

    Account.AccountModel.findOneByOwnerAndUpdate(
      req.session.account._id,
      replace,
      (error, returnedVal) => res.json({ new_Premium: returnedVal.premium }),
    );
  });
};

// CSRF
const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

// Get the model based on id
const getAccountInfo = (req, res) => {
  Account.AccountModel.findOneByOwner(req.session.account._id, (err, docs) => res.json(docs));
};

module.exports.loginPage = loginPage;
module.exports.accountPage = accountPage;
module.exports.logout = logout;
module.exports.login = login;
module.exports.signup = signup;
module.exports.getAccountInfo = getAccountInfo;
module.exports.togglePremium = togglePremium;
module.exports.getToken = getToken;
