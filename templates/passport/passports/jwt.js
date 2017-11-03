var passport = require('koa-passport');
var { 
  Strategy,
  JwtStrategy, 
  ExtractJwt 
} = require('passport-jwt');

let opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: 'secret',
  authScheme: 'Bearer',
  ignoreExpiration: true,
  session: false,
};

module.exports = () => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // userFound = findUser
      // if (userFound)
      //   done(null, false)
      // else
      //   done(null, userFound)
    })
  );
};
