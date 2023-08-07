const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Require the API files
const fineManagement = require('./fineManagement.js');

// Use the routers for each API
app.use('/fines', fineManagement);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
