import express from 'express';
import controller from './scrapper.controller'


export default express.Router()
    .get('/', controller.all)
    .get('/export-pipeline-to-csv', controller.exportPipeline);