function AdminView() {
    const [activeTab, setActiveTab] = React.useState('inventory'); // inventory, reports
    const [inventory, setInventory] = React.useState([]);
    const [sales, setSales] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    
    // For restocking
    const [editingItem, setEditingItem] = React.useState(null);
    const [restockAmount, setRestockAmount] = React.useState(10);

    const fetchData = async () => {
        setLoading(true);
        const invData = await getInventory();
        const salesData = await getSalesReport();
        setInventory(invData);
        setSales(salesData);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleRestock = async () => {
        if (!editingItem) return;
        const newStock = editingItem.stock + parseInt(restockAmount);
        const success = await updateStock(editingItem.id, newStock);
        if (success) {
            setEditingItem(null);
            fetchData();
        } else {
            alert('Failed to update stock');
        }
    };
    
    // Chart Data Preparation
    const prepareChartData = () => {
        // 1. Drinks sold per brand
        const soldPerBrand = { Coke: 0, Fanta: 0, Sprite: 0 };
        // 2. Income per brand
        const incomePerBrand = { Coke: 0, Fanta: 0, Sprite: 0 };
        // 3. Total income per branch (extra)
        
        sales.forEach(sale => {
            if(soldPerBrand[sale.product] !== undefined) {
                soldPerBrand[sale.product] += sale.quantity;
                incomePerBrand[sale.product] += sale.total_amount;
            }
        });

        return { soldPerBrand, incomePerBrand };
    };

    const { soldPerBrand, incomePerBrand } = prepareChartData();
    const totalIncome = Object.values(incomePerBrand).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6" data-name="admin-view">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Headquarters Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchData}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <div className={`icon-refresh-cw ${loading ? 'animate-spin' : ''}`}></div>
                    </button>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Inventory & Restock
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Sales Reports
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'inventory' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden transition-colors duration-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white uppercase font-semibold text-xs border-b dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">Branch</th>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Current Stock</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {inventory.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.branch}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${item.product === 'Coke' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                                                          item.product === 'Fanta' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                        {item.product}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={item.stock < 10 ? 'text-red-600 dark:text-red-400 font-bold' : 'dark:text-gray-300'}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">KES {item.price}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setEditingItem(item)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium hover:underline"
                                                    >
                                                        Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                             {/* Stats Cards */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30">
                                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">KES {totalIncome.toLocaleString()}</h3>
                                </div>
                                <div className="card">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Top Selling Product</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {Object.entries(soldPerBrand).sort((a,b) => b[1] - a[1])[0]?.[0] || '-'}
                                    </h3>
                                </div>
                                <div className="card">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Items Sold</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {Object.values(soldPerBrand).reduce((a,b) => a+b, 0)}
                                    </h3>
                                </div>
                             </div>

                             {/* Charts */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Sales Volume by Brand</h3>
                                    <div className="h-64">
                                        <SimpleBarChart 
                                            label="Units Sold" 
                                            labels={Object.keys(soldPerBrand)} 
                                            data={Object.values(soldPerBrand)}
                                            colors={['#ef4444', '#f97316', '#22c55e']} // Coke red, Fanta orange, Sprite green
                                        />
                                    </div>
                                </div>
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4">Revenue by Brand</h3>
                                    <div className="h-64">
                                        <SimpleBarChart 
                                            label="Revenue (KES)" 
                                            labels={Object.keys(incomePerBrand)} 
                                            data={Object.values(incomePerBrand)}
                                            colors={['#ef4444', '#f97316', '#22c55e']}
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </>
            )}

            {/* Restock Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingItem(null)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm relative z-10 p-6 transition-colors duration-200">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Restock {editingItem.product}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Adding stock to <strong>{editingItem.branch}</strong> branch.
                            <br/>Current Level: {editingItem.stock}
                        </p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity to Add</label>
                            <div className="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">
                                <button onClick={() => setRestockAmount(Math.max(1, restockAmount - 10))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-r dark:border-gray-600 text-gray-600 dark:text-gray-300">-</button>
                                <input 
                                    type="number" 
                                    value={restockAmount} 
                                    onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                                    className="flex-1 text-center py-2 focus:outline-none dark:bg-gray-700 dark:text-white"
                                />
                                <button onClick={() => setRestockAmount(restockAmount + 10)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-l dark:border-gray-600 text-gray-600 dark:text-gray-300">+</button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setEditingItem(null)} className="flex-1 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                            <button onClick={handleRestock} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Confirm Restock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SimpleBarChart({ label, labels, data, colors }) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: colors,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [labels, data, colors]);

    return <canvas ref={canvasRef}></canvas>;
}