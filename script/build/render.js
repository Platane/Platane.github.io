import preactRender from 'preact-render-to-string'
import React from 'react'
import {extractCritical} from 'emotion-server'
import {App} from '../../src/component/App'
import {stringify as stringifyMeta} from '../../src/service/head'
import meta from '../../src/content/meta'

const assetManifest = require('../../dist/assetManifest.json')
const {publicPath} = require('../../dist/stats.json')

console.log('public path:', publicPath, assetManifest['index.js'])

export const render = () => {
  const app = <App />

  const {html, ids, css} = extractCritical(preactRender(app))

  const metaString = stringifyMeta(meta)

  const indexhtml = `<!doctype html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
<meta charset="UTF-8"></meta>
${metaString}
<style>${css}</style>
</head>
<body>
<div id="app">${html}</div>
</body>
</html>`

  //<script>
  //  window.__PRELOADED_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};
  //  window.__EMOTION_IDS__=${JSON.stringify(ids)};
  //</script>
  //<script src="${publicPath + assetManifest['index.js']}"></script>

  return indexhtml
}
