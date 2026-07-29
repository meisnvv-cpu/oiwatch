const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Ee1G3j2m8ZveUfTnUNdBCg_GpFDgDJR';
const SESSION_KEY = 'oiwatch-admin-session';
const CATALOG_PAGE_SIZE = 1000;
const CATALOG_CACHE_TTL_MS = 60_000;
const LEGACY_UNVERIFIED_PATTERN = /(?:replica|super\s*clone|clone|aaa|vsf|apsf?|ppf|clean|zf|qf|twf|factory|复刻|仿表|克隆|工厂|厂新品)/i;

// These aliases cover both source-site taxonomy (for example, "Daytona") and
// the canonical brand names used by the storefront filters.
const BRAND_RULES = [
  ['Rolex', '劳力士', ['Rolex', '劳力士', '勞力士', 'Daytona', 'Cosmograph', 'Datejust', 'Date Just', 'GMT-Master', 'GMT Master', 'Day-Date', 'Day Date', 'Submariner', 'Yacht-Master', 'Yacht Master', 'Oyster Perpetual', 'Explorer', 'Air-King', 'Air King', 'Milgauss', 'Sea-Dweller', 'Sea Dweller', 'Sky-Dweller', 'Sky Dweller', 'Land-Dweller', 'Land Dweller', 'Cellini', '迪通拿', '日志', '日誌', '格林尼治', '潜航者', '潛航者', '游艇', '遊艇', '星期日历', '星期日曆']],
  ['Patek Philippe', '百达翡丽', ['Patek Philippe', 'Patek', '百达翡丽', '百達翡麗', 'Nautilus', 'Aquanaut', 'Calatrava', 'Cubitus', 'Grand Complications', '鹦鹉螺', '鸚鵡螺']],
  ['Audemars Piguet', '爱彼', ['Audemars Piguet', 'Audemars', 'AP', '爱彼', '愛彼', 'Royal Oak', 'Royal Oak Offshore', 'Code 11.59', 'Concept', '皇家橡树', '皇家橡樹']],
  ['Vacheron Constantin', '江诗丹顿', ['Vacheron Constantin', 'Vacheron', '江诗丹顿', '江詩丹頓', 'Overseas', 'Patrimony', 'Traditionnelle', 'Historiques', '纵横四海', '縱橫四海']],
  ['Richard Mille', '理查德米勒', ['Richard Mille', '理查德米勒', '理查米尔', '理查米爾', 'RM 0', 'RM0', 'RM 1', 'RM1', 'RM 2', 'RM2', 'RM 3', 'RM3']],
  ['Cartier', '卡地亚', ['Cartier', '卡地亚', '卡地亞', 'Santos', 'Tank', 'Ballon Bleu', 'Panthère', 'Panthere', '蓝气球', '藍氣球']],
  ['Omega', '欧米茄', ['Omega', '欧米茄', '歐米茄', 'Speedmaster', 'Seamaster', 'Constellation', 'De Ville', 'Planet Ocean', 'Aqua Terra', '超霸', '海马', '海馬', '星座', '碟飞', '碟飛']],
  ['IWC Schaffhausen', '万国表', ['IWC', 'IWC Schaffhausen', '万国', '萬國', 'Portugieser', 'Portuguese', 'Ingenieur', 'Portofino', 'Pilot', 'Big Pilot', '飞行员', '飛行員', '葡萄牙']],
  ['A. Lange & Söhne', '朗格', ['A. Lange', 'A Lange', 'Lange & Sohne', 'Lange & Söhne', '朗格', 'Lange 1', 'Saxonia', 'Odysseus', 'Zeitwerk']],
  ['Jaeger-LeCoultre', '积家', ['Jaeger-LeCoultre', 'Jaeger LeCoultre', 'JLC', '积家', '積家', 'Reverso', 'Master Ultra Thin', 'Master Control', 'Polaris', 'Rendez-Vous']],
  ['Breguet', '宝玑', ['Breguet', '宝玑', '寶璣', 'Classique', 'Tradition', 'Type XX']],
  ['Blancpain', '宝珀', ['Blancpain', '宝珀', '寶珀', 'Fifty Fathoms', 'Villeret', 'Air Command']],
  ['Hublot', '宇舶', ['Hublot', '宇舶', 'Big Bang', 'Classic Fusion', 'Spirit of Big Bang', 'Square Bang']],
  ['Panerai', '沛纳海', ['Panerai', '沛纳海', '沛納海', 'Luminor', 'Submersible', 'Radiomir', 'Luminor Due', 'PAM']],
  ['Piaget', '伯爵', ['Piaget', '伯爵', 'Altiplano', 'Limelight Gala', 'Possession']],
  ['Chopard', '萧邦', ['Chopard', '萧邦', '蕭邦', 'Alpine Eagle', 'Mille Miglia', 'Happy Sport']],
  ['Girard-Perregaux', '芝柏', ['Girard-Perregaux', 'Girard Perregaux', '芝柏', 'Laureato', 'Cat’s Eye', "Cat's Eye"]],
  ['Ulysse Nardin', '雅典表', ['Ulysse Nardin', '雅典', 'Diver', 'Freak', 'Blast']],
  ['Zenith', '真力时', ['Zenith', '真力时', '真力時', 'Chronomaster', 'Defy', 'El Primero']],
  ['Breitling', '百年灵', ['Breitling', '百年灵', '百年靈', 'Navitimer', 'Superocean', 'Chronomat', 'Premier']],
  ['Tudor', '帝舵', ['Tudor', '帝舵', 'Black Bay', 'Pelagos', 'Ranger']],
  ['TAG Heuer', '泰格豪雅', ['TAG Heuer', 'Tag Heuer', '泰格豪雅', '豪雅', 'Carrera', 'Monaco', 'Aquaracer', 'Formula 1']],
  ['Grand Seiko', '冠蓝狮', ['Grand Seiko', '冠蓝狮', '冠藍獅', 'GS', 'Evolution 9']],
  ['Glashütte Original', '格拉苏蒂原创', ['Glashütte Original', 'Glashutte Original', '格拉苏蒂', '格拉蘇蒂', 'Pano', 'Senator', 'SeaQ']],
  ['Parmigiani Fleurier', '帕玛强尼', ['Parmigiani', '帕玛强尼', '帕瑪強尼', 'Tonda PF', 'Toric']],
  ['H. Moser & Cie.', '亨利慕时', ['H. Moser', 'H Moser', '亨利慕时', '亨利慕時', 'Streamliner', 'Endeavour']],
  ['F.P. Journe', 'FP儒纳', ['F.P. Journe', 'FP Journe', '儒纳', '儒納', 'Chronomètre Souverain', 'Octa']],
  ['Roger Dubuis', '罗杰杜彼', ['Roger Dubuis', '罗杰杜彼', '羅傑杜彼', 'Excalibur', 'Velvet']],
  ['Jacob & Co.', '杰克宝', ['Jacob & Co', 'Jacob and Co', '杰克宝', '捷克豹', 'Astronomia', 'Epic X', 'Bugatti']],
  ['Bovet', '播威', ['Bovet', '播威', 'Récital', 'Recital', 'Virtuoso']],
  ['Bell & Ross', '柏莱士', ['Bell & Ross', 'Bell Ross', 'BELL & ROSS', '柏莱士', '柏萊士', 'BR 01', 'BR 03', 'BR 05', 'BR-X5']],
  ['Hermès', '爱马仕', ['Hermès', 'Hermes', '爱马仕', '愛馬仕', 'Arceau', 'Cape Cod']],
  ['Bulgari', '宝格丽', ['Bulgari', 'Bvlgari', '宝格丽', '寶格麗', 'Octo', 'Serpenti']],
  ['Montblanc', '万宝龙', ['Montblanc', '万宝龙', '萬寶龍', 'Star Legacy', 'Bohème', 'Boheme']],
  ['Baume & Mercier', '名士表', ['Baume & Mercier', 'Baume Mercier', '名士', 'Riviera', 'Clifton', 'Hampton']],
  ['Longines', '浪琴', ['Longines', '浪琴', 'Spirit', 'Conquest', 'DolceVita']],
  ['Oris', '豪利时', ['Oris', '豪利时', '豪利時', 'Aquis', 'Big Crown', 'ProPilot']],
  ['NOMOS Glashütte', '诺莫斯', ['NOMOS', 'Nomos', '诺莫斯', '諾莫斯', 'Tangente', 'Ludwig']],
  ['Frederique Constant', '康斯登', ['Frederique Constant', '康斯登', 'Highlife', 'Slimline']],
  ['Carl F. Bucherer', '宝齐莱', ['Carl F. Bucherer', 'Carl Bucherer', '宝齐莱', '寶齊萊', 'Manero', 'Patravi']],
  ['Franck Muller', '法穆兰', ['Franck Muller', '法穆兰', '法穆蘭', '法兰克穆勒', '法蘭克穆勒', 'Vanguard', 'Crazy Hours']],
];

let catalogCache = null;
let catalogCacheAt = 0;
let catalogCachePromise = null;

async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error_description || 'Unable to connect to the login service.');
  }
  return data;
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenText(value, result = []) {
  if (value === null || value === undefined) return result;
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim();
    if (text) result.push(text);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach(item => flattenText(item, result));
    return result;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach(item => flattenText(item, result));
  }
  return result;
}

function uniqueText(values) {
  const seen = new Set();
  return values.flatMap(value => flattenText(value)).filter(value => {
    const key = normalizeText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function productTextValues(product) {
  return uniqueText([
    product.id,
    product.nameZh,
    product.nameEn,
    product.descriptionZh,
    product.descriptionEn,
    product.brandEn,
    product.brandZh,
    product.tags,
    product.translations,
  ]);
}

function isPubliclyEligible(product) {
  if (product.sourceVerified === true) return true;
  if (product.sourceVerified === false) return false;
  return !String(product.id || '').startsWith('watclub-')
    && !LEGACY_UNVERIFIED_PATTERN.test(productTextValues(product).join(' '));
}

function productIdentityValues(product) {
  const translationNames = Object.values(product.translations || {}).map(translation => translation?.name);
  return uniqueText([
    product.id,
    product.nameZh,
    product.nameEn,
    product.brandEn,
    product.brandZh,
    product.tags,
    translationNames,
  ]);
}

function aliasMatches(value, alias) {
  const haystack = normalizeText(value);
  const needle = normalizeText(alias);
  if (!haystack || !needle) return false;
  if (/[^a-z0-9 ]/i.test(needle)) return haystack.includes(needle);
  if (needle.length <= 2) return ` ${haystack} `.includes(` ${needle} `);
  return haystack.includes(needle);
}

function brandRuleFor(value) {
  const input = String(value || '');
  return BRAND_RULES.find(([brandEn, brandZh, aliases]) =>
    [brandEn, brandZh, ...aliases].some(alias => aliasMatches(input, alias)),
  ) || null;
}

function brandForProduct(product) {
  const values = productIdentityValues(product);
  return BRAND_RULES.find(([, , aliases]) =>
    aliases.some(alias => values.some(value => aliasMatches(value, alias))),
  ) || null;
}

function withCatalogMetadata(product) {
  const matchedBrand = brandForProduct(product);
  const tags = uniqueText([
    product.tags,
    ...(matchedBrand ? [matchedBrand[0], matchedBrand[1]] : []),
  ]);
  return {
    ...product,
    brandEn: matchedBrand?.[0] || product.brandEn,
    brandZh: matchedBrand?.[1] || product.brandZh,
    tags,
  };
}

function matchesSearch(product, query) {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeText(productTextValues(product).join(' '));
  return terms.every(term => haystack.includes(term));
}

function matchesBrand(product, brand) {
  if (!brand) return true;
  const requested = brandRuleFor(brand);
  const actual = brandForProduct(product);
  if (requested && actual) return requested[0] === actual[0];
  const term = normalizeText(brand);
  return term && normalizeText(productTextValues(product).join(' ')).includes(term);
}

function catalogUrl(source, { page = 0, pageSize = 24 } = {}) {
  const params = new URLSearchParams({
    select: '*',
    status: 'eq.published',
    order: 'updated_at.desc,id.asc',
    limit: String(pageSize),
    offset: String(page * pageSize),
  });
  return `${SUPABASE_URL}/rest/v1/${source}?${params}`;
}

async function fetchCatalogPage(source, options) {
  const response = await fetch(catalogUrl(source, options), {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
    },
  });
  const rows = await response.json().catch(() => null);
  if (!response.ok) throw new Error(rows?.message || `Unable to load products from ${source}.`);
  const range = response.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  const products = (rows || [])
    .map(row => withCatalogMetadata(fromDatabase(row)))
    .filter(isPubliclyEligible);
  return { products, total: Number.isFinite(total) ? total : products.length };
}

async function fetchPublishedCatalogRows() {
  if (catalogCache && Date.now() - catalogCacheAt < CATALOG_CACHE_TTL_MS) return catalogCache;
  if (catalogCachePromise) return catalogCachePromise;

  catalogCachePromise = (async () => {
    let lastError;
    for (const source of ['store_product_search_catalog', 'store_product_catalog', 'store_products']) {
      try {
        const products = [];
        for (let page = 0; ; page += 1) {
          const result = await fetchCatalogPage(source, { page, pageSize: CATALOG_PAGE_SIZE });
          products.push(...result.products);
          if (result.products.length < CATALOG_PAGE_SIZE) break;
        }
        catalogCache = products;
        catalogCacheAt = Date.now();
        return products;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Unable to load the product catalogue.');
  })();

  try {
    return await catalogCachePromise;
  } finally {
    catalogCachePromise = null;
  }
}

function clearCatalogCache() {
  catalogCache = null;
  catalogCacheAt = 0;
}

function fromDatabase(row) {
  return {
    id: row.id,
    nameZh: row.name_zh || '',
    nameEn: row.name_en || '',
    descriptionZh: row.description_zh || '',
    descriptionEn: row.description_en || row.translations?.en?.description || '',
    brandEn: row.brand_en || '',
    brandZh: row.brand_zh || '',
    price: Number(row.price || 0),
    stock: Number(row.stock || 0),
    status: row.status || 'draft',
    translations: row.translations || {},
    media: row.media || [],
    mediaCount: Number(row.media_count ?? (Array.isArray(row.media) ? row.media.length : 0)),
    tags: uniqueText(row.tags || []),
    sourceVerified: row.source_verified,
    sourceEvidenceNote: row.source_evidence_note || '',
    updatedAt: row.updated_at,
  };
}

function toDatabase(product) {
  return {
    id: product.id,
    name_zh: product.nameZh,
    name_en: product.nameEn || '',
    description_zh: product.descriptionZh,
    brand_en: product.brandEn,
    brand_zh: product.brandZh,
    price: Number(product.price),
    stock: Number(product.stock),
    status: product.status,
    translations: product.translations || {},
    media: product.media || [],
    tags: uniqueText(product.tags || []),
    source_verified: Boolean(product.sourceVerified),
    source_evidence_note: product.sourceEvidenceNote || '',
    updated_at: new Date().toISOString(),
  };
}

export async function listPublishedProducts() {
  return fetchPublishedCatalogRows();
}

export async function listPublishedProductsPage({ page = 0, pageSize = 24, query = '', brand = '' } = {}) {
  if (!query.trim() && !brand) {
    try {
      return await fetchCatalogPage('store_product_search_catalog', { page, pageSize });
    } catch {
      try {
        return await fetchCatalogPage('store_product_catalog', { page, pageSize });
      } catch {
        return fetchCatalogPage('store_products', { page, pageSize });
      }
    }
  }

  // Some older deployments do not expose tags/search_text through the view.
  // Filter a bounded public catalogue in the browser instead of treating that
  // schema difference as an empty brand or model search result.
  const matches = (await fetchPublishedCatalogRows())
    .filter(isPubliclyEligible)
    .filter(product => matchesBrand(product, brand) && matchesSearch(product, query));
  const start = page * pageSize;
  return { products: matches.slice(start, start + pageSize), total: matches.length };
}

export async function listPublishedBrands() {
  const seen = new Set();
  return (await fetchPublishedCatalogRows())
    .map(withCatalogMetadata)
    .filter(isPubliclyEligible)
    .map(product => ({ brand_en: product.brandEn, brand_zh: product.brandZh }))
    .filter(row => {
    const key = `${row.brand_en || ''}|${row.brand_zh || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return row.brand_en || row.brand_zh;
    })
    .sort((a, b) => String(a.brand_en || a.brand_zh).localeCompare(String(b.brand_en || b.brand_zh), 'en'));
}

export async function getPublishedProduct(productId) {
  const rows = await request(`/rest/v1/store_products?select=*&status=eq.published&id=eq.${encodeURIComponent(productId)}&limit=1`);
  return rows?.[0] ? withCatalogMetadata(fromDatabase(rows[0])) : null;
}

export async function listAdminProducts(session) {
  const rows = await request('/rest/v1/store_products?select=*&order=updated_at.desc', {
    token: session.access_token,
  });
  return (rows || []).map(fromDatabase);
}

export async function saveAdminProduct(session, product) {
  if (product.status === 'published' && (!product.sourceVerified || !String(product.sourceEvidenceNote || '').trim())) {
    throw new Error('Published products require verified source evidence.');
  }
  const rows = await request('/rest/v1/store_products?on_conflict=id', {
    method: 'POST',
    token: session.access_token,
    body: toDatabase(product),
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
  });
  clearCatalogCache();
  return fromDatabase(rows[0]);
}

export async function deleteAdminProduct(session, productId) {
  await request(`/rest/v1/store_products?id=eq.${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    token: session.access_token,
  });
  clearCatalogCache();
}

export async function listAdminOrders(session) {
  const rows = await request('/rest/v1/orders?select=*&order=created_at.desc', {
    token: session.access_token,
  }) || [];
  return rows.map(row => ({
    ...row,
    id: row.order_number,
    name: row.customer_name,
  }));
}

export async function listAdminCustomers(session) {
  const rows = await request('/rest/v1/customers?select=*&order=last_order_at.desc.nullslast', {
    token: session.access_token,
  }) || [];
  return rows.map(row => ({ ...row, orders:row.order_count }));
}

export async function getSiteSettings() {
  const rows = await request('/rest/v1/site_settings?id=eq.main&select=*');
  const row = rows?.[0];
  return row ? {
    storeName: row.store_name,
    whatsapp: row.whatsapp,
    defaultCurrency: 'USD',
  } : { storeName:'OiWatch', whatsapp:'+852 6651 0124', defaultCurrency:'USD' };
}

export async function saveSiteSettings(session, settings) {
  const rows = await request('/rest/v1/site_settings?on_conflict=id', {
    method: 'POST',
    token: session.access_token,
    body: {
      id: 'main',
      store_name: settings.storeName,
      whatsapp: settings.whatsapp,
      default_currency: 'USD',
      updated_at: new Date().toISOString(),
    },
    headers: { Prefer:'resolution=merge-duplicates,return=representation' },
  });
  return {
    storeName: rows[0].store_name,
    whatsapp: rows[0].whatsapp,
    defaultCurrency: 'USD',
  };
}

export async function createOrder(order) {
  const rows = await request('/rest/v1/orders', {
    method: 'POST',
    body: order,
    headers: { Prefer:'return=representation' },
  });
  return rows[0];
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: session.user,
  }));
  return session;
}

async function isAdmin(session) {
  const rows = await request(
    `/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { token: session.access_token },
  );
  return Array.isArray(rows) && rows.length === 1;
}

export async function signInAdmin(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  });
  saveSession(session);
  if (!(await isAdmin(session))) {
    localStorage.removeItem(SESSION_KEY);
    throw new Error('This account does not have administrator permission.');
  }
  return session;
}

export async function getAdminSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    let session = JSON.parse(raw);
    if (!session.access_token || !session.refresh_token) return null;
    if (!session.expires_at || session.expires_at * 1000 < Date.now() + 60000) {
      session = await request('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: { refresh_token: session.refresh_token },
      });
      saveSession(session);
    }
    if (!(await isAdmin(session))) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function signOutAdmin(session) {
  try {
    if (session?.access_token) {
      await request('/auth/v1/logout', { method: 'POST', token: session.access_token });
    }
  } finally {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function uploadAdminMedia(session, file, productId) {
  if (!session?.access_token) throw new Error('Administrator login required.');
  const signedResponse = await fetch('/.netlify/functions/r2-upload-url', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      productId,
    }),
  });
  const signed = await signedResponse.json().catch(() => null);
  if (!signedResponse.ok) {
    throw new Error(signed?.error || 'Unable to prepare the cloud upload.');
  }

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error('Unable to upload the file to cloud storage.');
  }
  return {
    id: signed.objectKey,
    objectKey: signed.objectKey,
    type: file.type,
    url: signed.publicUrl,
    name: file.name,
    storage: 'r2',
  };
}
