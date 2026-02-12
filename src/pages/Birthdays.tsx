import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Cake, Heart, Gift, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

const Birthdays = () => {
  const { customers } = useStore();

  const today = new Date();
  const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const birthdays = useMemo(() => {
    return customers
      .filter(c => c.birthday)
      .map(c => {
        const d = new Date(c.birthday!);
        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const isToday = mmdd === todayStr;
        const nextBirthday = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        if (nextBirthday < today && !isToday) nextBirthday.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...c, isToday, daysUntil, birthDate: d };
      })
      .filter(c => c.daysUntil >= 0 && c.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [customers, todayStr]);

  const anniversaries = useMemo(() => {
    return customers
      .filter(c => c.anniversary)
      .map(c => {
        const d = new Date(c.anniversary!);
        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const isToday = mmdd === todayStr;
        const nextAnniversary = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        if (nextAnniversary < today && !isToday) nextAnniversary.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...c, isToday, daysUntil, annivDate: d };
      })
      .filter(c => c.daysUntil >= 0 && c.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [customers, todayStr]);

  return (
    <div>
      <div className="page-header">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Birthdays & Anniversaries</h1>
          <p className="page-subtitle">Never miss a special day — send wishes & offers</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Birthdays */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center">
              <Cake className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Birthdays</h2>
              <p className="text-xs text-muted-foreground font-body tracking-wider">{birthdays.length} clients with birthdays</p>
            </div>
          </div>
          {birthdays.length === 0 ? (
            <div className="p-12 text-center">
              <Cake className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No birthdays recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {birthdays.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`px-6 py-4 flex items-center justify-between ${c.isToday ? 'bg-accent/10' : 'hover:bg-muted/30'} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar-circle h-10 w-10 shrink-0">
                      <span className="avatar-text text-xs">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(c.birthDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.isToday ? (
                      <span className="inline-flex items-center gap-1 text-xs font-body font-bold text-accent px-3 py-1 rounded-full bg-accent/15">
                        <Gift className="h-3 w-3" /> Today! 🎉
                      </span>
                    ) : (
                      <span className="text-xs font-body text-muted-foreground">
                        in {c.daysUntil} day{c.daysUntil !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Anniversaries */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center">
              <Heart className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Anniversaries</h2>
              <p className="text-xs text-muted-foreground font-body tracking-wider">{anniversaries.length} clients with anniversaries</p>
            </div>
          </div>
          {anniversaries.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No anniversaries recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {anniversaries.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`px-6 py-4 flex items-center justify-between ${c.isToday ? 'bg-accent/10' : 'hover:bg-muted/30'} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar-circle h-10 w-10 shrink-0">
                      <span className="avatar-text text-xs">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(c.annivDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.isToday ? (
                      <span className="inline-flex items-center gap-1 text-xs font-body font-bold text-accent px-3 py-1 rounded-full bg-accent/15">
                        <Heart className="h-3 w-3" /> Today! 💕
                      </span>
                    ) : (
                      <span className="text-xs font-body text-muted-foreground">
                        in {c.daysUntil} day{c.daysUntil !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Birthdays;
