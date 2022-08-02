const fs = require('fs');
const path = require('path');
class registerBackend {
	constructor(srcFolderName, srcFolderID, txtFileFolderName, txtFileFolderID, csvFileFolderName, csvFileFolderID) {
		this.srcFolderName = srcFolderName;
		this.srcFolderID = srcFolderID;
		this.txtFileFolderName = txtFileFolderName;
		this.txtFileFolderID = txtFileFolderID;
		this.csvFileFolderName = csvFileFolderName;
		this.csvFileFolderID = csvFileFolderID;
	}
	getFilesByName(folder, file) {
		let array1 = [];
		if(fs.existsSync(folder + '/' + file)) {
			require('fs').readFileSync(folder + '/' + file, 'utf-8').split('\r\n').forEach(function(line) {
				if(line == 0) {
					array1.push("<br/>");
				}
				array1.push(line + "<br/>");
			});
			return array1;
		}
	}
	getFiles(folder) {
		let line = [];
		let fileListArray = [];
		fs.readdirSync(folder).forEach(file => {
			// File size
			const fSize = fs.statSync(folder + '/' + file).size;
			// Get file extension
			const fExtension = path.extname(file);
			// Get file creation date
			const fModificationDate = fs.statSync(folder + '/' + file).mtime;
			line = [file, fSize, fExtension, fModificationDate];
			fileListArray.push(line);
		});
		return fileListArray;
	}
	getFolderById(folderID) {
		if(this.txtFileFolderID == folderID) {
			return this.txtFileFolderName;
		} else if(this.csvFileFolderID == folderID) {
			return this.csvFileFolderName;
		}
	}
	getFileSizeInMB(fileName) {
		let stat = fs.statSync(fileName)
		let fileSizeInBytes = stat.size;
		return fileSizeInBytes / (1024 * 1024);
	}
}
module.exports = {
	registerBackend
}
 

 

 


 