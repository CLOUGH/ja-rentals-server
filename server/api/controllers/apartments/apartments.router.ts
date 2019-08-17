import express from 'express';
import controller from './apartments.controller'
export default express.Router()
    .get('/', controller.all)
    .put('/:id', controller.update);