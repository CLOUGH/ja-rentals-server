import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import { Types as mongooseTypes } from 'mongoose';

import { Apartment, IApartmentModel } from '../models/apartment';
import L from '../../common/logger';

export class GleanerService {
  async executePipeline() {
    return Apartment.aggregate([
      {
        '$group': {
          '_id': {
            'description': '$description'
          },
          'uniqueIds': {
            '$addToSet': '$_id'
          },
          'source': {
            '$last': '$source'
          },
          'description': {
            '$last': '$description'
          },
          'listedAt': {
            '$last': '$listedAt'
          },
          'firstListedAt': {
            '$first': '$listedAt'
          },
          'expiresAt': {
            '$last': '$expiresAt'
          },
          'status': {
            '$addToSet': '$status'
          },
          'comment': {
            '$addToSet': '$comment'
          },
          'originalLink': {
            '$last': '$originalLink'
          },
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$project': {
          '_id': false,
          'source': '$source',
          'description': '$description',
          'listedAt': '$listedAt',
          'expiresAt': '$expiresAt',
          'originalLink': '$originalLink',
          'status': {
            '$reduce': {
              'input': '$status',
              'initialValue': '',
              'in': {
                '$concat': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'comment': {
            '$reduce': {
              'input': '$comment',
              'initialValue': '',
              'in': {
                '$concat': [
                  '$$value', '$$this'
                ]
              }
            }
          },
          'firstListedAt': '$firstListedAt'
        }
      }
    ]).then( response => response).catch(error => error);

  }
  async scrapeAppartments(): Promise<IApartmentModel[]> {

    const offset = 0;
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
            const source = 'Gleaner';

            return Apartment.findOne({ description }).then(apartment => {
              if (apartment) {
                return Apartment.useFindAndModify({_id: apartment._id}, {
                  source,
                  description,
                  originalLink,
                  listedAt,
                  expiresAt,
                  firstListedAt: apartment.firstListedAt
                }) as IApartmentModel;
              }
              const newApartment = new Apartment({
                source,
                description,
                originalLink,
                listedAt,
                firstListedAt:listedAt,
                expiresAt
              });

              return newApartment.save().catch(error => error) as IApartmentModel;
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
