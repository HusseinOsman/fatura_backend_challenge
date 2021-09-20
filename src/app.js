// app.js
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import indexRouter from './routes/index';

import env from './config/env';
import models from './core/loadModels';

const app = express();

require('./config/passport');

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'arabica')
    next()
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);

models.waterline.initialize(models.config, function (err, models) {
    if (err) throw err;
    global.Models = app.models = models.collections;
    app.connections = models.connections;
    // seeders
    require('./seeder')(models.collections);

    // Start Server
    // server.listen(port);
});

module.exports = app