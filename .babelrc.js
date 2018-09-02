const plugins = [
  'babel-plugin-emotion',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-object-rest-spread',

  // ['@babel/plugin-transform-react-jsx', {pragma: 'React'}],

  [
    'babel-plugin-transform-inline-environment-variables',
    { include: ['APP_URL'] },
  ],

  [
    'babel-plugin-module-resolver',
    {
      alias: {
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        'react-emotion': 'preact-emotion',
      },
    },
  ],
]

const presets = ['@babel/preset-react']

if (process.env.NODE_ENV === 'production') {
  presets.push('@babel/preset-env')
}

if (process.env.NODE_ENV === 'build') {
  plugins.push(
    [
      'babel-plugin-transform-assets',
      {
        extensions: ['jpg', 'jpeg', 'png', 'gif'],
        name: '[hash:8].[ext]',
      },
    ],
    '@babel/plugin-transform-modules-commonjs'
  )
}

module.exports = { plugins, presets }
