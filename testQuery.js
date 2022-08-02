const querystring = require('querystring');
const request = require('request');
const fs = require('fs');





console.log("the getrequest file....")


const urlRequest = (strURL, error, returnData) => {
	request({method: 'GET', url: strURL}, (err, res, body) => {
		if(err) {
			error(strURL);
			return;
		}

		returnData(

            body
			 
		);
	});
};


 


let ipAddress = '22.56.73.212';
let adr = `http://ip-api.com/json/${ipAddress}`;


let getURLData = urlRequest(adr, 
    (urlError) => {console.log("An error occurred for URL " + urlError); }, 
     (returnedData) => {

        console.log(returnedData);

    });




return;
