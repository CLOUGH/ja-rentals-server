import axios from 'axios';
import cheerio from 'cheerio';

export class GleanerService {
    getApartmentListings(): Promise<any>{
        const  url = `http://gleanerclassifieds.com/showads/ad/search/section_id/10100/menu_id//category_id/12518/keyword//title//start_rec/0/page_size/10/sort/1`;

        const listing = [];

        return axios.get(url).then(response => {
            const $ = cheerio.load(response.data);
            const detailPromises = [];
            $("body > div.main > section:nth-child(6) > div > section > div > div > section > table > tbody tr").each((i,row) => {
                if($(row).children().length>1 && $(row).find('h3>a').html()) {
                    const apartmentDetailLink = $(row).find('h3>a').attr('href');
                    
                    const promise =  axios.get(apartmentDetailLink).then(response => {
                        const $detailPage = cheerio.load(response.data);

                        const apartmentDescription = $detailPage('#ad-detail > article > div.adcontent > p')
                            .html()
                            .replace(/<\/?[^>]+(>|$)/g, "") //remove html elements from description
                            .replace(/\s{2,}/g," ")
                            .trim()
                            
                        listing.push({
                            link: $(row).find('h3>a').attr('href'),
                            dateListed:  $detailPage('#order-info > table > tbody > tr:nth-child(1) > td:nth-child(2)').html(),
                            dateExpired:  $detailPage('#order-info > table > tbody > tr:nth-child(2) > td:nth-child(2)').html(),
                            description: apartmentDescription
                        });
                        
                    });
                    detailPromises.push(promise);                    
                };
            })

            return Promise.all(detailPromises).then(() => {
                return Promise.resolve(listing);
            });

        });

    }

}   

export default new GleanerService();
