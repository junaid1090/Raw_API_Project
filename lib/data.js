/*
 * Title: Data Library
 * Description: Data Library functions for CRUD
 * Date: 02/03/2023
 *
 */

// dependencies
const fs = require('node:fs');
const path = require('node:path');

// module saffolding
const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for creating
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file then close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing the new file!');
                        }
                    });
                } else {
                    callback('Error writir to new file!');
                }
            });
        } else {
            callback(err);
        }
    });
};

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// updating existing file
lib.update = (dir, file, data, callback) => {
    // file open for writting
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err1, fileDescriptor) => {
        if (!err1 && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // truncate the file
            fs.ftruncate(fileDescriptor, (err2) => {
                if (!err2) {
                    // write to the file and close it.
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (!err3) {
                            fs.close(fileDescriptor, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to file ');
                        }
                    });
                } else {
                    callback('Error trucating file!');
                }
            });
        } else {
            callback('Error updating. file may not exist');
        }
    });
};

// delete existing file
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

//list all the item in a directory
lib.list = (dir, callback)=> {
    fs.readdir(`${lib.basedir + dir}/`, (err, flieNames)=> {
        if(!err && flieNames && flieNames > 0){
            const trimmedFileNames = [];
            flieNames.forEach((flieName) =>{
                trimmedFileNames.push(flieName.replace('.json', ''));
            });

            callback(false, trimmedFileNames);
        } else{
            callback('Error reading directory!')
        }
    });
};

module.exports = lib;
