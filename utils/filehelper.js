const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("error, unable to delete link of file in database");
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
