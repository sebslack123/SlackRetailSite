// ============================================================
// NordformSport – Product Catalogue
// ============================================================

const PRODUCTS = [
  // ── RUNNING ──────────────────────────────────────────────
  {
    id: 'r1', category: 'running', featured: true,
    brand: 'ASICS', name: 'Gel-Nimbus 26',
    desc: 'Maximalt dämpat löparskor för långa distanser. FF Blast+-teknik ger enastående stötabsorption.',
    price: 1899, oldPrice: 2299,
    badge: 'Rea',
    rating: 4.8, reviews: 214,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  },
  {
    id: 'r2', category: 'running', featured: true,
    brand: 'Nike', name: 'Pegasus 41',
    desc: 'Mångsidigt träningsskor med ReactX-skum för explosiv återfjädring. Perfekt för vardagsträning.',
    price: 1599, oldPrice: null,
    badge: 'Nyhet',
    rating: 4.7, reviews: 312,
    img: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80'
  },
  {
    id: 'r3', category: 'running',
    brand: 'Craft', name: 'ADV Essence Tee Herr',
    desc: 'Lättviktig och snabbtorkande löpartröja i teknisk mesh-struktur. Perfekt för intensiva pass.',
    price: 449, oldPrice: null,
    badge: null,
    rating: 4.5, reviews: 88,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  },
  {
    id: 'r4', category: 'running',
    brand: 'Craft', name: 'Löpningsshorts 7"',
    desc: 'Lätta shorts med inbyggda trosor och reflekterande detaljer. Ventilerande mesh på sidorna.',
    price: 549, oldPrice: null,
    badge: null,
    rating: 4.4, reviews: 61,
    img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80'
  },
  {
    id: 'r5', category: 'running', featured: true,
    brand: 'Garmin', name: 'Forerunner 265',
    desc: 'GPS-löparklocka med AMOLED-skärm och avancerad träningsanalys. 15 dagars batteritid.',
    price: 4499, oldPrice: 4999,
    badge: 'Rea',
    rating: 4.9, reviews: 175,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
  },
  {
    id: 'r6', category: 'running',
    brand: 'Compressport', name: 'Full Socks Run',
    desc: 'Kompressionsstrumpor för löpning med anatomipassning och anti-blåsor-teknologi.',
    price: 299, oldPrice: null,
    badge: null,
    rating: 4.6, reviews: 99,
    img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80'
  },
  {
    id: 'r7', category: 'running',
    brand: 'Brooks', name: 'Ghost 16',
    desc: 'Neutral löparskor med DNA Loft v3-mellansula. Mjuk landing och responsivt avtryck.',
    price: 1799, oldPrice: null,
    badge: null,
    rating: 4.7, reviews: 142,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  },
  {
    id: 'r8', category: 'running',
    brand: 'Salomon', name: 'Sense Ride 5 Trail',
    desc: 'Terrängskor med Contagrip-sula för utmärkt grepp på alla underlag. Gore-Tex-membran.',
    price: 1999, oldPrice: null,
    badge: 'Nyhet',
    rating: 4.8, reviews: 57,
    img: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600&q=80'
  },

  // ── SQUASH ───────────────────────────────────────────────
  {
    id: 's1', category: 'squash', featured: true,
    brand: 'HEAD', name: 'Graphene 360+ Speed 135',
    desc: 'Proffsracket i 100% grafit. Graphene 360+ teknologi ger överlägsen kraft och kontroll.',
    price: 1699, oldPrice: 1999,
    badge: 'Rea',
    rating: 4.9, reviews: 96,
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80'
  },
  {
    id: 's2', category: 'squash', featured: true,
    brand: 'Dunlop', name: 'Hyperfibre+ Revelation 135',
    desc: 'Elite-racket med Hyperfibre+-teknik. Oslagbar svingvikt och exceptionell touch.',
    price: 1999, oldPrice: null,
    badge: null,
    rating: 4.8, reviews: 53,
    img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80'
  },
  {
    id: 's3', category: 'squash',
    brand: 'Karakal', name: 'PU Super Grip',
    desc: 'Ersättningsgrepp med PU-material. Extremt fuktabsorberande med lång livslängd.',
    price: 89, oldPrice: null,
    badge: null,
    rating: 4.5, reviews: 201,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'
  },
  {
    id: 's4', category: 'squash',
    brand: 'Dunlop', name: 'Pro Squashbollar 3-pack',
    desc: 'Dubbelgula prickar – turneringsbollen för proffs. Perfekt elasticitet och konsistens.',
    price: 149, oldPrice: null,
    badge: null,
    rating: 4.7, reviews: 334,
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'
  },
  {
    id: 's5', category: 'squash',
    brand: 'ASICS', name: 'Gel-Rocket 11 Squashskor',
    desc: 'Stabila innebandyskor med GEL-dämpning i hälen. Non-marking sula godkänd för alla hallar.',
    price: 999, oldPrice: null,
    badge: 'Nyhet',
    rating: 4.6, reviews: 47,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  },
  {
    id: 's6', category: 'squash',
    brand: 'Prince', name: 'Squashväska Tour',
    desc: 'Rymlig racketbag för upp till 3 racketar med separata fack och vadderade axelremmar.',
    price: 799, oldPrice: 999,
    badge: 'Rea',
    rating: 4.4, reviews: 29,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
  },

  // ── GOLF ─────────────────────────────────────────────────
  {
    id: 'g1', category: 'golf', featured: true,
    brand: 'Callaway', name: 'Paradym Ai Smoke Driver',
    desc: 'AI-designad driver med 360° Carbon Chassis. Maximerad bollhastighet och förlåtande träffzon.',
    price: 5999, oldPrice: 6499,
    badge: 'Rea',
    rating: 4.9, reviews: 89,
    img: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80'
  },
  {
    id: 'g2', category: 'golf',
    brand: 'TaylorMade', name: 'Qi35 Irons Set 6–PW',
    desc: '5-delars järnsats i rostfritt stål med tungsten-viktning. Hög MOI och enkel uppstart.',
    price: 8499, oldPrice: null,
    badge: null,
    rating: 4.8, reviews: 44,
    img: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&q=80'
  },
  {
    id: 'g3', category: 'golf', featured: true,
    brand: 'FootJoy', name: 'Fuel Golfskor',
    desc: 'Vattentäta golfskor med BOA Fit System och atletisk passform. 2 års vattentäthetsgaranti.',
    price: 1699, oldPrice: 1999,
    badge: 'Rea',
    rating: 4.7, reviews: 133,
    img: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=80'
  },
  {
    id: 'g4', category: 'golf',
    brand: 'Titleist', name: 'Pro V1 Golfbollar 12-pack',
    desc: 'Turneringsboll med 3-delad konstruktion. Mjuk känsla, låg spin på driver, hög kontroll med shorts.',
    price: 549, oldPrice: null,
    badge: null,
    rating: 4.9, reviews: 512,
    img: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&q=80'
  },
  {
    id: 'g5', category: 'golf',
    brand: 'Oscar Jacobson', name: 'Devon Golfskjorta',
    desc: 'Klassisk piké-skjorta i moisture-wicking polyester. UV-skydd 30+. Finns i 6 färger.',
    price: 699, oldPrice: null,
    badge: 'Nyhet',
    rating: 4.5, reviews: 78,
    img: 'https://images.unsplash.com/photo-1467467573586-46dbd2b0bafd?w=600&q=80'
  },
  {
    id: 'g6', category: 'golf',
    brand: 'Bushnell', name: 'Tour V6 Rangefinder',
    desc: 'Lasermätare med Slope-teknik och PinSeeker-teknologi. Mäter upp till 400 meter med ±0,5m noggrannhet.',
    price: 2499, oldPrice: 2999,
    badge: 'Rea',
    rating: 4.8, reviews: 66,
    img: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=600&q=80'
  },
  {
    id: 'g7', category: 'golf',
    brand: 'Sun Mountain', name: 'C-130 Golfbag',
    desc: 'Lättviktig ståndsväska (2,4 kg) med 14-delad putterskydd och organiserande ficksystem.',
    price: 2199, oldPrice: null,
    badge: null,
    rating: 4.6, reviews: 38,
    img: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80'
  },
  {
    id: 'g8', category: 'golf',
    brand: 'Ping', name: 'G430 Max Fairwaywood',
    desc: 'Fairwaywood med Spinsistency-teknik och låg tyngdpunkt för hög start. Stör sig inte på dåliga kontakter.',
    price: 3299, oldPrice: null,
    badge: 'Nyhet',
    rating: 4.7, reviews: 31,
    img: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=80'
  }
];

function getAllProducts() { return PRODUCTS; }
function getProductsByCategory(cat) { return PRODUCTS.filter(p => p.category === cat); }
function getFeaturedProducts() { return PRODUCTS.filter(p => p.featured); }
function getProductById(id) { return PRODUCTS.find(p => p.id === id); }

function formatPrice(n) { return n.toLocaleString('sv-SE') + ' kr'; }

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '<div class="product-stars">';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<span class="star">★</span>';
    else if (i === full && half) html += '<span class="star" style="opacity:.5">★</span>';
    else html += '<span class="star" style="opacity:.2">★</span>';
  }
  html += `<span class="star-count">(${rating})</span></div>`;
  return html;
}

function renderProductGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products.length) { el.innerHTML = '<p style="color:var(--gray-500)">Inga produkter hittades.</p>'; return; }
  el.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="product-badge ${p.badge === 'Nyhet' ? 'badge-new' : ''}">${p.badge}</span>` : ''}
      </div>
      <div class="product-card-body">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        ${renderStars(p.rating)}
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}
            ${formatPrice(p.price)}
          </div>
          <button class="add-to-cart-btn" onclick="addToCartById('${p.id}', this)">
            Lägg i korg
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
