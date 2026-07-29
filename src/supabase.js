const SUPABASE_URL = 'https://mnbmdhkugxifzsaxdslm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Ee1G3j2m8ZveUfTnUNdBCg_GpFDgDJR';
const SESSION_KEY = 'oiwatch-admin-session';

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

function fromDatabase(row) {
  return {
    id: row.id,
    nameZh: row.name_zh || '',
    nameEn: row.name_en || '',
    descriptionZh: row.description_zh || '',
    brandEn: row.brand_en || '',
    brandZh: row.brand_zh || '',
    price: Number(row.price || 0),
    stock: Number(row.stock || 0),
    status: row.status || 'draft',
    translations: row.translations || {},
    media: row.media || [],
    mediaCount: Number(row.media_count ?? (Array.isArray(row.media) ? row.media.length : 0)),
    tags: Array.isArray(row.tags) ? row.tags : [],
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
    tags: Array.isArray(product.tags) ? product.tags : [],
    updated_at: new Date().toISOString(),
  };
}

export async function listPublishedProducts() {
  const page = await listPublishedProductsPage({ pageSize: 24 });
  return page.products;
}

export async function listPublishedProductsPage({ page = 0, pageSize = 24, query = '', brand = '' } = {}) {
  const params = new URLSearchParams({
    select: '*',
    order: 'updated_at.desc,id.asc',
    limit: String(pageSize),
    offset: String(page * pageSize),
  });
  if (query.trim()) params.set('search_text', `ilike.*${query.trim().replaceAll('*', '')}*`);
  if (brand) {
    const brandAliases = {
      Rolex: ['Rolex', 'Daytona', 'DateJust', 'GMT Master II', 'Day-Date', 'Submariner', 'Yacht-Master', 'Oyster Perpetual', 'Explorer', 'Air King', 'Milgauss', 'Sea-Dweller', 'Sky-Dweller', 'Land-Dweller', 'Cellini'],
    };
    const terms = brandAliases[brand] || [brand];
    const conditions = terms.flatMap(term => {
      const safeTerm = String(term).replaceAll('*', '').replaceAll(',', '');
      return [`brand_en.ilike.*${safeTerm}*`, `brand_zh.ilike.*${safeTerm}*`];
    });
    params.set('or', `(${conditions.join(',')})`);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/store_product_catalog?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
    },
  });
  const rows = await response.json().catch(() => null);
  if (!response.ok) throw new Error(rows?.message || 'Unable to load the product catalogue.');
  const range = response.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  return {
    products: (rows || []).map(fromDatabase),
    total: Number.isFinite(total) ? total : (rows || []).length,
  };
}

export async function listPublishedBrands() {
  const rows = await request('/rest/v1/store_product_catalog?select=brand_en,brand_zh&order=brand_en.asc&limit=1000');
  const seen = new Set();
  return (rows || []).filter(row => {
    const key = `${row.brand_en || ''}|${row.brand_zh || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return row.brand_en || row.brand_zh;
  });
}

export async function getPublishedProduct(productId) {
  const rows = await request(`/rest/v1/store_products?select=*&status=eq.published&id=eq.${encodeURIComponent(productId)}&limit=1`);
  return rows?.[0] ? fromDatabase(rows[0]) : null;
}

export async function listAdminProducts(session) {
  const rows = await request('/rest/v1/store_products?select=*&order=updated_at.desc', {
    token: session.access_token,
  });
  return (rows || []).map(fromDatabase);
}

export async function saveAdminProduct(session, product) {
  const rows = await request('/rest/v1/store_products?on_conflict=id', {
    method: 'POST',
    token: session.access_token,
    body: toDatabase(product),
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
  });
  return fromDatabase(rows[0]);
}

export async function deleteAdminProduct(session, productId) {
  await request(`/rest/v1/store_products?id=eq.${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    token: session.access_token,
  });
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
