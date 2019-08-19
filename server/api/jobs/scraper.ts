import GleanerService  from './../services/gleaner.service';
import cron from 'node-cron';


export default class Scraper {
    constructor(){

    }

    init() {
        cron.schedule('* * */6 * *', () => {
            console.log('hourly cron job ran');
            GleanerService.scrapeAppartments();
        });
    }
}