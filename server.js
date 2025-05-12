const express = require('express');
const cors = require('cors')
const {getData, getSuggestions} = require('./database')
const Stripe = require("stripe")
const bodyParser = require('body-parser');
const processOfScan = require('./scanner')
const getOffersFromAmadeus = require('./amadeus')

const app = express();
const port = 5000;
app.use(bodyParser.json({ limit: '10mb' }));
const stripe = Stripe("sk_test_51QPeZEHm1WyUJKoCG2n1bc0Zkds9ZuCM65EPAeXOyTTxVal6pmBFtCmkHAWIRCXWNVM29K0EBbdzAonIsPLSfoyV00f2Kxma0U")



const corsOptions = {
  origin: ['http://localhost:3000', 'https://kanat-air-client.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions))
app.use(express.json())
app.options('*', cors(corsOptions));


app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});










app.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const {originCity, destinationCity, departureDate, arrivalDate, adults, children, infants} = req.body  
  
  try {
    
    const gettedOriginCity = await getData(originCity)
    const gettedDestinationCity = await getData(destinationCity) 
    
    
    
    // const flights = await searchFlightsFromDuffel(gettedOriginCity, gettedDestinationCity, departureDate, arrivalDate)
    const flights = await getOffersFromAmadeus(gettedOriginCity, gettedDestinationCity, departureDate, adults, children, infants)
    // res.status(201).json({message: 'Ответ получен', text})
    res.status(200).json({flights})
  } catch (error) {
    console.error('Error fetching flight offers:', error);
    res.status(500).json({
      error: 'Failed to fetch flight offers',
      details: error.response?.data || error.message,
    })
  }
})

app.post('/suggestions', async (req, res) => {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const {text} = req.body;



  try {
    const suggestions = await getSuggestions(text)
    res.status(200).json({suggestions})
  } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
  }
});
// Настраиваем загрузку файлов

// Маршрут для сканирования паспорта
app.post("/scanner", async (req, res) => {
  try {
    const { imageBase64 } = req.body

    if(!imageBase64){
      return res.status(400).json({error: "Требуется изображение!"})
    }

    const result = await processOfScan(imageBase64)

    res.status(200).json({success: true, data: result})
  } catch(err) {
    console.error("Ошибка обработки изображения:", err);
    res.status(500).json({error: "Ошибка обработки изображения"})
  }
})



//Реализация платежа
app.post("/payment", async (req, res) => {
  const {amount, currency} = req.body

  try{
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card']
    })

    console.log("Платежное намерение создано:", paymentIntent);
    res.send({
      clientSecret: paymentIntent.client_secret
    })
  } catch (err){
    console.error("Ошибка при создании платежного намерения:", err);
    res.status(400).send({error: err.message })
  }
})




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
