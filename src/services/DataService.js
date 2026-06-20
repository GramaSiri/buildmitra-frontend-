// Central Data Service - Works with Next.js (client-side only)
class DataService {
  constructor() {
    this.storageKey = "buildtrack_data";
    this.isClient = typeof window !== "undefined";
    if (this.isClient) {
      this.initializeData();
    }
  }

  initializeData() {
    if (!this.isClient) return;
    
    if (!localStorage.getItem(this.storageKey)) {
      // Demo products to show in marketplace
      const demoProducts = [
        {
          id: 1001,
          businessName: "UltraTech Premium Cement",
          ownerName: "Rajesh Sharma",
          phone: "+919876543210",
          email: "cement@ultratech.com",
          location: "Mumbai",
          city: "Mumbai",
          pincode: "400001",
          price: 380,
          unit: "bag",
          priceRange: "₹380 - ₹450 per bag",
          products: ["UltraTech Cement", "53 Grade Cement"],
          description: "Best quality OPC 53 Grade Cement for construction",
          rating: 4.8,
          totalReviews: 245,
          isVerified: true,
          availablePincodes: ["400001", "400002", "400003", "560062", "560108", "600001", "500001", "682001"],
          offer: "10% off on bulk orders",
          createdAt: new Date().toISOString(),
          status: "Active"
        },
        {
          id: 1002,
          businessName: "Tata TMT Steel",
          ownerName: "Amit Patel",
          phone: "+919876543211",
          email: "steel@tatasteel.com",
          location: "Mumbai",
          city: "Mumbai",
          pincode: "400001",
          price: 62,
          unit: "kg",
          priceRange: "₹58 - ₹65 per kg",
          products: ["TMT Steel Fe500", "Fe550"],
          description: "Earthquake resistant TMT steel bars",
          rating: 4.9,
          totalReviews: 189,
          isVerified: true,
          availablePincodes: ["400001", "400002", "400003", "560062", "560108", "600001", "500001", "682001"],
          offer: "Free delivery on 5000kg+",
          createdAt: new Date().toISOString(),
          status: "Active"
        },
        {
          id: 1003,
          businessName: "Bangalore Cement Supply",
          ownerName: "Suresh Mehta",
          phone: "+919876543212",
          email: "sales@bangalorecement.com",
          location: "Bengaluru",
          city: "Bengaluru",
          pincode: "560062",
          price: 360,
          unit: "bag",
          priceRange: "₹360 - ₹420 per bag",
          products: ["ACC Cement", "Ramco Cement", "UltraTech"],
          description: "Authorized dealer of all major cement brands",
          rating: 4.7,
          totalReviews: 156,
          isVerified: true,
          availablePincodes: ["560062", "560108", "560001", "560002", "560003"],
          offer: "5% off on first order",
          createdAt: new Date().toISOString(),
          status: "Active"
        },
        {
          id: 1004,
          businessName: "Konark Red Bricks",
          ownerName: "Mahesh Kumar",
          phone: "+919876543213",
          email: "bricks@konark.com",
          location: "Bengaluru",
          city: "Bengaluru",
          pincode: "560062",
          price: 9,
          unit: "piece",
          priceRange: "₹8 - ₹12 per piece",
          products: ["Red Bricks", "Fly Ash Bricks"],
          description: "High quality clay bricks for construction",
          rating: 4.5,
          totalReviews: 112,
          isVerified: true,
          availablePincodes: ["560062", "560108", "560001", "560002"],
          offer: "Buy 10000+ get 5% extra",
          createdAt: new Date().toISOString(),
          status: "Active"
        },
        {
          id: 1005,
          businessName: "Chennai Steel Distributors",
          ownerName: "Kumaraswamy",
          phone: "+919876543214",
          email: "steel@chennaisteel.com",
          location: "Chennai",
          city: "Chennai",
          pincode: "600001",
          price: 60,
          unit: "kg",
          priceRange: "₹58 - ₹63 per kg",
          products: ["TMT Steel", "Structural Steel"],
          description: "Premium quality steel for construction",
          rating: 4.6,
          totalReviews: 98,
          isVerified: true,
          availablePincodes: ["600001", "600002", "600003", "600004"],
          offer: "Bulk orders discount",
          createdAt: new Date().toISOString(),
          status: "Active"
        }
      ];
      
      const initialData = {
        products: demoProducts,
        suppliers: [],
        contractors: [],
        machinery: [],
        labours: [],
        enquiries: [],
        quotes: [],
        orders: [],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
      console.log("DataService initialized with demo products:", demoProducts.length);
    }
  }

  getAllData() {
    if (!this.isClient) return { products: [], suppliers: [], contractors: [], machinery: [], labours: [] };
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : { products: [], suppliers: [], contractors: [], machinery: [], labours: [] };
  }

  saveAllData(data) {
    if (!this.isClient) return;
    
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("buildtrackDataUpdate"));
    }
  }

  getProducts() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return data.products || [];
  }

  addProduct(product) {
    if (!this.isClient) return null;
    
    const data = this.getAllData();
    const newProduct = {
      id: Date.now(),
      ...product,
      createdAt: new Date().toISOString(),
      status: "Active"
    };
    data.products.push(newProduct);
    this.saveAllData(data);
    console.log("Product added:", newProduct.businessName);
    return newProduct;
  }

  updateProduct(productId, updates) {
    if (!this.isClient) return null;
    
    const data = this.getAllData();
    const index = data.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...updates };
      this.saveAllData(data);
      return data.products[index];
    }
    return null;
  }

  deleteProduct(productId) {
    if (!this.isClient) return;
    
    const data = this.getAllData();
    data.products = data.products.filter(p => p.id !== productId);
    this.saveAllData(data);
  }

  getSuppliers() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return data.suppliers || [];
  }

  getContractors() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return data.contractors || [];
  }

  getMachinery() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return data.machinery || [];
  }

  getLabours() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return data.labours || [];
  }

  getAllMarketplaceListings() {
    if (!this.isClient) return [];
    const data = this.getAllData();
    return [
      ...(data.products || []).map(p => ({ ...p, type: "product", category: "supplier" })),
      ...(data.suppliers || []).map(s => ({ ...s, type: "supplier", category: "supplier" })),
      ...(data.contractors || []).map(c => ({ ...c, type: "contractor", category: "contractor" })),
      ...(data.machinery || []).map(m => ({ ...m, type: "machinery", category: "machinery" })),
      ...(data.labours || []).map(l => ({ ...l, type: "labour", category: "labour" }))
    ];
  }

  subscribe(callback) {
    if (!this.isClient) return () => {};
    
    window.addEventListener("buildtrackDataUpdate", callback);
    return () => window.removeEventListener("buildtrackDataUpdate", callback);
  }
}

const dataService = new DataService();
export default dataService;
