import fs from 'fs'
import path from 'path'
import {render} from './render'

fs.writeFileSync(path.resolve(__dirname, '../../dist', 'index.html'), render())
