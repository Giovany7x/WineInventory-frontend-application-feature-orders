const jsonServer = require('json-server');
const path = require('path');

const TAX_RATE = 0.19;
const DEFAULT_DELIVERY_OFFSET_DAYS = 4;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
const routes = require('./routes.json');

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(jsonServer.rewriter(routes));

server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/orders') {
    try {
      const db = router.db;
      const now = new Date();
      const orderId = req.body.id || generateOrderId();
      const items = buildOrderItems(db, req.body.items, orderId);
      const totals = calculateTotals(items);
      const order = buildOrderPayload(db, req.body, {
        id: orderId,
        createdAt: now.toISOString(),
        expectedDelivery: computeExpectedDelivery(now)
      }, items, totals);

      req.body = order;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  return next();
});

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});

function buildOrderPayload(db, payload, defaults, items, totals) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El contenido de la orden no es válido.');
  }

  const customerName = (payload.customerName || '').trim();
  if (!customerName) {
    throw new Error('El nombre del cliente es obligatorio.');
  }

  const orderCode = payload.code || generateOrderCode(db, defaults.createdAt);
  const status = payload.status || 'pending';
  const baseOrder = {
    id: defaults.id,
    code: orderCode,
    customerName,
    status,
    createdAt: defaults.createdAt,
    expectedDelivery: payload.expectedDelivery ? normalizeDate(payload.expectedDelivery) : defaults.expectedDelivery,
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total
  };

  if (payload.customerEmail) {
    baseOrder.customerEmail = payload.customerEmail;
  }

  if (payload.notes) {
    baseOrder.notes = payload.notes;
  }

  return baseOrder;
}

function buildOrderItems(db, rawItems, orderId) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('La orden debe incluir al menos un artículo.');
  }

  return rawItems.map((rawItem, index) => {
    const catalogItemId = rawItem.catalogItemId || (rawItem.catalogItem && rawItem.catalogItem.id);
    if (!catalogItemId) {
      throw new Error(`El artículo en la posición ${index + 1} no tiene un identificador de catálogo válido.`);
    }

    const catalogItem = findCatalogItem(db, catalogItemId);
    if (!catalogItem) {
      throw new Error(`El artículo con id ${catalogItemId} no existe en el catálogo.`);
    }

    const quantity = normalizeQuantity(rawItem.quantity);
    const unitPrice = Number(rawItem.unitPrice || catalogItem.price || 0);
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

    return {
      id: `${orderId}-item-${index + 1}`,
      catalogItem,
      quantity,
      unitPrice,
      lineTotal
    };
  });
}

function findCatalogItem(db, id) {
  return db.get('catalog').find({ id }).value();
}

function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
}

function calculateTotals(items) {
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

function generateOrderId() {
  return `ord-${Math.random().toString(36).slice(2, 8)}`;
}

function generateOrderCode(db, createdAt) {
  const currentYear = new Date(createdAt).getFullYear();
  const orders = db
    .get('orders')
    .filter(order => {
      const orderYear = typeof order.createdAt === 'string' ? new Date(order.createdAt).getFullYear() : null;
      return orderYear === currentYear;
    })
    .value();

  const lastSequential = orders
    .map(order => extractSequential(order.code))
    .filter(value => value !== null)
    .reduce((max, value) => Math.max(max, value), 0);

  const nextSequential = (lastSequential + 1).toString().padStart(3, '0');
  return `WI-${currentYear}-${nextSequential}`;
}

function extractSequential(code) {
  if (typeof code !== 'string') {
    return null;
  }

  const parts = code.split('-');
  const sequential = parts[parts.length - 1];
  const numericValue = Number(sequential);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function computeExpectedDelivery(fromDate) {
  const deliveryDate = new Date(fromDate);
  deliveryDate.setDate(deliveryDate.getDate() + DEFAULT_DELIVERY_OFFSET_DAYS);
  return deliveryDate.toISOString();
}

function normalizeDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error('La fecha proporcionada no es válida.');
  }
  return date.toISOString();
}
