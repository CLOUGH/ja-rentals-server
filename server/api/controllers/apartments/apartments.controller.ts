import { Apartment, IApartmentModel } from './../../models/apartment';
import { Request, Response } from 'express';

export class Controller {
  all(req: Request, res: Response): void {
    const page = +req.query.page || 1;
    const itemsPerPage = +req.query.per_page || 20;
    Apartment.find({})
      .sort({ listedAt: -1 })
      .skip((page-1) * itemsPerPage)
      .limit(itemsPerPage)
      .then(apartments => {
        Apartment.count().then(noAppartments => {
          res.set('page-size',  Math.ceil(noAppartments >0 ? noAppartments/itemsPerPage: 0)+'');
          res.set('Access-Control-Expose-Headers', 'page-size');
          res.json(apartments);
        })
      });
  }

  byId(req: Request, res: Response): void {
    // ExamplesService.byId(req.params.id).then(r => {
    //   if (r) res.json(r);
    //   else res.status(404).end();
    // });
  }
}
export default new Controller();
