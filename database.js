const mysql2 = require('mysql2')
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql2.createConnection({
    host: process.env.MySQLhost,
    port: process.env.MySQLport,
    user: process.env.MySQLuser,
    password: process.env.MySQLpassword,
    database: process.env.MySQLhostdatabase
})

connection.connect((err) => {
    if(err){
        console.error("Ошибка подключения к MySQL:", err)
        return
    }
    console.log("Успешное подключение к MySQL!")
})


const getData = (textToSearch) => {  
    return new Promise((resolve, reject) => {
      const sql = 'SELECT code_in_iata FROM cities WHERE city LIKE ? LIMIT 10';

      connection.query(sql, [`%${textToSearch}%`], (err, results) => {
        if (err) {
          console.error('Ошибка при выполнении запроса:', err);
          reject(err); // Отправляем ошибку
          return
        }
  
        if (results) {
          const [{ code_in_iata }] = results; // Деструктурируем результат
          resolve(code_in_iata); // Возвращаем значение          
        } else {
            console.log("Ничего не найдено!");
          resolve(null); // Если ничего не найдено
        }
      });
    });
  };
  


  const getSuggestions = (text) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT city FROM cities WHERE city LIKE ?'

      connection.query(sql, [`%${text}%`], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            reject(err);
            return
        }
        
        if(results){
          const suggestions = results.map(row => ({ city: row.city }));
          resolve(suggestions);
        } else {
          console.log("Ничего не найдено!");
          resolve(null); // Если ничего не найдено
        }
      })
    })
  }

module.exports = {
  getData,
  getSuggestions
}
// connection.end()