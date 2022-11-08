const express = require('express')
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Cute Photography API running');
});

app.listen(port, () => {
    console.log('Cute Photography server is running on port', port);
})