const mysql = require('mysql');
const querystring = require('querystring');
const request = require('request');
const fs = require('fs');


let urlRequestType = 1;
const dbConfiguration = {

   host: '127.0.0.1',
   user: 'root',
   password: '',
   database: 'geoIPLookup'
};


let db;

const urlRequest = (strURL, error, returnData) => {
   request({
      method: 'GET',
      url: strURL
   }, (err, res, body) => {
      if (err) {
         error(strURL);
         return;
      }

      returnData(
         body
      );
   });
};


function connectToDatabase(callback, error) {

   db = mysql.createConnection(dbConfiguration);

   db.connect((err) => {

      if (err) {
         throw err;

      }

      callback('SQL connection success');

   });
}


const getDate = () => {
   let currentDate = new Date();
   let dd = currentDate.getDate();
   let mm = currentDate.getMonth() + 1;
   let yyyy = currentDate.getFullYear();
   if (dd < 10) {
      dd = '0' + dd;
   }
   if (mm < 10) {
      mm = '0' + mm;
   }
   currentDate = mm + '/' + dd + '/' + yyyy;
   return currentDate;
}


function getSpecifiedEntryByID(idNumber, callback) {

   let specificEntry = `SELECT * FROM iplogs WHERE id = '${idNumber}'`;

   db.query(specificEntry, (err, data) => {
      if (err) throw err;


      const result = Object.values(JSON.parse(JSON.stringify(data)));

      callback(result);


   });

}

function getSpecifiedEntry(ipAddress) {

   let specificEntry = `SELECT * FROM iplogs WHERE ipAddress = '${ipAddress}'`;

   db.query(specificEntry, (err, data) => {
      if (err) throw err;

      const result = Object.values(JSON.parse(JSON.stringify(data)));

      console.log("Single IP request completed.");


   });

}

function getRecordCount(callback) {

   let countStatement = 'SELECT COUNT(*) as theCount FROM iplogs';

   db.query(countStatement, (err, data) => {

      if (err) throw err;

      let result = data[0].theCount;
      callback(result);

   });

}


function getEntryRange(pageNumber, resultsPerPage, callback) {


   if (pageNumber <= 0) {

      pageNumber = 1;

   }

   let x = (pageNumber - 1) * resultsPerPage;
   let rangeQuery = 'SELECT id, date, ipAddress FROM iplogs ORDER BY id DESC LIMIT ' + x + ', ' + resultsPerPage;


   db.query(rangeQuery, (err, data) => {
      if (err) throw err;

      let to_mmddyyyy;
      data.forEach((x) => {
         to_mmddyyyy = new Intl.DateTimeFormat('en-US').format(new Date(x.date));
         x.date = to_mmddyyyy;
      });


      const result = Object.values(JSON.parse(JSON.stringify(data)));


      callback(result);


   });


}

function getAllEntries(callback) {
   let allEntries = 'SELECT id, date, ipAddress FROM iplogs ORDER BY id DESC';

   db.query(allEntries, (err, data) => {
      if (err) throw err;

      let to_mmddyyyy;

      data.forEach((x) => {
         to_mmddyyyy = new Intl.DateTimeFormat('en-US').format(new Date(x.date));
         x.date = to_mmddyyyy;
      });


      const result = Object.values(JSON.parse(JSON.stringify(data)));

      callback(result);

      console.log("data retrieval complete.");

   });
}

function createTable() {


   let createTable = 'CREATE TABLE ipLogs(id int AUTO_INCREMENT, date DATE, ipAddress VARCHAR(255), country VARCHAR(255), countryCode VARCHAR(255), region VARCHAR(255), regionName VARCHAR(255), city VARCHAR(255), zip VARCHAR(255), latitude VARCHAR(255), longitude VARCHAR(255), timeZone VARCHAR(255), isp VARCHAR(255), as1 VARCHAR(255), PRIMARY KEY (id) )';

   db.query(createTable, (err, result) => {
      if (err) throw err;
      console.log(result);

   });

}


function addEntry(ipAddress, callback) {

   if (urlRequestType == 0) // For testing purposes only. Used to prevent excessive requests to remote server.
   {
      let jsonString = `{"status":"success","country":"United States","countryCode":"US","region":"AL","regionName":"Alabama","city":"Birmingham","zip":"35206","lat":33.5699,"lon":-86.724,"timezone":"America/Chicago","isp":"University of Alabama at Birmingham","org":"University of Alabama at Birmingham - Computer Center","as":"AS3452 University of Alabama at Birmingham","query":"${ipAddress}"}`;
      let json = JSON.parse(jsonString)

      if (json.status === 'success') {

         let id = json.id;
         let country = json.country;
         let countryCode = json.countryCode;
         let region = json.region;
         let regionName = json.regionName;
         let city = json.city;
         let zip = json.zip;
         let latitude = json.lat;
         let longitude = json.lon;
         let timeZone = json.timezone;
         let isp = json.isp;
         let as1 = json.as;
         let ipQuery = json.query;

         let dateFormat1 = new Date().toISOString().slice(0, 19).replace('T', ' ')

         let recordEntry = {

            date: dateFormat1,
            ipAddress: ipQuery,
            country: country,
            countryCode: countryCode,
            region: region,
            regionName: regionName,
            city: city,
            zip: zip,
            latitude: latitude,
            longitude: longitude,
            timeZone: timeZone,
            isp: isp,
            as1: as1

         };


         let sqlInsert = 'INSERT INTO iplogs SET ?';

         db.query(sqlInsert, recordEntry, (err, result) => {

               if (err) throw err;
               console.log(result);
               console.log(result.insertId);

               let insertID = result.insertId;
               callback(['Success', ipQuery, insertID]);

            }


         );
      }


   } else {

      let adr = `http://ip-api.com/json/${ipAddress}`;


      let getURLData = urlRequest(adr,
         (urlError) => {
            console.log("An error occurred for URL " + urlError);
         },
         (returnedData) => {

            let jsonString = returnedData;


            let json = JSON.parse(jsonString)


            if (json.status === 'success') {

               let id = json.id;
               let country = json.country;
               let countryCode = json.countryCode;
               let region = json.region;
               let regionName = json.regionName;
               let city = json.city;
               let zip = json.zip;
               let latitude = json.lat;
               let longitude = json.lon;
               let timeZone = json.timezone;
               let isp = json.isp;
               let as1 = json.as;
               let ipQuery = json.query;


               let dateFormat1 = new Date().toISOString().slice(0, 19).replace('T', ' ')


               let recordEntry = {

                  date: dateFormat1,
                  ipAddress: ipQuery,
                  country: country,
                  countryCode: countryCode,
                  region: region,
                  regionName: regionName,
                  city: city,
                  zip: zip,
                  latitude: latitude,
                  longitude: longitude,
                  timeZone: timeZone,
                  isp: isp,
                  as1: as1

               };


               let sqlInsert = 'INSERT INTO iplogs SET ?';

               db.query(sqlInsert, recordEntry, (err, result) => {

                     if (err) throw err;
                     console.log(result);
                

                     let insertID = result.insertId;
                     callback(['Success', ipQuery, insertID]);

                  }


               );
            }


         });


   }

}


exports.database = db;
exports.addEntry = addEntry;
exports.connectToDatabase = connectToDatabase;
exports.getAllEntries = getAllEntries;
exports.getSpecifiedEntryByID = getSpecifiedEntryByID;
exports.getRecordCount = getRecordCount;
exports.getEntryRange = getEntryRange;