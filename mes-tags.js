/* =====================================================================
   MES TAGS — votre fichier pour la partie 3 de l'examen (e-commerce)
   ---------------------------------------------------------------------
   Ce fichier est chargé sur toutes les pages de la boutique.
   Écrivez ici vos crochets shopHooks et vos dataLayer.push.
   La liste des crochets est en annexe du sujet (examen.html).

   Rappels :
   - commencez chaque crochet par un console.log(data) ;
   - une seule erreur dans ce fichier bloque TOUT le fichier :
     ouvrez la console (F12) si plus rien ne remonte.
   ===================================================================== */
window.dataLayer = window.dataLayer || [];
window.shopHooks = window.shopHooks || {};


/* ---------- Écrivez votre code ci-dessous ---------- */

/* Outils communs */
function versItem(l) {
  var item = {
    item_id: l.sku,
    item_name: l.name,
    item_brand: l.brand,
    item_category: l.category,
    price: l.price,
    quantity: l.quantity
  };
  if (l.size) { item.item_variant = l.size; }
  return item;
}

function pousser(nom, ecommerce) {
  dataLayer.push({ ecommerce: null });          // vide l'objet précédent
  dataLayer.push({ event: nom, ecommerce: ecommerce });
}

function pousserCommande(nom, data, extra) {
  var t = data.totals;
  var e = { currency: t.currency, value: t.total, items: data.lines.map(versItem) };
  if (t.coupon) { e.coupon = t.coupon; }
  for (var cle in extra) { e[cle] = extra[cle]; }
  pousser(nom, e);
}

/* 3.2 view_item */
shopHooks.viewItem = function (data) {
  console.log(data);
  var p = data.product;
  pousser("view_item", {
    currency: "EUR",
    value: p.price,
    items: [{
      item_id: p.sku, item_name: p.name, item_brand: p.brand,
      item_category: p.category, price: p.price, quantity: 1
    }]
  });
};

/* 3.3 add_to_cart */
shopHooks.addToCart = function (data) {
  console.log(data);
  var p = data.product;
  pousser("add_to_cart", {
    currency: data.currency,
    value: data.value,
    items: [{
      item_id: p.sku, item_name: p.name, item_brand: p.brand,
      item_category: p.category, item_variant: data.size,
      price: data.unitPrice, quantity: data.quantity
    }]
  });
};

/* Bonus : remove_from_cart */
shopHooks.removeFromCart = function (data) {
  console.log(data);
  var item = versItem(data.line);
  item.quantity = data.quantity;                // quantité réellement retirée
  pousser("remove_from_cart", {
    currency: data.currency,
    value: data.value,
    items: [item]
  });
};

/* 3.4 tunnel de commande */
shopHooks.beginCheckout = function (data) {
  console.log(data);
  pousserCommande("begin_checkout", data, {});
};
shopHooks.addShippingInfo = function (data) {
  console.log(data);
  pousserCommande("add_shipping_info", data, { shipping_tier: data.shippingTier });
};
shopHooks.addPaymentInfo = function (data) {
  console.log(data);
  pousserCommande("add_payment_info", data, { payment_type: data.paymentType });
};

/* 3.5 purchase */
shopHooks.purchase = function (data) {
  console.log(data);
  if (!data.firstView) { return; }              // pas de doublon au rechargement
  var o = data.order;
  var e = {
    transaction_id: o.transaction_id,
    value: o.total,
    tax: o.tax,
    shipping: o.shipping,
    currency: o.currency,
    items: o.lines.map(versItem)
  };
  if (o.coupon) { e.coupon = o.coupon; }
  pousser("purchase", e);
};
