import { Request, Response } from 'express';
import fs from 'fs';

import GleanerService  from '../../services/gleaner.service';
import ExamplesService from '../../services/examples.service';

export class ScapperController {
  all(req: Request, res: Response): void {
    
    GleanerService.scrapeAppartments().then(listings => {
      res.status(200).json(listings);
    })
    .catch(error => {
      res.status(500).send(error);
    });
  }

  exportPipeline(req: Request, res: Response){
    GleanerService.executePipeline().then(response=>{

      fs.writeFile("./pipleline-export.json", JSON.stringify(response, null, 4), (err) => {
        if (err) {  console.error(err);  return; };
        console.log("File has been created");
      });

      res.status(200).json(response);
    }).catch(err => res.status(500).json(err));
  }
}
export default new ScapperController();
