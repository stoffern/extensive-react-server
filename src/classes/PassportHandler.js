import path from "path";
import passport from "koa-passport";

export default class PassportHandler {
  constructor(props, parent, app) {
    this.parent = parent;
    this.strategies = [];
  }

  initStrategies() {
    if (this.strategies.length > 0) {
      this.parent.parent.logger.info(
        "[VelopServer][Passport] Initialize " +
          this.strategies.length +
          " passport strategies"
      );

      this.parent.app.use(passport.initialize());
      this.parent.app.use(passport.session());

      passport.serializeUser((user, done) => done(null, user));
      passport.deserializeUser((user, done) => done(null, user));

      this.strategies.map(strategy => passport.use(strategy));
    }
  }

  /**
   * [addPassport description]
   * @param {[type]} pp [description]
   */
  addPassport(pp) {
    this.strategies.push(pp);
  }
}
