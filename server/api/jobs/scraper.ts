import GleanerService  from './../services/gleaner.service';
import cron from 'node-cron';


export default class Scraper {
    constructor(){

    }

    init() {
        cron.schedule('*/30 * * * *', () => {
        console.log('running a task every 30 mins');
            GleanerService.scrapeAppartments();
        });
    }
}