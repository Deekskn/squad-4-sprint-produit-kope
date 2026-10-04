const pool = require('../config/database');

const idValide = (id) => /^\d+$/.test(id);

async function getProfil(req, res) {
  const { id } = req.params;
  if (!idValide(id)) return res.status(400).json({ message: 'Identifiant invalide' });

  try {
    const profil = await pool.query(
      `SELECT id_pro, nom, prenom, metier, descript, annees_experience
       FROM profil_publie WHERE id_pro = $1`, [id]);
    if (profil.rows.length === 0) {
      return res.status(404).json({ message: 'Profil introuvable' });
    }
    const zones = await pool.query(
      'SELECT zone FROM professionnel_zone WHERE id_pro = $1 ORDER BY zone', [id]);
    const photos = await pool.query(
      `SELECT id_photo, fichier, miniature, legende
       FROM photo WHERE id_pro = $1 ORDER BY id_photo`, [id]);

    res.json({
      ...profil.rows[0],
      zones: zones.rows.map((z) => z.zone),
      photos: photos.rows,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
}

async function getContact(req, res) {
  const { id } = req.params;
  if (!idValide(id)) return res.status(400).json({ message: 'Identifiant invalide' });

  try {
    const visible = await pool.query('SELECT 1 FROM profil_publie WHERE id_pro = $1', [id]);
    if (visible.rows.length === 0) {
      return res.status(404).json({ message: 'Profil introuvable' });
    }
    const contact = await pool.query(
      'SELECT telephone, whatsapp FROM professionnel WHERE id_pro = $1', [id]);
    res.json(contact.rows[0]);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
}

module.exports = { getProfil, getContact };
