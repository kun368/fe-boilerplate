const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { dependencies } = require('../package.json');

const PATHS = {
  src: path.join(__dirname, '../src'),
  assets: path.join(__dirname, '../assets'),
  build: path.join(__dirname, '../build')
};

const moduleCSSLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: true,
    importLoaders: 2,
    localIdentName: '[path][name]__[local]__[hash:base64:5]'
  }
};

const fontsOptions = {
  limit: 8192,
  mimetype: 'application/font-woff',
  name: 'fonts/[name].[ext]'
};

module.exports = {
  context: path.resolve(__dirname, '../'),
  resolve: {
    // 这里必须要添加 js，否则无法 Webpack 本身无法解析依赖文件
    extensions: ['.ts', '.tsx', '.js']
  },
  entry: {
    app: path.resolve(PATHS.src, './index.tsx')
  },
  output: {
    path: PATHS.build,
    publicPath: './',
    filename: '[name].bundle.js', // 文件名,不加 chunkhash,以方便调试时使用，生产环境下可以设置为 [name].bundle.[hash:8].js
    sourceMapFilename: '[name].bundle.map', // 映射名
    chunkFilename: '[name].[chunkhash].chunk.js',
    globalObject: 'this' // 避免全局使用 window
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        options: {
          useBabel: true
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: fontsOptions
          }
        ]
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'file-loader',
            options: fontsOptions
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [/node_modules/, PATHS.src]
      },
      {
        test: /\.less$/,
        use: ['style-loader', moduleCSSLoader, 'less-loader']
      },
      {
        test: /\.(scss|sass)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.?worker\.js$/,
        use: { loader: 'workerize-loader' }
      },
      {
        test: /\.wasm$/,
        exclude: /node_modules/,
        loader: 'wasm-loader'
      }
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          name: 'vendors',
          enforce: true,
          chunks: 'initial'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './lib/template.ejs'),
      title: 'Webpack React',
      favicon: path.join(PATHS.assets, 'favicon.ico'),
      meta: [
        { name: 'robots', content: 'noindex,nofollow' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no'
        }
      ],
      appMountIds: ['root'],
      inject: false,
      minify: {
        html5: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
        removeComments: true,
        keepClosingSlash: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true
      },
      mobile: true
      // 引入第三方脚本
      // scripts: ['./static.js']
    })
  ],
  // 定义非直接引用依赖
  // 定义第三方直接用Script引入而不需要打包的类库
  // 使用方式即为 var $ = require("jquery")
  externals: {
    window: 'window',
    jquery: '$'
  },
  // 额外传递的数学，最后生成时会进行忽略
  extra: {
    moduleCSSLoader,
    PATHS
  }
};
