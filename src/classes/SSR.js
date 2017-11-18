export default class SSR {

  constructor(props, parent) {
    this.parent = parent.parent;
  }

  addRoute(prefix, app, options, middleware){

  }
  
  /**
   * Handle Koa Development middleware after compile is complete
   * @param  {webpackmiddleware} dev
   * @param  {webpackcompiler} compiler
   * @return {function} Function to be called
   */
  koaDevware(dev, compiler) {
    const waitMiddleware = () =>
      new Promise((resolve, reject) => {
        dev.waitUntilValid(() => resolve(true));
        compiler.plugin('failed', error => reject(error));
      });

    return async (ctx, next) => {
      await waitMiddleware();
      await dev(
        ctx.req,
        {
          end(content) {
            ctx.body = content;
          },
          setHeader: ctx.set.bind(ctx),
          locals: ctx.state,
        },
        next
      );
    };
  }

}
