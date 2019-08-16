import { Request, Response } from 'express';

import GleanerService  from '../../services/gleaner.service';
import ExamplesService from '../../services/examples.service';

export class ScapperController {
  all(req: Request, res: Response): void {
    
    GleanerService.getApartmentListings().then(listings => {
      res.status(200).json(listings);
    })
    .catch(error => {
      res.status(500).send(error);
    });
  }
}
export default new ScapperController();
