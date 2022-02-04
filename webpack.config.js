const path = require("path");
const Dotenv = require('dotenv-webpack');

const config = {

    entry: {
        index: './src/js/index.js',
    },

    output: {
        path: path.resolve(__dirname, "dist", "js"),
        filename: `chmap-geo-referencing.js`,
        library: {
            name: "chmapGeoReferencing",
            type: 'umd',
        }
    },

    // Define development options
    devtool: "source-map",

    optimization: {
       splitChunks: {
            chunks: 'async'
        }
    },

    performance: {
        hints: false,
    },

    // Define loaders
    module: {
        rules: [
            {
                test:  /geo-referencing.js/,
                use: [
                    {
                        loader: "imports-loader",
                        options: {
                            imports: [
                                "side-effects leaflet",
                                "side-effects leaflet-distortableimage/dist/vendor",
                            ]
                        }
                    }
                ]
            },
            // Use babel for JS files
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                }
            },
        ],
    },

    plugins: []

};


module.exports = (webpackEnv, argV) => {

    const isProduction = (argV.mode === "production");

    const dotenvCfg =  { path: "./.env_dev" };

    if (isProduction) {
        config.performance.hints = 'warning';
        dotenvCfg.path = "./.env_prd";
    }

    // Load .env_dev file for environment variables in JS
    config.plugins.push(new Dotenv(dotenvCfg))

    return config;
};
