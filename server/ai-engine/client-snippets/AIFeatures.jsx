import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { addToCartProduct } from '../utils/addToCartProduct';

const AI_URL = import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8002';
const aiConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accesstoken') || ''}` }, withCredentials: true });

const Card = ({ title, children }) => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
    <h2 className="text-lg font-black text-white mb-4">{title}</h2>
    {children}
  </section>
);

const Btn = ({ children, ...props }) => (
  <button {...props} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 disabled:opacity-50">
    {children}
  </button>
);

const AIFeatures = () => {
  const user = useSelector(state => state.user);
  const userId = user?._id || user?.id || '';
  const [message, setMessage] = useState('I need groceries for 4 people for 3 days under ₹1500');
  const [copilot, setCopilot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [refill, setRefill] = useState([]);
  const [ingredients, setIngredients] = useState('rice, egg, onion, tomato');
  const [recipes, setRecipes] = useState([]);
  const [healthy, setHealthy] = useState(null);
  const [budget, setBudget] = useState(800);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [substitutions, setSubstitutions] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [eta, setEta] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [fridge, setFridge] = useState(null);
  const [products, setProducts] = useState([]);

  const post = async (path, body) => (await axios.post(`${AI_URL}/api/ai/${path}`, body, aiConfig())).data;

  useEffect(() => {
    axios.get(`${AI_URL}/api/ai/products?limit=100`, aiConfig()).then(r => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  const runCopilot = async () => {
    setLoading(true);
    try { const r = await post('copilot', { message, userId }); setCopilot(r.data); }
    catch (e) { toast.error(e.response?.data?.message || 'Copilot failed'); }
    finally { setLoading(false); }
  };

  const loadPersonal = async () => {
    if (!userId) return toast.error('Login first for personalized features');
    try {
      const [r, f] = await Promise.all([
        post('recommendations', {}),
        post('smart-refill', {})
      ]);
      setRecommendations(r.data || []); setRefill(f.data || []);
    } catch { toast.error('Could not load personalized AI'); }
  };

  const loadRecipes = async () => {
    try { const r = await post('recipes', { ingredients: ingredients.split(',').map(x => x.trim()).filter(Boolean) }); setRecipes(r.data || []); }
    catch { toast.error('Recipe AI failed'); }
  };

  const loadHealthy = async () => {
    try { const r = await post('healthy-basket', { budget: Number(budget), goals: ['high protein', 'low sugar'], vegetarian: true }); setHealthy(r.data); }
    catch { toast.error('Healthy basket failed'); }
  };

  const loadProductAI = async () => {
    if (!selectedProduct) return toast.error('Select a product');
    try {
      const [s, p, f] = await Promise.all([
        post('substitution', { productId: selectedProduct }),
        post('dynamic-pricing', { productId: selectedProduct }),
        post('demand-forecast', { productId: selectedProduct, horizon: 7 })
      ]);
      setSubstitutions(s.data); setPricing(p.data); setForecast(f.data);
    } catch { toast.error('Product AI failed'); }
  };

  const loadInventory = async () => {
    try { const r = await axios.get(`${AI_URL}/api/ai/inventory-intelligence`, aiConfig()); setInventory(r.data.data || []); }
    catch { toast.error('Inventory AI failed'); }
  };

  const loadEta = async () => {
    try { const r = await post('eta', { distanceKm: 3, traffic: 0.5, weather: 0.1, prepMinutes: 5, riderLoad: 0.2 }); setEta(r.data); }
    catch { toast.error('ETA failed'); }
  };

  const loadAdmin = async () => {
    try { const r = await axios.get(`${AI_URL}/api/ai/admin/command-center`, aiConfig()); setAdmin(r.data.data); }
    catch { toast.error('Admin AI failed'); }
  };

  const scan = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.append('image', file);
    try { const r = await axios.post(`${AI_URL}/api/ai/vision/fridge`, form); setFridge(r.data.data); }
    catch { toast.error('Fridge vision requires OPENAI_API_KEY'); }
  };

  const addBasket = async () => {
    if (!copilot?.basket?.length) return;
    for (const item of copilot.basket) await addToCartProduct(item.productId, item.quantity);
    toast.success('AI basket added to your cart');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">NeoBasket AI Lab</p>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-2">AI Shopping & Intelligence</h1>
          <p className="text-slate-400 mt-2">Copilot, recommendations, ML forecasting, pricing, vision and delivery intelligence.</p>
        </header>

        <Card title="🧠 AI Shopping Copilot">
          <div className="flex flex-col md:flex-row gap-3">
            <input value={message} onChange={e => setMessage(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" />
            <Btn onClick={runCopilot} disabled={loading}>{loading ? 'Planning...' : 'Build AI Basket'}</Btn>
          </div>
          {copilot && <div className="mt-5 space-y-3">
            {copilot.basket.map(item => <div key={item.productId} className="flex justify-between bg-slate-950 rounded-xl p-3"><span>{item.name} × {item.quantity}</span><b>₹{item.subtotal}</b></div>)}
            <div className="flex flex-wrap gap-4 font-black"><span>Total ₹{copilot.total}</span><span className="text-emerald-400">Saving ₹{copilot.saving}</span><span>Remaining ₹{copilot.remainingBudget}</span></div>
            <Btn onClick={addBasket}>🛒 Add AI Basket to Cart</Btn>
          </div>}
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="🎯 Personalized Recommendations + Smart Refill"><Btn onClick={loadPersonal}>Analyze My History</Btn><div className="mt-4 space-y-2">{recommendations.map(x => <div key={x.id} className="bg-slate-950 rounded-xl p-3">{x.name}</div>)}{refill.slice(0,6).map(x => <div key={x.productId} className="bg-slate-950 rounded-xl p-3">🔄 {x.productName}: {x.needsRefill ? 'Refill now' : `${x.predictedNextPurchaseInDays} days`}</div>)}</div></Card>
          <Card title="🍳 What Can I Cook? AI"><input value={ingredients} onChange={e => setIngredients(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" /><Btn onClick={loadRecipes} className="mt-3">Generate Recipes</Btn><div className="mt-4 space-y-2">{recipes.map((x,i) => <div key={i} className="bg-slate-950 rounded-xl p-3"><b>{x.name}</b><div className="text-xs text-slate-400 mt-1">Missing: {(x.missingIngredients || []).join(', ') || 'None'}</div></div>)}</div></Card>
          <Card title="🥗 Healthy Basket AI"><div className="flex gap-3"><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" /><Btn onClick={loadHealthy}>Optimize</Btn></div>{healthy && <div className="mt-4">{healthy.basket.map(x => <div key={x.productId} className="p-2">{x.name} — ₹{x.price}</div>)}<b>Total ₹{healthy.total}</b></div>}</Card>
          <Card title="📸 Fridge Scanner"><input type="file" accept="image/*" onChange={scan} className="w-full" />{fridge && <div className="mt-4"><b>Detected</b><div>{fridge.items.map((x,i)=><span key={i} className="inline-block bg-slate-800 rounded-full px-3 py-1 m-1">{x.name}</span>)}</div><p className="mt-3">Recipes: {fridge.recipes.map(x=>x.name).join(', ')}</p></div>}</Card>
        </div>

        <Card title="📦 Product AI: Substitution + Dynamic Pricing + Demand Forecasting">
          <div className="flex flex-col md:flex-row gap-3"><select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3"><option value="">Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — ₹{p.sellingPrice}</option>)}</select><Btn onClick={loadProductAI}>Run Product AI</Btn></div>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div className="bg-slate-950 rounded-xl p-4"><b>Substitutions</b>{substitutions?.alternatives?.slice(0,4).map(x=><p key={x.id} className="text-sm mt-2">{x.name} <span className="text-emerald-400">{x.similarity}%</span></p>)}</div>
            <div className="bg-slate-950 rounded-xl p-4"><b>Dynamic Price</b>{pricing && <><p className="text-2xl font-black mt-2">₹{pricing.finalPrice}</p><p className="text-xs text-slate-400">Range ₹{pricing.minPrice}–₹{pricing.maxPrice}</p><p className="text-xs mt-2">{pricing.reason}</p></>}</div>
            <div className="bg-slate-950 rounded-xl p-4"><b>7-Day Demand</b>{forecast?.predictions?.map(x=><p key={x.day} className="text-sm mt-1">Day {x.day}: {x.predictedDemand}</p>)}</div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="🚚 AI Delivery ETA"><Btn onClick={loadEta}>Predict ETA</Btn>{eta && <p className="text-3xl font-black text-emerald-400 mt-4">{eta.etaText}</p>}</Card>
          <Card title="🏪 Dark Store / Inventory Intelligence"><Btn onClick={loadInventory}>Analyze Inventory</Btn><div className="mt-4 max-h-72 overflow-auto">{inventory.slice(0,20).map(x=><div key={x.productId} className="flex justify-between border-b border-slate-800 py-2"><span>{x.name}</span><span className={x.risk==='CRITICAL'?'text-red-400':x.risk==='WARNING'?'text-yellow-400':'text-emerald-400'}>{x.risk}</span></div>)}</div></Card>
        </div>

        {user?.role === 'ADMIN' && <Card title="👨‍💼 Admin AI Command Center"><Btn onClick={loadAdmin}>Load Command Center</Btn>{admin && <div className="grid md:grid-cols-4 gap-3 mt-4">{[['Orders',admin.ordersToday],['Risk Items',admin.inventoryRiskCount],['Critical',admin.critical.length],['Warnings',admin.warning.length]].map(([a,b])=><div key={a} className="bg-slate-950 rounded-xl p-4"><p className="text-xs text-slate-500">{a}</p><p className="text-2xl font-black">{b}</p></div>)}<div className="md:col-span-4 space-y-2">{admin.recommendations.map((x,i)=><div key={i} className="bg-slate-950 rounded-xl p-3">🤖 {x.action} — {x.quantity} units</div>)}</div></div>}</Card>}
      </div>
    </main>
  );
};

export default AIFeatures;
