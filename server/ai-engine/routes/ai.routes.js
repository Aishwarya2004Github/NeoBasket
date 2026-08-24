const { Router } = require('express');
const multer = require('multer');
const { createCopilotBasket } = require('../services/copilot.service');
const { recommendations, forgotSomething } = require('../services/recommendation.service');
const { smartRefill } = require('../services/refill.service');
const { recipesFromIngredients, healthyBasket } = require('../services/recipe.service');
const { substitutes } = require('../services/substitution.service');
const { dynamicPrice } = require('../services/pricing.service');
const { demandForecast, inventoryIntelligence, expiryIntelligence } = require('../services/forecast.service');
const { predictEta } = require('../services/eta.service');
const { commandCenter } = require('../services/admin.service');
const { scanFridge } = require('../services/vision.service');
const { getProducts } = require('../lib/ai-data');
const { auth, admin } = require('../middleware.auth');

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/products', async (req, res) => {
  try { res.json({ success: true, data: await getProducts({ search: req.query.search, limit: req.query.limit || 100 }) }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/copilot', async (req, res) => {
  try { res.json({ success: true, data: await createCopilotBasket({ message: req.body.message, userId: req.body.userId || null }) }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/cheapest-basket', async (req, res) => {
  try {
    const products = await getProducts({ limit: 500 });
    const budget = Number(req.body.budget || 300);
    const categories = Array.isArray(req.body.categories) ? req.body.categories.map(String) : [];
    const goals = Array.isArray(req.body.goals) ? req.body.goals.map(x => String(x).toLowerCase()) : [];
    const candidates = products.filter(p => p.stock > 0 && (!categories.length || categories.includes(p.category) || categories.includes(p.subCategory)) && (!goals.includes('vegetarian') || !/egg|chicken|mutton|fish|meat/i.test(p.name)));
    const basket = [];
    let total = 0;
    for (const p of candidates.sort((a,b)=>a.sellingPrice-b.sellingPrice)) {
      if (total + p.sellingPrice <= budget) { basket.push({ productId:p.id, name:p.name, price:p.sellingPrice, quantity:1 }); total += p.sellingPrice; }
    }
    res.json({ success:true, data:{ budget, basket, total, saving:budget-total, goals } });
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

router.post('/recommendations', auth, async (req,res)=>{ try { res.json({success:true,data:await recommendations(req.userId, req.body.limit || 8)}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/smart-refill', auth, async (req,res)=>{ try { res.json({success:true,data:await smartRefill(req.userId)}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/forgot-something', auth, async (req,res)=>{ try { res.json({success:true,data:await forgotSomething(req.userId, req.body.cartProductIds || [])}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/recipes', async (req,res)=>{ try { res.json({success:true,data:await recipesFromIngredients(req.body.ingredients || [], req.body.budget)}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/healthy-basket', async (req,res)=>{ try { res.json({success:true,data:await healthyBasket(req.body)}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/substitution', async (req, res) => {
    try {
        const productId = String(req.body?.productId || "").trim();

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const data = await substitutes(productId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data
        });

    } catch (e) {
        console.error("SUBSTITUTION ERROR:", e);

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
});
router.post('/dynamic-pricing', auth, admin, async (req, res) => {
    try {
        const productId = String(req.body?.productId || "").trim();

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const data = await dynamicPrice({
            ...req.body,
            productId
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data
        });

    } catch (e) {
        console.error("DYNAMIC PRICING ERROR:", e);

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
});
router.post('/demand-forecast', auth, admin, async (req, res) => {
    try {
        const productId = String(req.body?.productId || "").trim();
        const horizon = Number(req.body?.horizon || 7);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const data = await demandForecast(
            productId,
            horizon
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data
        });

    } catch (e) {
        console.error("DEMAND FORECAST ERROR:", e);

        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
});
router.get('/inventory-intelligence', auth, admin, async (req,res)=>{ try { res.json({success:true,data:await inventoryIntelligence()}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/expiry-intelligence', auth, admin, async (req,res)=>{ try { const data=await expiryIntelligence(req.body.productId, Number(req.body.expiryDays || 3)); if(!data) return res.status(404).json({success:false,message:'Product not found'}); res.json({success:true,data}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/eta', (req,res)=>{ try { res.json({success:true,data:predictEta(req.body)}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.get('/admin/command-center', auth, admin, async(req,res)=>{ try { res.json({success:true,data:await commandCenter()}); } catch(e){res.status(500).json({success:false,message:e.message});} });
router.post('/vision/fridge', upload.single('image'), async(req,res)=>{ try { if(!req.file) return res.status(400).json({success:false,message:'Upload an image'}); const base64=`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`; res.json({success:true,data:await scanFridge(base64)}); } catch(e){res.status(500).json({success:false,message:e.message});} });

module.exports = router;
