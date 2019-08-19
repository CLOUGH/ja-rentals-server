import cron from 'node-cron';
import moment from 'moment';

import L from '../../common/logger'
import GleanerService  from './../services/gleaner.service';


export default class Scraper {
    scraperCronSchedule: string;
    constructor(){
        this.scraperCronSchedule = process.env.SCRAPER_CRON_SCHEDULE;
    }

    init() {
        cron.schedule(this.scraperCronSchedule, () => {
            L.info('Scraper job started at '+moment().format('MMMM Do YYYY, h:mm:ss a'));
            GleanerService.scrapeAppartments().then(response => {
                L.info(`Scraper job completed at ${moment().format('MMMM Do YYYY, h:mm:ss a')} and processed ${response.length} records`);
            }).catch(error => {
                L.info(`Scraper job failed at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
            });
        });
    }
}