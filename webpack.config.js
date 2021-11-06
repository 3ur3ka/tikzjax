const path = require("path");
const webpack = require('webpack');
const fs = require('fs');

module.exports = {
  mode: 'development',

  entry: {
    tikzjax: './src/index.js',
    'tikzjax-worker': './src/tikzjax-worker.js',
  },

  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      'fs': 'browserfs/dist/shims/fs.js',
      'path': 'browserfs/dist/shims/path.js',
      'processGlobal': 'browserfs/dist/shims/process.js',
      'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
      'bfsGlobal': require.resolve('browserfs')
    },
    fallback: {
      buffer: require.resolve('buffer/'),
      stream: require.resolve("stream-browserify")
    },
  },  
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/',
    filename: '[name].js',
  },
  //node: {
  //  Buffer: true
  //},
  target: 'web',
  devtool: 'source-map',
  module: {
    noParse: /browserfs\.js/,    
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      {
        test: /index\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            { search: "'/tex.wasm'", replace: "'/ef253ef29e2f057334f77ead7f06ed8f22607d38.wasm'" },
            { search: "'/core.dump.gz'", replace: "'/7620f557a41f2bf40820e76ba1fd4d89a484859d.gz'" }
          ]
        }
      }      
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ]
};
