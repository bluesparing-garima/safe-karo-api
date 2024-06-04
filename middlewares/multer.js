import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination:function(req, file, cb){
      if(file.mimetype === 'image/jpeg' 
      || file.mimetype === 'image/png'){
          cb(null,path.join(__dirname,'../public/image'));
      }
      else{
          cb(null,path.join(__dirname,'../public/document'));
      }
  },
  filename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null,name);
  }
});

const fileFilter = (req,file,cb) => {
  if (file.fieldname === "image") {
      (file.mimetype === 'image/jpeg' 
       || file.mimetype === 'image/png')
      ? cb(null,true)
      : cb(null,false);
  }
  else if(file.fieldname === "document"){
      (file.mimetype === 'application/msword' 
      || file.mimetype === 'application/pdf')
      ? cb(null,true)
      : cb(null,false);
  }
}

const upload = multer({
  storage:storage,
  fileFilter:fileFilter
});

export default upload;
