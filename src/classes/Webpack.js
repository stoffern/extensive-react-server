import React from 'react'
import ReactDOM from 'react-dom'
import AppContainer from 'react-hot-loader/lib/AppContainer'
import { createClientRouter, createClientResolver } from '../utils/Router'

export default class Webpack {
  constructor(props, parent) {
    this.parent = parent;
  }


  addConfig(config){
    let count = this.configFiles.length
    this.configFiles.push(config)

    //return count number
    return count+1
  }

  compileConfigs(){

    return compiler
  }


  static renderClientJS(){

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept('../utils/Router.js', () => {
        this.render(require('../utils/Router').createClientRouter)
      })
    }
    this.render(createClientRouter)
  }

  async render(createRouter){
    const resolver = createClientResolver()
    const Router = await createRouter(resolver)
    ReactDOM.render(
      <AppContainer>
        <Router resolver={resolver} />
      </AppContainer>,
      // eslint-disable-next-line no-undef
      document.getElementById('root'),
    )
  }
}
