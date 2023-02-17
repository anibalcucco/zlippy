import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider, DEFAULT_THEME } from '@zendeskgarden/react-theming'
import { Grid } from '@zendeskgarden/react-grid'
import I18n from '../../javascripts/lib/i18n'
import { resizeContainer, escapeSpecialChars as escape } from '../../javascripts/lib/helpers'
import OpenAI from './openai'

const MAX_HEIGHT = 1000

class App {
  constructor (client, _appData) {
    this._client = client
    this.initializePromise = this.init()
  }

  async init () {
    const currentUser = (await this._client.get('currentUser')).currentUser

    I18n.loadTranslations(currentUser.locale)

    const appContainer = document.querySelector('.main')

    render(
      <ThemeProvider theme={{ ...DEFAULT_THEME }}>
        <Grid>
          <OpenAI client={this._client} />
        </Grid>
      </ThemeProvider>,
      appContainer
    )
    return resizeContainer(this._client, MAX_HEIGHT)
  }
}

export default App
