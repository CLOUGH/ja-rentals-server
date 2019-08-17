import { Apartment, IApartmentModel } from './../../models/apartment';
import { Request, Response } from 'express';

export class Controller {
  all(req: Request, res: Response): void {
    const page = +req.query.page || 1;
    const itemsPerPage = +req.query.per_page || 20;

    const query: any = {};

    if(req.query.status) {
      query.status = req.query.status;
    }

    Apartment.find(query)
      .sort({ listedAt: -1 })
      .skip((page-1) * itemsPerPage)
      .limit(itemsPerPage)
      .then(apartments => {
        Apartment.estimatedDocumentCount().then(noAppartments => {
          res.set('page-size',  Math.ceil(noAppartments >0 ? noAppartments/itemsPerPage: 0)+'');
          res.set('Access-Control-Expose-Headers', 'page-size');
          res.json(apartments);
        })
      });
  }

  update(req: Request, res: Response): void {
    const apartment = req.body as IApartmentModel;

    Apartment.findOneAndUpdate({_id : req.params.id}, {$set: apartment},{useFindAndModify: false, new: true}).then(updatedApartment => {
      res.json(updatedApartment);
    }).catch(error => {
      res.status(500).json(error);
    })
  }
}
export default new Controller();
