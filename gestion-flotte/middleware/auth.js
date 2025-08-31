const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Assure-toi que JWT_SECRET est bien défini

    req.user = {
      id: decoded.id,  // ⚠️ Assure-toi que "id" est bien présent dans le payload du token
      nom: decoded.nom,
      prenom: decoded.prenom,
      numero_telephone: decoded.numero_telephone,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};
