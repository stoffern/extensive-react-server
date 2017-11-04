var fs = require('fs');
var path = require('path');
var passport = require('koa-passport');

module.exports = (app, router, config) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  fs.readdirSync(path.join(__dirname, 'passports'))
    .forEach( file => {
      if (file == 'index.js') return;
      var name = file.substr(0, file.indexOf('.'));
      require(path.join(__dirname, 'passport',name))(app, router, config);
    }
  );
};
