import React from 'react';
import { FileText, Shield, CheckCircle, Scale } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Uslovi korištenja"
      subtitle="Zvanični uslovi korištenja WorkOra PWA aplikacije"
      icon={<Scale className="w-5 h-5 text-indigo-500" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
        {/* Datum ažuriranja */}
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
          <span>Verzija: 2026.1 (Bosna i Hercegovina / EU)</span>
          <span className="font-semibold">Važeće od: 01.01.2026.</span>
        </div>

        {/* 1. Prihvatanje uslova */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Prihvatanje uslova
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Pristupanjem i korištenjem <strong>WorkOra</strong> aplikacije (u daljem tekstu: „Aplikacija“), potvrđujete da ste u potpunosti pročitali, razumjeli i prihvatili ove Uslove korištenja. Ukoliko se ne slažete sa bilo kojom odredbom ovih uslova, molimo vas da ne koristite ovu aplikaciju.
          </p>
        </div>

        {/* 2. Opis usluge */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            Opis usluge
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            WorkOra je progresivna web aplikacija (PWA) specijalizovana za samostalne radnike, obrtnike, freelancere i pružaoce usluga. Aplikacija omogućava digitalnu evidenciju radnih sati po klijentima, raspored poslova kroz kalendar (agendu), automatski matematički obračun zarade po satnici ili dnevnici, te generisanje službenih mjesečnih PDF izvještaja.
          </p>
        </div>

        {/* 3. Korisnički račun i sigurnost */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            Korisnički račun i sigurnost
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Za pristup punoj funkcionalnosti evidencije potrebno je kreirati korisnički račun. Korisnik je isključivo i u potpunosti odgovoran za čuvanje tajnosti svoje pristupne lozinke i email adrese. Sve radnje izvršene pod vašim korisničkim računom smatraju se vašim radnjama. U slučaju sumnje na neovlašten pristup, dužni ste odmah promijeniti lozinku ili nas obavijestiti.
          </p>
        </div>

        {/* 4. Tačnost podataka i ograničenje odgovornosti */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
            Tačnost podataka i odgovornost
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Korisnik samostalno vrši unos radnih sati, satnica, fiksnih dnevnica i naziva svojih klijenata. WorkOra i njen vlasnik ne snose odgovornost za netačne unose korisnika, greške u međusobnim finansijskim obračunima između korisnika i njegovih klijenata, niti za knjigovodstvene, poreske ili pravne propuste nastale korištenjem izvezenih PDF izvještaja.
          </p>
        </div>

        {/* 5. Intelektualno vlasništvo */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
            Intelektualno vlasništvo
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Sva autorska prava, žigovi, vizuelni identitet, logotip, dizajn i softverski kod aplikacije WorkOra isključivo su intelektualno vlasništvo razvojnog tima <strong>Orizon-AIX</strong>. Strogo je zabranjeno neovlašteno kopiranje, reverzni inženjering, distribucija ili preprodaja bilo kojeg dijela aplikacije bez izričitog pismenog odobrenja.
          </p>
        </div>

        {/* 6. Izmjene uslova */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">6</span>
            Izmjene uslova
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Zadržavamo diskreciono pravo da u bilo koje vrijeme izmijenimo ili dopunimo ove Uslove korištenja radi usklađivanja sa zakonskim propisima ili uvođenja novih funkcionalnosti. Nastavak korištenja aplikacije nakon objavljivanja izmijenjenih uslova smatra se vašim prihvatanjem istih.
          </p>
        </div>

        {/* Zaključno dugme */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Razumijem i prihvatam</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
