import express from 'express';
import { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressLogging  from 'express-logging';
import logger from 'logops';

import installValidator from './openapi';

import l from './logger';
import Mongoose from './mongoose';
import Scraper from '../api/jobs/scraper';

const app = express();
const mongoose = new Mongoose;
const scraper = new Scraper;

export default class ExpressServer {
  constructor() {
    const root = path.normalize(__dirname + '/../..');
    app.set('appPath', root + 'client');
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(express.static(`${root}/public`));
    app.use(cors());
    app.use(expressLogging(logger));
  }

  router(routes: (app: Application) => void): ExpressServer {
    installValidator(app, routes)
    return this;
  }

  listen(p: string | number = process.env.PORT): Application {
    const welcome = port => () => l.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${port}}`);
    http.createServer(app).listen(p, welcome(p));
    mongoose.init();
    scraper.init();
    return app;
  }
}
