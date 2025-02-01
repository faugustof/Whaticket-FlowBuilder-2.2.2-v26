import path from "path";
import multer from "multer";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      const fileName = new Date().getTime() + path.extname(file.originalname);
      if(fileName.split('.')[1] === 'mp3' || fileName.split('.')[1] === 'ogg'|| fileName.split('.')[1] === 'opus'){
        return cb(null, fileName);
      }
      return cb(null, fileName + '.' + file.mimetype.split('/')[1]);
    }
  })
};