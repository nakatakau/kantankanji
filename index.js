const express = require('express')
const app = express()
// cors
const cors = require('cors');
// 一旦停止
app.use(cors());
const bodyParser = require('body-parser')
const request = require('request')
const port = process.env.PORT || 5500;
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.post('/auth/', (req, res) => {
    const options = {
        method: 'GET',
        url: req.body.url,
        json: true,
    };
    request(options, function(error, response, body) {
        res.send(body);
    });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
