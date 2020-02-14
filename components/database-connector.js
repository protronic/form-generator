let uri = 'http://prot-subuntu:8081/master';

function testRequest(artikelnummer){
    fetch(uri, {
        method: 'POST',
        body: JSON.stringify({q: `SELECT Artikelnummer, Matchcode FROM [prot-sage11].OLReweAbf.dbo.KHKArtikel WHERE Artikelnummer LIKE '${artikelnummer}'`}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(dataRows => console.log(dataRows.recordset));
}


