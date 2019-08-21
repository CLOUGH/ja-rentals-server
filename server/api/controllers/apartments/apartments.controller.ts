import { Request, Response } from 'express';

import { Apartment, IApartmentModel } from './../../models/apartment';
import L from '../../../common/logger';

export class Controller {
  all(req: Request, res: Response): void {
    const page = +req.query.page || 1;
    const itemsPerPage = +req.query.page_size || 20;

    let query: any = {};

    if (req.query.status && req.query.status!=='Commented' ) {
      query.status = req.query.status;
    }
    if (req.query.status && req.query.status==='Commented') {
      query = {
        ...query,
        comment: {$exists: true, $ne: ''}
      }
    }

    Apartment.find(query)
      .sort({ listedAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .then(apartments => {
        Apartment.estimatedDocumentCount().then(noAppartments => {
          res.json({
            data: apartments, 
            meta: {
              pages:  Math.ceil(noAppartments > 0 ? noAppartments / itemsPerPage : 0),
              total: noAppartments,
              pageSize: itemsPerPage
            }
          });
        })
      }).catch(error => {
        L.error(error);
        res.status(500).json(error);
      });
  }

  update(req: Request, res: Response): void {
    const apartment = req.body as IApartmentModel;

    Apartment.findOneAndUpdate({ _id: req.params.id }, { $set: apartment }, { useFindAndModify: false, new: true }).then(updatedApartment => {
      res.json(updatedApartment);
    }).catch(error => {
      L.error(error);
      res.status(500).json(error);
    })
  }
}
export default new Controller();
