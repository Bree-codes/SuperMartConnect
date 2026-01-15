import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, salesAPI, mpesaAPI } from '../api';
import socketService from '../socket';

// Product image mapping
const productImages = {
  'Coke': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  'Fanta': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=600&auto=format&fit=crop',
  'Sprite': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=600&auto=format&fit=crop'
};

// 5 available locations
const AVAILABLE_LOCATIONS = ['Nairobi', 'Kisumu', 'Mombasa', 'Nakuru', 'Eldoret'];

export default function CustomerView({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Nairobi');
  const [notifications, setNotifications] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll(selectedBranch);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  // Auto-dismiss notifications after 2 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      // Set timeout to remove the oldest notification after 2 seconds
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(0, -1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    socketService.connect();
    socketService.joinCustomer();

    // Listen for inventory updates (only for other customers' purchases, not our own)
    const handleInventoryUpdate = (data) => {
      // Only show notification if it's NOT a purchase we just made
      // We use a flag to track if we're in the middle of a purchase
      if (!window.__PURCHASE_IN_PROGRESS__) {
        const notification = {
          id: Date.now(),
          message: `Stock updated: ${data.product} in ${data.branch} - ${data.newStock} remaining`,
          type: 'info'
        };
        setNotifications(prev => [notification, ...prev].slice(0, 3));
      }

      // Refresh products
      fetchProducts();
    };

    socketService.on('inventory-updated', handleInventoryUpdate);

    return () => {
      socketService.off('inventory-updated', handleInventoryUpdate);
    };
  }, [fetchProducts]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    const currentQtyInCart = existing ? existing.cartQuantity : 0;
    
    if (currentQtyInCart + 1 > product.stock) {
      alert('Not enough stock!');
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, cartQuantity: item.cartQuantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }

    // Show success notification
    const notification = {
      id: Date.now(),
      message: `${product.product} added to cart`,
      type: 'success'
    };
    setNotifications(prev => [notification, ...prev].slice(0, 3));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handlePaymentSuccess = async () => {
    const timestamp = new Date().toISOString();
    
    // Set flag to prevent showing stock update notifications for our own purchase
    window.__PURCHASE_IN_PROGRESS__ = true;
    
    try {
      // Record sales - this will also update stock on the server
      for (const item of cart) {
        await salesAPI.record({
          branch: item.branch,
          product: item.product,
          quantity: item.cartQuantity,
          total_amount: item.price * item.cartQuantity,
          timestamp
        });
      }
      
      // Show success notification (will auto-dismiss after 2 seconds)
      const notification = {
        id: Date.now(),
        message: 'Purchase successful! Thank you for shopping with us.',
        type: 'success'
      };
      setNotifications(prev => [notification, ...prev].slice(0, 3));
    } finally {
      // Clear the flag after a short delay to allow WebSocket to process
      setTimeout(() => {
        window.__PURCHASE_IN_PROGRESS__ = false;
      }, 500);
    }
    
    setCart([]);
    setShowPayment(false);
    setShowCart(false);
    fetchProducts();
  };

  // Handle M-Pesa payment
  const handleMpesaPayment = async (phone) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    
    try {
      // Initiate STK Push
      const response = await mpesaAPI.stkPush({
        phone,
        amount: total,
        branch: cart[0]?.branch,
        product: cart.map(c => c.product).join(', ')
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('M-Pesa error:', error);
      throw error;
    }
  };

  const handleLocationChange = (location) => {
    setSelectedBranch(location);
  };

  return (
    <div className="space-y-6">
      {/* Notifications Toast - auto-dismisses after 2 seconds */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`${
                notif.type === 'success' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              } text-white px-4 py-3 pr-8 rounded-lg shadow-lg transition-all duration-300 relative`}
            >
              {notif.message}
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="absolute top-1 right-1 text-white/70 hover:text-white text-sm"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Location Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors duration-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Select Location:</span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LOCATIONS.map(location => (
                <button 
                  key={location}
                  onClick={() => handleLocationChange(location)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedBranch === location 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowCart(true)}
            className="relative px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {cart.reduce((a, b) => a + b.cartQuantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No products found in this branch.</p>
            </div>
          )}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <CartModal 
          cart={cart} 
          onClose={() => setShowCart(false)} 
          onRemove={removeFromCart}
          onCheckout={() => setShowPayment(true)}
        />
      )}
      
      {showPayment && (
        <PaymentProcessing 
          amount={cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0)}
          onCancel={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          onMpesa={handleMpesaPayment}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card hover:shadow-md transition-all flex flex-col h-full group bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        <img 
          src={productImages[product.product] || productImages['Coke']} 
          alt={product.product}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold shadow-sm text-gray-900 dark:text-white">
          {product.branch}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.product}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Refreshing drink</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">KES {product.price}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.stock > 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>
      </div>

      <button 
        onClick={() => onAddToCart(product)}
        disabled={product.stock <= 0}
        className="mt-4 w-full bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Add to Cart
      </button>
    </div>
  );
}

function CartModal({ cart, onClose, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] transition-colors duration-200">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 font-bold text-xl">
                      {item.product[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.product}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
                      <span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{item.branch}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-300">x{item.cartQuantity}</span>
                    <span className="font-bold text-gray-900 dark:text-white">KES {item.price * item.cartQuantity}</span>
                    <button onClick={() => onRemove(item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">KES {total}</span>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Pay via M-Pesa
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentProcessing({ amount, onSuccess, onCancel, onMpesa }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');
  
  const handlePay = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Format phone to 254 format - accept both 07 and 01 prefixes
    let formattedPhone;
    if (phone.startsWith('07')) {
      formattedPhone = '254' + phone.substring(1);
    } else if (phone.startsWith('01')) {
      formattedPhone = '254' + phone.substring(1);
    } else if (phone.startsWith('254')) {
      formattedPhone = phone;
    } else {
      setError('Phone must start with 07, 01, or 254');
      return;
    }

    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setError('');
    setStep('processing');
    setProcessingMessage('Initiating M-Pesa STK Push...');

    try {
      // Call M-Pesa API
      const result = await onMpesa(formattedPhone);
      setProcessingMessage('Please check your phone for the STK push notification...');
      
      // Simulate waiting for callback (in real app, this would be real-time via WebSocket)
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 3000);
    } catch (err) {
      setError('Payment initiation failed. Please try again.');
      setStep('phone');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm relative z-10 p-6 text-center transition-colors duration-200">
        {step === 'phone' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">M-Pesa Payment</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Enter your M-Pesa number to pay <span className="font-bold text-gray-900 dark:text-white">KES {amount}</span>
            </p>
            
            <input 
              type="tel" 
              placeholder="07XX XXX XXX"
              className="w-full border dark:border-gray-600 px-4 py-3 rounded-lg mb-2 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(val);
                setError('');
              }}
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={handlePay} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">Pay Now</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Processing Payment</h3>
            <p className="text-gray-400 text-sm">{processingMessage}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">Payment Successful!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for shopping with us.</p>
          </div>
        )}
      </div>
    </div>
  );
}

