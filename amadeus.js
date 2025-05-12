const Amadeus = require("amadeus");
const dotenv = require("dotenv");
dotenv.config();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_USER_ID,
  clientSecret: process.env.AMADEUS_USER_SECRET
});

// Функция для получения авиабилетов
const getOffersFromAmadeus = (gettedOriginCity, gettedDestinationCity, departureDate, adults, children, infants) => {  
  return new Promise((resolve, reject) => {
    amadeus.shopping.flightOffersSearch.get({
      originLocationCode: gettedOriginCity,
      destinationLocationCode: gettedDestinationCity,
      departureDate: departureDate,
      adults: adults,
      children: children,
      infants: infants
    }).then(response => {
      const offers = response.data;

      // Получаем уникальные коды авиакомпаний из офферов
      const airlineCodes = [...new Set(offers.flatMap(offer => 
        offer.validatingAirlineCodes || []
      ))];

      if (airlineCodes.length === 0) {
        return resolve(offers);
      }

      // Получаем информацию об авиакомпаниях
      amadeus.referenceData.airlines.get({
        airlineCodes: airlineCodes.join(',')
      }).then(airlineResponse => {
        const airlines = airlineResponse.data.reduce((acc, airline) => {
          acc[airline.iataCode] = {
            name: airline.businessName || airline.commonName || airline.iataCode,
            logo: `https://content.airhex.com/content/logos/airlines_${airline.iataCode}_200_200_s.png`
          };
          return acc;
        }, {});

        // Добавляем данные об авиакомпаниях в офферы
        const enrichedOffers = offers.map(offer => ({
          ...offer,
          airlineInfo: airlines[offer.validatingAirlineCodes?.[0]] || {}
        }));

        resolve(enrichedOffers);
      }).catch(err => {
        console.error("Ошибка при получении авиакомпаний:", err);
        resolve(offers); // Возвращаем без информации об авиакомпании
      });

    }).catch(error => {
      console.error("Ошибка при получении данных:", error.response);
      reject(error);
    });
  });
};

module.exports = getOffersFromAmadeus