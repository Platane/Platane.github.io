import React from 'react'
import {render} from 'react-dom'

import {App} from './component/App'

import './content/meta'

const app = <App />

render(app, document.body, document.getElementById('app'))
