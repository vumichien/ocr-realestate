// IndexedDB wrapper for storing extraction history
const DB_NAME = 'detomo_ocr_db';
const DB_VERSION = 1;
const STORE_NAME = 'extraction_history';

// Database connection
let db;

// Initialize the database
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('state', 'state', { unique: false });
        store.createIndex('upload_date', 'upload_date', { unique: false });
      }
    };
  });
};

// Save extraction to history
const saveToHistory = async (data) => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Add timestamp if not provided and ensure consistent field names
    const recordToSave = {
      ...data,
      upload_date: data.upload_date || new Date().toISOString(),
      // Standardize field names
      pdf_data: data.pdfData || data.pdf_data,
      // Convert fieldsData to string if it's an object
      fieldsData: typeof data.fieldsData === 'object' ? JSON.stringify(data.fieldsData) : data.fieldsData
    };
    
    // Remove duplicate fields
    if (recordToSave.pdfData && recordToSave.pdfData !== recordToSave.pdf_data) {
      delete recordToSave.pdfData;
    }
    
    const request = store.add(recordToSave);
    
    request.onsuccess = (event) => {
      resolve(request.result); // This is the generated ID
    };
    
    request.onerror = (event) => {
      console.error('Error saving to history:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Update extraction state
const updateExtractionState = async (id, state) => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the record
    const getRequest = store.get(id);
    
    getRequest.onsuccess = (event) => {
      const record = event.target.result;
      if (record) {
        record.state = state;
        
        // Put the updated record back
        const updateRequest = store.put(record);
        
        updateRequest.onsuccess = () => {
          resolve();
        };
        
        updateRequest.onerror = (event) => {
          console.error('Error updating state:', event.target.error);
          reject(event.target.error);
        };
      } else {
        reject(new Error(`Record with ID ${id} not found`));
      }
    };
    
    getRequest.onerror = (event) => {
      console.error('Error retrieving record:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Update extraction data (including fields)
const updateExtractionData = async (id, updateData) => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the existing record
    const getRequest = store.get(Number(id));
    
    getRequest.onsuccess = (event) => {
      const record = event.target.result;
      if (record) {
        // Standardize field names
        if (updateData.pdfData && !updateData.pdf_data) {
          updateData.pdf_data = updateData.pdfData;
          delete updateData.pdfData;
        }
        
        // Update the record with new data
        const updatedRecord = {
          ...record,
          ...updateData,
          // If fieldsData is an object, convert to string
          fieldsData: typeof updateData.fieldsData === 'object' 
            ? JSON.stringify(updateData.fieldsData) 
            : (updateData.fieldsData || record.fieldsData)
        };
        
        // Put the updated record back
        const updateRequest = store.put(updatedRecord);
        
        updateRequest.onsuccess = () => {
          resolve(id);
        };
        
        updateRequest.onerror = (event) => {
          console.error('Error updating record:', event.target.error);
          reject(event.target.error);
        };
      } else {
        reject(new Error(`Record with ID ${id} not found`));
      }
    };
    
    getRequest.onerror = (event) => {
      console.error('Error retrieving record:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Get all history entries
const getHistoryEntries = async () => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('upload_date');
    
    // Get all records sorted by upload_date in descending order
    const request = index.openCursor(null, 'prev');
    const entries = [];
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // Parse fieldsData if it's a string
        const entry = cursor.value;
        if (typeof entry.fieldsData === 'string') {
          entry.fieldsData = JSON.parse(entry.fieldsData);
        }
        entries.push(entry);
        cursor.continue();
      } else {
        resolve(entries);
      }
    };
    
    request.onerror = (event) => {
      console.error('Error getting history entries:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Get history entry by ID
const getHistoryEntry = async (id) => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(Number(id)); // Ensure ID is a number
    
    request.onsuccess = (event) => {
      const entry = event.target.result;
      if (entry) {
        // Parse fieldsData if it's a string
        if (typeof entry.fieldsData === 'string') {
          entry.fieldsData = JSON.parse(entry.fieldsData);
        }
        console.log("Retrieved entry with PDF data:", !!entry.pdf_data);
        resolve(entry);
      } else {
        console.log("Entry not found for ID:", id);
        resolve(null);
      }
    };
    
    request.onerror = (event) => {
      console.error('Error getting history entry:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Delete history entry
const deleteHistoryEntry = async (id) => {
  const dbInstance = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      console.error('Error deleting history entry:', event.target.error);
      reject(event.target.error);
    };
  });
};

export {
  initDatabase,
  saveToHistory,
  updateExtractionState,
  updateExtractionData,
  getHistoryEntries,
  getHistoryEntry,
  deleteHistoryEntry
}; 