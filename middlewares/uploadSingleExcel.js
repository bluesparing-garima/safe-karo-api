import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadSingle = upload.single("excel");

export default uploadSingle ;
