import React, { useState, useEffect } from 'react';
import { TopNavBar }    from '../../../components/concession/TopNavBar';
import { ProgressBar }  from '../../../components/concession/ProgressBar';
import { HeroSnackCard } from '../../../components/concession/HeroSnackCard';
import { SnackCard }    from '../../../components/concession/SnackCard';
import { OrderSummary } from '../../../components/concession/OrderSummary';
import { concessionService } from '../../../services/concessionService';

const ConcessionPage = () => {
  const [snacks, setSnacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    concessionService.getAll()
      .then((res) => {
        const items = res.data.map(item => ({
          ...item,
          price: Number(item.price),
          quantity: 0,
        }));
        setSnacks(items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateQuantity = (id, delta) => {
    setSnacks(prev =>
      prev.map(snack =>
        snack.id === id
          ? { ...snack, quantity: Math.max(0, snack.quantity + delta) }
          : snack
      )
    );
  };

  const ticketPrice  = 32.00;
  const snacksTotal  = snacks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalPayable = ticketPrice + snacksTotal;

  const addedSnacks = snacks
    .filter(s => s.quantity > 0)
    .map(s => ({ name: s.name, quantity: s.quantity, price: s.price }));

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNavBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-on-surface-variant text-sm">Loading snacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNavBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 relative">
          <ProgressBar />

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
            {snacks.length > 0 && (
              <HeroSnackCard
                {...snacks[0]}
                onAdd={()    => updateQuantity(snacks[0].id, 1)}
                onRemove={() => updateQuantity(snacks[0].id, -1)}
              />
            )}

            {snacks.slice(1).map(snack => (
              <SnackCard
                key={snack.id}
                {...snack}
                onAdd={()    => updateQuantity(snack.id, 1)}
                onRemove={() => updateQuantity(snack.id, -1)}
              />
            ))}
          </div>
        </main>

        <OrderSummary
          items={addedSnacks}
          total={totalPayable}
        />
      </div>
    </div>
  );
};

export default ConcessionPage;