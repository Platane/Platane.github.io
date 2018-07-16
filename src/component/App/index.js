import cssReset from '../_abstract/cssReset'
import React, {Component} from 'react'

import {Home} from '../_page/Home'

export class App extends Component {
    constructor() {
        super()
        cssReset()
    }

    render() {
        return <Home />
    }
}
