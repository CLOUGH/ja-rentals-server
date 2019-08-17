import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router'
import scraperRouter from './api/controllers/scrapper/scrapper.router';
import apartmentsRouter from './api/controllers/apartments/apartments.router';


export default function routes(app: Application): void {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/scrapper', scraperRouter);
  app.use('/api/v1/apartments', apartmentsRouter);
};