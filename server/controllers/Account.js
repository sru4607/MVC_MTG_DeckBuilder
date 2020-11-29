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
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

// Process account page request
const accountPage = (req, res) => {
  Account.AccountModel.findOneByOwner(req.session.account._id, (err, docs) => {
    // Should only enter if database was modified (Error Handling)
    if (err || docs == null) {
      return logout(req, res);
    }
    return res.render('account', { premium: docs.premium });
  });
};

// Toggles the premium based on owner
const togglePremium = (req, res) => {
  let premiumToSet = false;
  Account.AccountModel.findOneByOwner(req.session.account._id, (err, docs) => {
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

// Change Password
const changePassword = (request, response) => {
  const req = request;
  const res = response;

  // force cast to string to cover some security flaws
  const currentPass = `${req.body.c_pass}`;
  const newPass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // If any fields are empty
  if (!currentPass || !newPass || !pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // If the new passwords do not match
  if (newPass !== pass2) {
    return res.status(400).json({ error: 'New Passwords do not match' });
  }

  // Authenticate the correct password
  return Account.AccountModel.findOneByOwner(req.session.account._id, (mainErr, docs) => {
    const { username } = docs;
    Account.AccountModel.authenticate(username, currentPass, (err, account) => {
      if (err || !account) {
        return res.status(401).json({ error: 'Wrong password' });
      }
      // Set new password and save
      return Account.AccountModel.generateHash(newPass, (salt, hash) => {
        Account.AccountModel.findOne({ username: account.username },
          (AccountErr, updatingAccount) => {
            const newAccountParam = updatingAccount;
            newAccountParam.salt = salt;
            newAccountParam.password = hash;
            newAccountParam.save();
            return res.json({ message: 'Success' });
          });
      });
    });
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
module.exports.changePassword = changePassword;
module.exports.getToken = getToken;
