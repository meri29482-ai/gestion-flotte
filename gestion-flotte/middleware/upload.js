const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Obtenir le chemin de destination selon le champ
const getUploadPath = (fieldname) => {
  switch (fieldname) {
    case "vehiculePhoto":
      return path.join(__dirname, "../uploads/vehicules");
    case "document":
    default:
      return path.join(__dirname, "../uploads/documents");
  }
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = getUploadPath(file.fieldname);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const nom = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileNameSanitized = nom.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, `${fileNameSanitized}-${uniqueSuffix}${ext}`);
  }
});

// Filtres de validation des fichiers
const allowedExtensions = [
  ".jpg", ".jpeg", ".png", ".jfif",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Format de fichier non autorisé. Formats acceptés : jpg, jpeg, png, jfif."));
  }
};

// Instance de l'upload
const upload = multer({ storage, fileFilter });

module.exports = upload;
