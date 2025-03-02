const express = require('express');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const cors = require('cors'); // Импортируем пакет cors
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Используем cors

app.post('/api/payment', async (req, res) => {
  const { amount, email } = req.body;
  const robokassaUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
  const login = process.env.ROBOKASSA_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD1;
  
  const data = {
    MerchantLogin: login,
    OutSum: amount,
    Description: 'Payment for services',
    Email: email,
    
  };

  // Рассчитываем сигнатуру подписи
  const signatureValue = CryptoJS.MD5(`${login}:${amount}:${password1}:Email=${email}`).toString();

  data.SignatureValue = signatureValue;

  try {
    const response = await axios.post(robokassaUrl, null, { params: data });
    res.json({ paymentUrl: response.request.res.responseUrl });
  } catch (error) {
    console.error('Payment failed', error);
    res.status(500).send('Payment failed');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
