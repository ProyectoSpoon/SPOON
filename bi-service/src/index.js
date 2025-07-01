const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'bi-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'SPOON BI Service', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`BI Service running on port ${PORT}`);
});
