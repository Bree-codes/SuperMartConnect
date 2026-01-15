function ProductCard({ product, onAddToCart }) {
  // Simple image mapping
  const images = {
    'Coke': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
    'Fanta': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=600&auto=format&fit=crop',
    'Sprite': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=600&auto=format&fit=crop'
  };

  return (
    <div className="card hover:shadow-md transition-all flex flex-col h-full group bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
         <img 
            src={images[product.product] || images['Coke']} 
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
            <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </span>
        </div>
      </div>

      <button 
        onClick={() => onAddToCart(product)}
        disabled={product.stock <= 0}
        className="mt-4 w-full bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <div className="icon-shopping-cart text-sm"></div>
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
                        <div className="icon-shopping-bag text-blue-600 dark:text-blue-400"></div>
                        Your Cart
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                        <div className="icon-x"></div>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="icon-shopping-cart text-4xl mb-4 mx-auto text-gray-300 dark:text-gray-600"></div>
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                                         {/* Placeholder for cart item img */}
                                         <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 font-bold">
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
                                            <div className="icon-trash text-sm"></div>
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
                        <div className="icon-credit-card"></div>
                        Pay via M-Pesa
                    </button>
                </div>
            </div>
        </div>
    );
}

function PaymentProcessing({ amount, onSuccess, onCancel }) {
    const [step, setStep] = React.useState('phone'); // phone, processing, success
    const [phone, setPhone] = React.useState('');
    
    const handlePay = () => {
        if(phone.length < 10) return;
        setStep('processing');
        // Simulate API call
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm relative z-10 p-6 text-center transition-colors duration-200">
                {step === 'phone' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="icon-smartphone text-green-600 dark:text-green-400 text-2xl"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">M-Pesa Payment</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Enter your M-Pesa number to pay <span className="font-bold text-gray-900 dark:text-white">KES {amount}</span></p>
                        
                        <input 
                            type="tel" 
                            placeholder="07XX XXX XXX"
                            className="w-full border dark:border-gray-600 px-4 py-3 rounded-lg mb-4 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        
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
                        <p className="text-gray-400 text-sm">Please check your phone for the STK push...</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <div className="icon-check text-green-600 dark:text-green-400 text-2xl"></div>
                        </div>
                        <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">Payment Successful!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for shopping with us.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CustomerView({ user }) {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [cart, setCart] = React.useState([]);
  const [showCart, setShowCart] = React.useState(false);
  const [showPayment, setShowPayment] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState('All');
  
  const branches = ['All', 'Kisumu', 'Mombasa', 'Nakuru', 'Eldoret'];

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getInventory(selectedBranch === 'All' ? null : selectedBranch);
    setProducts(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, [selectedBranch]);

  const addToCart = (product) => {
    // Check if enough stock in cart locally (simplified)
    const existing = cart.find(item => item.id === product.id);
    const currentQtyInCart = existing ? existing.cartQuantity : 0;
    
    if (currentQtyInCart + 1 > product.stock) {
      alert('Not enough stock!');
      return;
    }

    if (existing) {
        setCart(cart.map(item => item.id === product.id ? {...item, cartQuantity: item.cartQuantity + 1} : item));
    } else {
        setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handlePaymentSuccess = async () => {
    // Process sales records
    const timestamp = new Date().toISOString();
    
    // Fetch fresh inventory to ensure we calculate stock based on latest data
    const currentInventory = await getInventory();

    for (const item of cart) {
        // 1. Record Sale
        await recordSale({
            branch: item.branch,
            product: item.product,
            quantity: item.cartQuantity,
            total_amount: item.price * item.cartQuantity,
            timestamp
        });
        
        // 2. Update Stock
        // Find the item in the fresh inventory list
        const currentItem = currentInventory.find(p => p.id === item.id);
        
        // Fallback to local state if for some reason not found (unlikely) or if we want to be safe
        const stockToUse = currentItem ? currentItem.stock : (products.find(p => p.id === item.id)?.stock || 0);
        
        const newStock = Math.max(0, stockToUse - item.cartQuantity);
        await updateStock(item.id, newStock);
    }
    
    setCart([]);
    setShowPayment(false);
    setShowCart(false);
    fetchProducts(); // Refresh inventory
  };

  return (
    <div className="space-y-6" data-name="customer-view">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Filter by Branch:</span>
          <div className="flex gap-2">
            {branches.map(b => (
                <button 
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedBranch === b ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    {b}
                </button>
            ))}
          </div>
        </div>
        
        <button 
            onClick={() => setShowCart(true)}
            className="relative px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
            <div className="icon-shopping-cart"></div>
            Cart
            {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {cart.reduce((a, b) => a + b.cartQuantity, 0)}
                </span>
            )}
        </button>
      </div>

      {/* Grid */}
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

      {/* Modals */}
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
        />
      )}
    </div>
  );
}