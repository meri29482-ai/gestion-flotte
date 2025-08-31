const nodemailer = require("nodemailer");

exports.envoyerCodeParEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "chaimabourersa@gmail.com",
      pass: "uvor omcl emhf jxdm"
    },
    tls: {
      rejectUnauthorized: false // ✅ ignore les certificats auto-signés
    }
  });

  const mailOptions = {
    from: '"Gestion Flotte" <ton_email@gmail.com>',
    to: email,
    subject: "🔐 Code de vérification",
    text: `Votre code de vérification est : ${code}`
  };

  await transporter.sendMail(mailOptions);
};
