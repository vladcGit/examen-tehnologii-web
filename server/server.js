const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', require('./routes'));
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

const port = process.env.PORT || 3001;

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log('Server started');
});
