const { onApplicationBootstrap } = require('@zetapush/platform');
module.exports = class Api {

  async [onApplicationBootstrap](){
    // Init your backend here
    return ;
  }

  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
