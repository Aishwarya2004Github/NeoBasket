import React from "react"
import banner from "../assets/banner.png"
import bannerMobile from "../assets/banner-mobile.jpg"
import { useSelector } from "react-redux"
import { valideURLConvert } from "../utils/valideURLConvert"
import { useNavigate } from "react-router-dom"
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay"
import AICopilot from "../components/AICopilot";
import ShoppingRobot from "../components/ShoppingRobot";

const Home = () => {
  const navigate = useNavigate()

  const loadingCategory = useSelector(
    (state) => state.product.loadingCategory
  )

  const categoryData = useSelector(
    (state) => state.product.allCategory || []
  )

  const subCategoryData = useSelector(
    (state) => state.product.allSubCategory || []
  )

  // ---------------- SAFE NAVIGATION ----------------
  const handleRedirectProductListpage = (category) => {
    if (!category) return

    const subsubcategory = subCategoryData.find(
      (item) => item.categoryId === category.id
    )

    if (!subcategory) {
      console.log("No subcategory found for:", category.name)
      return
    }

    const url = `/${valideURLConvert(category.name)}-${category.id}/${valideURLConvert(subcategory.name)}-${subcategory.id}`
    navigate(url)
  }

  // Mast Vibrant Neon Color Palettes with individual neon drop shadows
  const vibrantColors = [
    { bg: 'from-pink-500 to-rose-600', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]', text: 'group-hover:text-pink-400' },
    { bg: 'from-cyan-400 to-blue-600', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]', text: 'group-hover:text-cyan-400' },
    { bg: 'from-amber-400 to-orange-600', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]', text: 'group-hover:text-amber-400' },
    { bg: 'from-emerald-400 to-teal-600', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]', text: 'group-hover:text-emerald-400' },
    { bg: 'from-fuchsia-500 to-purple-700', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.5)]', text: 'group-hover:text-fuchsia-400' },
    { bg: 'from-yellow-300 to-amber-500', glow: 'shadow-[0_0_20px_rgba(253,224,71,0.5)]', text: 'group-hover:text-yellow-300' },
    { bg: 'from-violet-500 to-indigo-700', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]', text: 'group-hover:text-violet-400' },
    { bg: 'from-lime-400 to-green-600', glow: 'shadow-[0_0_20px_rgba(163,230,53,0.5)]', text: 'group-hover:text-lime-400' }
  ]

  return (
    <section className="bg-slate-950 min-h-screen pb-16 antialiased text-white relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* ---------------- STYLESHEET FOR CUSTOM ANIMATIONS ---------------- */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) scale(1.05); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
        @keyframes borderMarquee {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float-1 { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-2 { animation: floatReverse 10s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 6s ease-in-out infinite; }
        .animate-border-flow { background-size: 200% 200%; animation: borderMarquee 4s linear infinite; }
      `}</style>

      {/* Dynamic Animated Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-pink-600/20 to-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/10 to-blue-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '-3s' }} />

      {/* 1. HERO BANNER ZONE (Animated Gradient Border Flow) */}
      <div className="container mx-auto px-4 pt-6 transition-all duration-700 ease-out animate-float-1">
        <div className="relative w-full aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1] rounded-2xl overflow-hidden p-[3px] bg-gradient-to-r from-pink-500 via-yellow-400 via-cyan-400 to-purple-600 animate-border-flow shadow-[0_0_35px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all duration-500 group">
          <div className="w-full h-full rounded-[13px] overflow-hidden bg-slate-900 relative">
            <img
              src={banner}
              alt="Flash Delivery Banner"
              className="w-full h-full hidden lg:block object-cover brightness-110 contrast-105 transition-transform duration-700 group-hover:scale-105"
            />
            <img
              src={bannerMobile}
              alt="Flash Delivery Banner Mobile"
              className="w-full h-full lg:hidden object-cover brightness-110 contrast-105 transition-transform duration-700 group-hover:scale-105"
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. LIVE GLOWING VALUE STRIP (Micro-interactions) */}
      <div className="container mx-auto px-4 my-8">
        <div className="grid grid-cols-3 gap-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 border-r border-slate-800/80 last:border-0 group cursor-pointer py-1">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 animate-pulse">⚡</span>
            <div>
              <p className="text-xs md:text-sm font-black bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-white transition-all duration-300">10 Min Delivery</p>
              <p className="text-[10px] text-slate-400 hidden sm:block group-hover:text-slate-200 transition-colors">Packed & packing heat</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 border-r border-slate-800/80 last:border-0 group cursor-pointer py-1">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] transform transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12">🍏</span>
            <div>
              <p className="text-xs md:text-sm font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-white transition-all duration-300">Super Fresh</p>
              <p className="text-[10px] text-slate-400 hidden sm:block group-hover:text-slate-200 transition-colors">Farm to your doorstep</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 last:border-0 group cursor-pointer py-1">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">💰</span>
            <div>
              <p className="text-xs md:text-sm font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-white transition-all duration-300">Best Prices</p>
              <p className="text-[10px] text-slate-400 hidden sm:block group-hover:text-slate-200 transition-colors">Crushing local rates</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. NEON CATEGORY GRID (Smooth Hover-Pop & 3D Tilt Effect) */}
      <div className="container mx-auto px-4 my-8 relative z-10 animate-float-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              🚀 Shop by Category
            </h2>
            <p className="text-xs font-bold text-cyan-400 tracking-widest uppercase mt-1 animate-pulse">⚡ Instant Gratification Grid</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-5">
          {loadingCategory ? (
            new Array(10).fill(null).map((_, index) => (
              <div key={index} className="animate-pulse flex flex-col items-center">
                <div className="bg-slate-900 border border-slate-800 aspect-square w-full rounded-2xl"></div>
                <div className="bg-slate-800 h-3 w-3/4 mt-3 rounded-full"></div>
              </div>
            ))
          ) : categoryData.length > 0 ? (
            categoryData.map((cat, index) => {
              const colorConfig = vibrantColors[index % vibrantColors.length];
              return (
                <div
                  key={cat.id}
                  onClick={() => handleRedirectProductListpage(cat)}
                  className="group cursor-pointer flex flex-col items-center text-center transition-all duration-300"
                >
                  {/* Outer interactive grid capsule */}
                  <div className={`w-full aspect-square bg-gradient-to-br ${colorConfig.bg} ${colorConfig.glow} rounded-2xl p-3 flex items-center justify-center border border-white/10 relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-115 group-hover:-translate-y-2 group-hover:rotate-3`}>
                    
                    {/* Laser shine sweep animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-border-flow" style={{ width: '200%', transition: '0.8s' }} />
                    
                    <img
                      src={cat.image?.startsWith("http") ? cat.image : `http://localhost:8080${cat.image}`}
                      alt={cat.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                    />
                  </div>

                  {/* Reactive Dynamic Color Titles */}
                  <p className={`text-xs font-black text-slate-300 mt-3 tracking-tight line-clamp-2 px-1 transition-all duration-300 ${colorConfig.text} group-hover:scale-105`}>
                    {cat.name}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 font-extrabold tracking-wide">
               Hurry up! Stocking items up.
            </div>
          )}
        </div>
      </div>

      {/* 4. DYNAMIC SHELVES (Glow Cards with Smooth Reveal) */}
      <div className="container mx-auto px-4 mt-12 space-y-12 relative z-10">
        {categoryData.length > 0 ? (
          categoryData.map((c, index) => {
            const rowGlow = index % 2 === 0 
              ? 'hover:border-pink-500/40 shadow-[0_0_30px_rgba(244,63,94,0.02)] hover:shadow-[0_0_40px_rgba(244,63,94,0.1)]' 
              : 'hover:border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.02)] hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]';
            
            return (
              <div 
                key={c.id} 
                className={`bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-900 transition-all duration-500 ease-out transform hover:-translate-y-1 ${rowGlow}`}
              >
                <CategoryWiseProductDisplay
                  id={c.id}
                  name={c.name}
                />
              </div>
            )
          })
        ) : (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 backdrop-blur-sm">
            <p className="text-slate-500 font-black text-xl animate-bounce">
              🛸 Teleporting refreshing stock onto shelves...
            </p>
          </div>
        )}
      </div>
<AICopilot />
<ShoppingRobot />
    </section>
  )
}

export default Home