// Database utility wrapper
// Supports both Trickle DB (cloud) and LocalStorage (local dev)

const DB_TABLES = {
  USERS: 'app_users',
  INVENTORY: 'inventory',
  SALES: 'sales'
};

// Check if we are running in Trickle environment
const IS_TRICKLE_ENV = typeof window.trickleListObjects !== 'undefined';

// --- Local Storage Helpers for Dev ---
const LocalDB = {
  init: () => {
    if (localStorage.getItem('db_initialized')) return;
    
    // Seed data for local dev
    const users = [
      { objectId: 'u1', objectData: { username: 'admin', password: '123', role: 'admin' } },
      { objectId: 'u2', objectData: { username: 'user', password: '123', role: 'customer' } }
    ];
    
    const inventory = [
      { objectId: 'i1', objectData: { branch: 'Kisumu', product: 'Coke', price: 100, stock: 50 } },
      { objectId: 'i2', objectData: { branch: 'Kisumu', product: 'Fanta', price: 100, stock: 30 } },
      { objectId: 'i3', objectData: { branch: 'Mombasa', product: 'Sprite', price: 100, stock: 45 } },
      { objectId: 'i4', objectData: { branch: 'Nairobi', product: 'Coke', price: 120, stock: 100 } }
    ];

    localStorage.setItem(`local_db_${DB_TABLES.USERS}`, JSON.stringify(users));
    localStorage.setItem(`local_db_${DB_TABLES.INVENTORY}`, JSON.stringify(inventory));
    localStorage.setItem(`local_db_${DB_TABLES.SALES}`, JSON.stringify([]));
    localStorage.setItem('db_initialized', 'true');
    console.log('Local DB initialized');
  },
  
  getList: (table) => {
    const data = localStorage.getItem(`local_db_${table}`);
    return data ? JSON.parse(data) : [];
  },
  
  saveList: (table, list) => {
    localStorage.setItem(`local_db_${table}`, JSON.stringify(list));
  },
  
  add: (table, data) => {
    const list = LocalDB.getList(table);
    const newItem = {
      objectId: 'local_' + Date.now(),
      objectData: data,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    LocalDB.saveList(table, list);
    return newItem;
  },
  
  update: (table, id, data) => {
    const list = LocalDB.getList(table);
    const index = list.findIndex(i => i.objectId === id);
    if (index !== -1) {
      list[index].objectData = { ...list[index].objectData, ...data };
      LocalDB.saveList(table, list);
      return true;
    }
    return false;
  }
};

// Initialize if local
if (!IS_TRICKLE_ENV) {
  console.log('Running in Local Mode using LocalStorage');
  LocalDB.init();
}

// --- Unified API ---

async function loginUser(username, password) {
  try {
    let users;
    if (IS_TRICKLE_ENV) {
      const response = await trickleListObjects(DB_TABLES.USERS, 100, true);
      users = response.items.map(item => ({
         ...item.objectData,
         id: item.objectId
      }));
    } else {
      const raw = LocalDB.getList(DB_TABLES.USERS);
      users = raw.map(item => ({ ...item.objectData, id: item.objectId }));
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'System error during login' };
  }
}

async function registerUser(username, password, role = 'customer') {
  try {
    // Check existence
    let users;
    if (IS_TRICKLE_ENV) {
      const response = await trickleListObjects(DB_TABLES.USERS, 100, true);
      users = response.items.map(item => item.objectData);
    } else {
      users = LocalDB.getList(DB_TABLES.USERS).map(i => i.objectData);
    }
    
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    // Create
    if (IS_TRICKLE_ENV) {
      await trickleCreateObject(DB_TABLES.USERS, { username, password, role });
    } else {
      LocalDB.add(DB_TABLES.USERS, { username, password, role });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

async function getInventory(branch = null) {
  try {
    let items;
    if (IS_TRICKLE_ENV) {
      const response = await trickleListObjects(DB_TABLES.INVENTORY, 100, true);
      items = response.items.map(item => ({
        ...item.objectData,
        id: item.objectId
      }));
    } else {
      const raw = LocalDB.getList(DB_TABLES.INVENTORY);
      items = raw.map(item => ({ ...item.objectData, id: item.objectId }));
    }

    if (branch) {
      items = items.filter(item => item.branch === branch);
    }
    return items;
  } catch (error) {
    console.error('Get inventory error:', error);
    return [];
  }
}

async function updateStock(itemId, newStock) {
  try {
    if (IS_TRICKLE_ENV) {
      // Trickle flow
      const item = await trickleGetObject(DB_TABLES.INVENTORY, itemId);
      const updatedData = { ...item.objectData, stock: parseInt(newStock) };
      await trickleUpdateObject(DB_TABLES.INVENTORY, itemId, updatedData);
    } else {
      // Local flow
      LocalDB.update(DB_TABLES.INVENTORY, itemId, { stock: parseInt(newStock) });
    }
    return true;
  } catch (error) {
    console.error('Update stock error:', error);
    return false;
  }
}

async function recordSale(saleData) {
  try {
    if (IS_TRICKLE_ENV) {
      await trickleCreateObject(DB_TABLES.SALES, saleData);
    } else {
      LocalDB.add(DB_TABLES.SALES, saleData);
    }
    return true;
  } catch (error) {
    console.error('Record sale error:', error);
    return false;
  }
}

async function getSalesReport() {
  try {
    if (IS_TRICKLE_ENV) {
      const response = await trickleListObjects(DB_TABLES.SALES, 1000, true);
      return response.items.map(item => item.objectData);
    } else {
      const raw = LocalDB.getList(DB_TABLES.SALES);
      return raw.map(item => item.objectData);
    }
  } catch (error) {
    console.error('Get sales error:', error);
    return [];
  }
}