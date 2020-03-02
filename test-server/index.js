const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');

function readKundenData(){
    let result = [];
    try{
        result = JSON.parse(fs.readFileSync('./kunden.json', 'utf-8')  );
    } catch(err) {
        console.error(err);
    }
    return result;
}

let kundenData = readKundenData();

console.log(kundenData)

app.use(cors())

app.post('/kunden', function(req, res){
    res.json(({recordset: kundenData}))
});

app.post('/artikel', function(req, res){
    res.json(({recordset: [{Artikelnummer: 1005000056, Bezeichnung: 'Kissen'}]}))
});

app.post('/model', function(req, res){
    res.json({recordset: [{_id: 99999}]})
})



app.listen(3000, () => console.log('server started.'))