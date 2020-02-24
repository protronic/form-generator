const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');

let kundenData = JSON.parse(fs.readFileSync('../kunden.json', 'utf-8'));

app.use(cors())

app.post('/kunden', function(req, res){
    res.json(({recordset: kundenData}))
});


app.listen(3000, () => console.log('server started.'))