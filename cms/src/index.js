'use strict';

/**
 * Au démarrage :
 *  1. ouvre la lecture publique (find/findOne) des contenus éditoriaux ;
 *  2. injecte un jeu de contenus de démo si la base est vide.
 * Les contenus diffèrent volontairement du mock MSW (« contenu Strapi ») pour
 * rendre visible le basculement MOCK_FULL → HYBRID pendant la démo.
 */
const PUBLIC_ACTIONS = [
  'api::home-page.home-page.find',
  'api::banner.banner.find',
  'api::banner.banner.findOne',
  'api::help-article.help-article.find',
  'api::help-article.help-article.findOne',
  'api::faq.faq.find',
  'api::faq.faq.findOne',
];

async function grantPublicRead(strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  for (const action of PUBLIC_ACTIONS) {
    const exists = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });
    if (!exists) {
      await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
    }
  }
}

async function seed(strapi) {
  const home = strapi.documents('api::home-page.home-page');
  if (!(await home.findFirst())) {
    await home.create({
      data: {
        title: 'Votre espace client Nova',
        greeting: 'Bonjour {firstName},',
        marketingText: 'Pilotez votre énergie en toute simplicité. (contenu Strapi)',
        helpTitle: 'Une question ?',
        helpText: 'Nos conseillers vous répondent du lundi au samedi, de 8h à 20h.',
      },
    });
  }

  const seedCollection = async (uid, items) => {
    const svc = strapi.documents(uid);
    if ((await svc.count({})) > 0) return;
    for (const data of items) await svc.create({ data });
  };

  await seedCollection('api::banner.banner', [
    { title: 'Hiver : anticipez vos consommations', message: 'Activez l’alerte consommation pour éviter les surprises.', variant: 'info', ctaLabel: 'Activer', ctaUrl: '/options', priority: 1 },
    { title: 'Passez à la facture électronique', message: 'Simple, rapide et sans papier.', variant: 'promo', ctaLabel: 'Découvrir', ctaUrl: '/options', priority: 2 },
  ]);
  await seedCollection('api::help-article.help-article', [
    { title: 'Comprendre ma facture', slug: 'comprendre-ma-facture', summary: 'Les lignes de votre facture expliquées simplement.' },
    { title: 'Relever mon compteur', slug: 'relever-mon-compteur', summary: 'Où trouver votre index et comment le transmettre.' },
    { title: 'Déménager avec Nova', slug: 'demenager-avec-nova', summary: 'Résiliation, mise en service : la marche à suivre.' },
  ]);
  await seedCollection('api::faq.faq', [
    { question: 'Comment modifier mon RIB ?', answer: 'Rendez-vous dans Mon profil > Paiement.', order: 1 },
    { question: 'Quand suis-je prélevé ?', answer: 'Le 15 de chaque mois, sauf mention contraire sur votre facture.', order: 2 },
    { question: 'Comment résilier une option ?', answer: 'Depuis la page Mes options, en un clic.', order: 3 },
  ]);
}

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    await grantPublicRead(strapi);
    await seed(strapi);
    strapi.log.info('[nova] contenus éditoriaux prêts – lecture publique activée');
  },
};
