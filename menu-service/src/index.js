const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'menu-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'SPOON Menu Service', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Menu Service running on port ${PORT}`);
});
