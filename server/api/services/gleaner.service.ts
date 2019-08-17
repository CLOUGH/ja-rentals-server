import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import { Types as mongooseTypes } from 'mongoose';

import { Apartment, IApartmentModel } from '../models/apartment';
import L from '../../common/logger';

export class GleanerService {
    async scrapeAppartments(): Promise<IApartmentModel[]> {

        const offset  = 0;
        const itemsPerPage = 100;
        let pages = 1;

        const url = `http://gleanerclassifieds.com/showads/ad/search/section_id/10100/menu_id//category_id/12518/keyword//title//start_rec/${offset}/page_size/${itemsPerPage}/sort/1`;

        const listing: IApartmentModel[] = [];

        return axios.get(url).then(response => {
            const $ = cheerio.load(response.data);

            const detailPromises = [];

            $("body > div.main > section:nth-child(6) > div > section > div > div > section > table > tbody tr").each((i, row) => {
                if ($(row).children().length > 1 && $(row).find('h3>a').html()) {
                    const apartmentDetailLink = $(row).find('h3>a').attr('href');

                    const promise = axios.get(apartmentDetailLink).then(response => {
                        const $detailPage = cheerio.load(response.data);

                        const description = $detailPage('#ad-detail > article > div.adcontent > p')
                            .html()
                            .replace(/<\/?[^>]+(>|$)/g, "") //remove html elements from description
                            .replace(/\s{2,}/g, " ")
                            .trim();

                        const originalLink = $(row).find('h3>a').attr('href');
                        const listedAt = moment($detailPage('#order-info > table > tbody > tr:nth-child(1) > td:nth-child(2)').html(), 'MM/DD/YYYY').toDate();
                        const expiresAt = moment($detailPage('#order-info > table > tbody > tr:nth-child(2) > td:nth-child(2)').html(), 'MM/DD/YYYY').toDate();
                        const match = /ad_id\/(\d+)/ig.exec(originalLink);
                        const key = match ? match[1] : null;


                        return Apartment.findOne({ key }).then(apartment => {
                            if(apartment) {
                                return apartment as IApartmentModel;
                            }
                            const newApartment = new Apartment({
                                description,
                                originalLink,
                                listedAt,
                                expiresAt,
                                key
                            });
    
                            return newApartment.save().catch(error=>error) as IApartmentModel;
                        });
                    });
                    detailPromises.push(promise);
                };
            })

            return Promise.all(detailPromises).then(apartments => {
                return Promise.resolve(apartments);
            });
        });

    }

}

export default new GleanerService();
