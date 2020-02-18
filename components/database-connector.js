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

function prepareModel(model, formular){
    let user = '';
    let changedTime = (new Date()).getTime();

    try{
        user = wikiContext.UserName;
    } catch(err) {
        console.log('wikiContext not in scope.');
        console.error(err);
    }

    model['#parentForm'] = formular;
    model['#changed_user'] = user;
    model['#changed_time'] = changedTime;

    return JSON.stringify(JSON.stringify(model)).slice(1, -1);
}

function uploadModel(model, formular){
    let serialModel = prepareModel(model, formular);
    console.log(`{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`)
    fetch('http://prot-subuntu:8081/formly', {
        method: 'POST',
        body: `{"q": "INSERT INTO model (log) VALUES ('${serialModel}');SELECT TOP 1 _id FROM model WHERE log = '${serialModel}' ORDER BY _id DESC;"}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(dataRows => dataRows.recordset)
}