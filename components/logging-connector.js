const url = "http://theia.protronic-gmbh.de:4040/";

function sendLogToLogstash(errorObj) {
    fetch(url, {
        method: "POST",
        body: JSON.stringify(errorObj),
        headers: {"Content-Type": "application/json"}
    })
        .then(response => {
            console.log({status: response.status, statusText: response.statusText})
        })
}

module.exports = {sendLogToLogstash};