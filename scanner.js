const vision = require('@google-cloud/vision')
// const axios = require('axios')
require('dotenv').config()


const client = new vision.ImageAnnotatorClient({
    keyFilename: 'C:\\Users\\user\\Downloads\\secret_key.json',
})


const processOfScan = async (imageBase64) => {
    try {
        const [result] = await client.textDetection({
            image: {
                content: imageBase64, // Передаём строку Base64 в поле content
            },
        });

        const detections = result.textAnnotations;
        console.log('Detected text:');
        detections.forEach(text => console.log(text.description));

        return {
            success: true,
            data: detections.map(text => text.description), // Возвращаем массив найденного текста
        };
    } catch (error) {
        console.error('Error during text detection:', error);
        return {
            success: false,
            error: 'Failed to detect text from the image.',
        };
    }






    // try {
    //     const apiUrl = 'https://api.ocr.space/parse/image'
    //     const apiKey = process.env.MRZ_API_KEY

    //     const response = await axios.post(
    //         apiUrl,
    //         {image: imageBase64},
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${apiKey}`
    //             }
    //         }
    //     )
    //     return response.data
    // } catch (err) {
    //     console.error('Error processing passport:', err.message);
    //     throw new Error('Failed to process passport.');
    // }
}

module.exports = processOfScan