const pool = require('../config/database');

async function rechercher(req, res) {
  const metier = (req.query.metier || '').trim();
  const zone = (req.query.zone || '').trim();

  if (!metier && !zone) {
    return res.status(400).json({ message: 'Indiquez un métier ou une zone' });
  }

  try {
    const conditions = [];
    const valeurs = [];

    if (metier) {
      valeurs.push(`%${metier}%`);
      conditions.push(`metier ILIKE $${valeurs.length}`);
    }
    if (zone) {
      valeurs.push(zone);
      conditions.push(`EXISTS (
        SELECT 1 FROM professionnel_zone pz
        WHERE pz.id_pro = profil_publie.id_pro AND pz.zone = $${valeurs.length}
      )`);
    }

    const requete = `
      SELECT id_pro, nom, prenom, metier, annees_experience,
        (SELECT miniature FROM photo ph WHERE ph.id_pro = profil_publie.id_pro
          ORDER BY id_photo LIMIT 1) AS miniature,
        (SELECT array_agg(pz.zone ORDER BY pz.zone) FROM professionnel_zone pz
          WHERE pz.id_pro = profil_publie.id_pro) AS zones
      FROM profil_publie
      WHERE ${conditions.join(' AND ')}
      ORDER BY nom
      LIMIT 20
    `;
    const resultat = await pool.query(requete, valeurs);
    res.json(resultat.rows);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
}

module.exports = { rechercher };
