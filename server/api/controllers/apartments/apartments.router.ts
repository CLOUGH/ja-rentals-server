import express from 'express';
import controller from './apartments.controller'
export default express.Router()
    .get('/', controller.all)
    .get('/:id', controller.byId);