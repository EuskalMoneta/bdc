// require our dependencies
var webpack = require('webpack')
var path = require('path')
var I18nPlugin = require("i18n-webpack-plugin")

var languages = {
    "fr": null,
    "eu": require('./static/locales/eu.json')
}

// if env var NODE_ENV === 'production', it will uglify/minify our JS codebase
// if this is anything else, it will not: and we will be in 'dev' mode (.js files will be *MUCH LARGER*)
var isProd = (process.env.NODE_ENV === 'production')

module.exports = Object.keys(languages).map(function(language)
{
    // Conditionally return a list of plugins to use based on the current environment.
    // Repeat this pattern for any other config key (ie: loaders, etc).
    function getPlugins() {
        var plugins = [];

        // Always expose NODE_ENV to webpack, you can now use `process.env.NODE_ENV`
        // inside your code for any environment checks; UglifyJS will automatically
        // drop any unreachable code.
        plugins.push(
            new webpack.EnvironmentPlugin([
                'NODE_ENV'
            ]),
            // makes our dependencies available in every module
            new webpack.ProvidePlugin({
                Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
                fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
                Raven: 'raven-js',
                React: 'react',
                ReactDOM: 'react-dom',
                ReactToastr: 'react-toastr',
                Formsy: 'formsy-react',
                FRC: 'formsy-react-components',
                moment: 'moment',
                "_": 'underscore'
            }),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fr|eu/),
            new I18nPlugin(
                languages[language]
            )
        );

        // Conditionally add plugins for Production builds.
        if (isProd) {
            plugins.push(new webpack.optimize.UglifyJsPlugin());
        }

        return plugins;
    }

    return {
        // the base directory (absolute path) for resolving the entry option
        context: __dirname,

        // If you have a big problem on the front-side (with React, etc ...)
        // You can activate this, its generates the .map for the bundles,
        // and using Chrome this helps a LOT to locate where the problem is in your code exactly:
        // devtool: 'source-map',

        entry: {
            Base: './static/js/base',
            ChangePassword: './static/js/change-password',
            MemberAdd: './static/js/member-add',
            MemberAddSubscription: './static/js/member-add-subscription',
            MemberSearch: './static/js/member-search',
            MemberShow: './static/js/member-show',
            MemberChangeEuroEusko: './static/js/member-change-euro-eusko',
            MemberReconversion: './static/js/member-reconversion',
            EntreeStock: './static/js/entree-stock',
            SortieStock: './static/js/sortie-stock',
            MemberDepotEuskoNumerique: './static/js/member-depot-eusko-numerique',
            MemberRetraitEuskoNumerique: './static/js/member-retrait-eusko-numerique',
            BankDeposit: './static/js/bank-deposit',
            CashDeposit: './static/js/cash-deposit',
            Manager: './static/js/manager',
            ManagerHistory: './static/js/manager-history',
            Login: './static/js/login',
        },

        output: {
            // where you want your compiled bundle to be stored
            path: '/assets/bundles/',
            // naming convention webpack should use for your files
            filename: 'js/'+ language + '.[name].js',
        },

        plugins: getPlugins(),

        module: {
            loaders: [
                // a regexp that tells webpack use the following loaders on all
                // .js and .jsx files
                {
                    test: /\.jsx?$/,
                    // we definitely don't want babel to transpile all the files in
                    // node_modules. That would take a long time.
                    exclude: /node_modules/,
                    // use the babel loader
                    loader: 'babel'
                },
                // Classic CSS + SASS preprocessor
                {
                    test: /\.css$/,
                    exclude: /\.useable\.css$/,
                    loaders: ['style', 'css']
                },
                {
                    test: /\.useable\.css$/,
                    loaders: ['style/useable', 'css']
                },
                {
                    test: /\.scss$/,
                    loaders: ["style", "css?sourceMap", "sass?sourceMap"]
                },
                {
                    test: /\.json/,
                    loader: 'json-loader'
                },
                // We want to use bootstrap
                // Bootstrap is based on webfonts / svg and other cool things
                // We need webpack to handle those for us
                {
                    test: /\.svg/,
                    loader: 'svg-url-loader'
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "file-loader"
                }
            ]
        },
        url: {
            dataUrlLimit: 1024 // 1 kB
        },

        resolve: {
            root: path.resolve(__dirname),

            alias: {
                Utils: 'static/js/utils',
                Modal: 'static/js/modal'
            },

            // tells webpack where to look for modules
            modulesDirectories: ['node_modules'],
            // extensions that should be used to resolve modules
            extensions: ['', '.js', '.jsx']
        }
    }
})