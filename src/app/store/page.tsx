'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { ShoppingBag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { STORE_PRODUCTS } from '@/lib/mock-db';

export default function StorePage() {
  const { coins, level } = useUser();
  const [filter, setFilter] = useState('all');
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const filteredProducts = STORE_PRODUCTS.filter(p => filter === 'all' || p.category === filter);

  const handleBuy = (product: typeof STORE_PRODUCTS[number]) => {
    if (coins < product.price) {
      toast.error('אין לך מספיק מטבעות! 😢');
      return;
    }
    if (level < product.minLevel) {
      toast.error(`נדרשת רמה ${product.minLevel} כדי לרכוש פריט זה`);
      return;
    }

    setPurchasing(product.id);
    
    // סימולציית רכישה
    setTimeout(() => {
      setPurchasing(null);
      confetti({ particleCount: 150, spread: 60 });
      toast.success(`תתחדש! רכשת ${product.name}`);
      // כאן בפועל נקרא ל-API לעדכן יתרה
      // refreshUser(); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
         <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                 חנות ההטבות <ShoppingBag className="text-purple-600" />
               </h1>
               <p className="text-sm text-slate-500">בזבז את ה-XP שלך בחוכמה</p>
            </div>

            {/* Wallet Display */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
               <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">היתרה שלך</div>
                  <div className="text-xl font-black text-yellow-600 flex items-center justify-end gap-1">
                    {coins.toLocaleString()} <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto p-6">
         <Tabs defaultValue="all" onValueChange={setFilter} className="w-full mb-8">
            <TabsList className="bg-white p-1 border border-slate-200 h-auto flex-wrap justify-start">
               <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">הכל</TabsTrigger>
               <TabsTrigger value="experiences">חוויות ונופש</TabsTrigger>
               <TabsTrigger value="gear">גאדג&apos;טים</TabsTrigger>
               <TabsTrigger value="swag">Swag חברה</TabsTrigger>
               <TabsTrigger value="growth">התפתחות</TabsTrigger>
               <TabsTrigger value="donate">תרומה לקהילה</TabsTrigger>
            </TabsList>
         </Tabs>

         {/* GRID */}
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
               const canAfford = coins >= product.price;
               const levelUnlocked = level >= product.minLevel;
               const isLocked = !levelUnlocked;

               return (
                  <Card key={product.id} className={`
                    border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative group bg-white
                    ${isLocked ? 'opacity-70 grayscale' : ''}
                  `}>
                     
                     {/* IMAGE AREA */}
                     <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-6xl relative">
                        {product.image}
                        
                        {/* Level Lock Overlay */}
                        {isLocked && (
                           <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                              <Lock size={32} className="mb-2" />
                              <span className="text-xs font-bold">נפתח ברמה {product.minLevel}</span>
                           </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                           <Badge variant="secondary" className="bg-white/80 backdrop-blur text-xs">
                              {product.category}
                           </Badge>
                        </div>
                     </div>

                     <CardContent className="p-5 flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{product.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 h-10">
                           {product.description}
                        </p>
                        
                        <div className="mt-4 flex items-baseline gap-1">
                           <span className={`text-xl font-black ${canAfford ? 'text-slate-900' : 'text-red-500'}`}>
                              {product.price.toLocaleString()}
                           </span>
                           <span className="text-xs text-slate-400 font-bold">מטבעות</span>
                        </div>
                     </CardContent>

                     <CardFooter className="p-5 pt-0">
                        <Button 
                           className={`w-full font-bold shadow-lg transition-all
                              ${canAfford && !isLocked 
                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
                           `}
                           disabled={!canAfford || isLocked || purchasing === product.id}
                           onClick={() => handleBuy(product)}
                        >
                           {purchasing === product.id
                              ? 'רוכש...'
                              : !canAfford
                                ? `חסרים לך ${(product.price - coins).toLocaleString()}`
                                : isLocked
                                  ? 'נעול'
                                  : 'רכוש עכשיו'
                           }
                        </Button>
                     </CardFooter>
                  </Card>
               );
            })}
         </div>
      </div>
    </div>
  );
}
