import {injectGlobal} from 'react-emotion'

export default () => {
  injectGlobal`
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    html {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #333;
    }
    body {
      position: relative;
      margin: 0;
  }
  `
}
