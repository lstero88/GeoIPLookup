var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const express = require('express');
let backend = require("./backend");

const path = require('path');
const url = require('url');
const querystring = require('querystring');

let database = require("./sql");

let srcFolderName, srcFolderID;
let txtFileFolderName, txtFilesFolderID;
let csvFileFolderName, csvFilesFolderID;
let graphFileFolderName, graphFilesFolderID;


let folders = {
   'srcfiles': '1__Tsbwv5KgVt6Ax_Kc5VsRsXq7b_Jmun',
   'txttiles': '1aBOYl4whyoyINeoEq9GoazubTRsTXWcP',
   'csvfiles': '138IvW05lR0v3xLo6exGQkgX4OFhP4RgX',
   'graphfiles': '1BEBmZ_y8BOTP-ykxstsYafjxOQ4QHOy-',
}
let appName = {
   'app8': 'GeoIP Lookup'
}

let appHTMLPage = "app8.html"

function removeComments(string) {
   return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
}


function initializeFolders() {
   for ([index, [key, value]] of Object.entries(Object.entries(folders))) {
      console.log(`${index}: ${key}: ${value}`);
      if (index == 0) {
         srcFolderName = key;
         srcFolderID = value;
      } else if (index == 1) {
         txtFileFolderName = key;
         txtFilesFolderID = value;
      } else if (index == 2) {
         csvFileFolderName = key;
         csvFilesFolderID = value;
      } else if (index == 3) {
         graphFileFolderName = key;
         graphFilesFolderID = value
      }
   }
}
initializeFolders();
let DriveApp = new backend.registerBackend(srcFolderName, srcFolderID, txtFileFolderName, txtFilesFolderID, csvFileFolderName, csvFilesFolderID.graphFileFolderName, graphFilesFolderID);


function loadFile(filePath) {
   let array1 = [];
   require('fs').readFileSync(filePath, 'utf-8').split(/\r?\n/).forEach(function (line) {
      array1.push(line);
   })
   return array1;
}


function getTotalPages(resultsPerPage, totalLength) {


   let determinePageCount = totalLength % resultsPerPage;
   let pageCount;

   if (determinePageCount > 0) {
      pageCount = Math.ceil(totalLength / resultsPerPage);

   } else {
      pageCount = totalLength / resultsPerPage;
   }


   return pageCount;

}


app.use(express.static('public'));
app.use('/images', express.static('images'));
app.get('/', function (req, res) {
   res.sendFile('index.html', {
      root: '.'
   });
});


io.on('connection', function (socket) {

   socket.emit('connection_accept', '');

   socket.on('client_msg', function (message) {

      let htmlPage;
      let jsData;
      let htmlData;
      let parseJSON = message;
      htmlPage = parseJSON.appHTML;
      if (parseJSON.command == 'loadApp') {

         let buildJS = "";
         let buildHTML = "";

         documentData = {
            returnType: 'loadedAppData',
            javascript: buildJS,
            html: buildHTML
         };
         socket.emit('server_msg', JSON.stringify(documentData));

      } else if (parseJSON.command == 'getIPInfoSQLData') {


         let idNumber = parseJSON.entryID;

         database.getSpecifiedEntryByID(idNumber, (result) =>

            {
               documentData = {
                  returnType: 'getIPInfoSQLDataRetrieved',
                  entryData: result

               };

               socket.emit('server_msg', JSON.stringify(documentData));


            });


      } else if (parseJSON.command == 'lookupIPAddress') {

         let ipAddress = parseJSON.ipAddress;
         database.addEntry(ipAddress, function (result) {


            if (result[0] === 'Success') {
               documentData = {
                  returnType: 'ipAddressAdded',
                  ipAddress: result[1],
                  id: result[2]

               };


               socket.emit('server_msg', JSON.stringify(documentData));

            }


         });


      } else if (parseJSON.command == 'loadPage') {


         let pageNumber = parseJSON.parameters.pageNumber;
         let resultsPerPage = parseJSON.parameters.resultsPerPage;

         database.getRecordCount((response) => {

            let totalRecords = response;

            let resultsPerPage = parseJSON.parameters.resultsPerPage;
            let pageCount = getTotalPages(resultsPerPage, totalRecords);

            let focusFirst = parseJSON.focusFirst;

            database.getEntryRange(pageNumber, resultsPerPage, (response) => {

               if (focusFirst == true) {

                  documentData = {
                     returnType: 'pageNumberReturnData',
                     pageNumber: pageNumber,
                     pageCount: pageCount,
                     response: response,
                     focusFirst: response[0].id
                  };


               } else {

                  documentData = {
                     returnType: 'pageNumberReturnData',
                     pageNumber: pageNumber,
                     pageCount: pageCount,
                     response: response
                  };
               }

               socket.emit('server_msg', JSON.stringify(documentData));

            });

         });


      } else if (parseJSON.command == 'getIPAddressList') {

         database.getAllEntries((response) => {
            documentData = {
               returnType: 'ipAddressListRetrieved',
               response: response

            };

            socket.emit('server_msg', JSON.stringify(documentData));

         });

      }


   });

   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });


});


database.connectToDatabase((response, error) => {


   console.log(response);

   http.listen(process.env.PORT || 3000, function () {
      console.log('listening on *:3000');

   });


});