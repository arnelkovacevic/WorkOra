import React from 'react';
import { ShieldCheck, Lock, Database, ExternalLink, CheckCircle, EyeOff } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Politika privatnosti"
      subtitle="Kako WorkOra štiti, obrađuje i čuva vaše privatne podatke"
      icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
        {/* Banner o privatnosti */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>GDPR & Zaštita privatnih podataka</span>
          <span className="font-semibold">Ažurirano: 2026.</span>
        </div>

        {/* 1. Prikupljanje podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Prikupljanje podataka
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            WorkOra poštuje princip minimalne obrade podataka. Prikupljamo isključivo one informacije koje su nužne za funkcionisanje evidencije:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>Podaci o računu:</strong> Vaše ime i prezime, te važeća email adresa (potrebna za prijavu i slanje reset koda).</li>
            <li><strong>Poslovni unosi:</strong> Imena vaših klijenata, satnice, fiksne tarife, datum posla, zabilježeno vrijeme i kratke bilješke poslova.</li>
          </ul>
        </div>

        {/* 2. Skladištenje i sigurnost podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            Skladištenje i sigurnost (Supabase & RLS)
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Svi vaši podaci se sigurno pohranjuju u licenciranoj cloud bazi podataka <strong>Supabase</strong> (PostgreSQL). Primjenjuje se strogi protokol <em>Row Level Security (RLS)</em> na nivou baze podataka — to garantuje da <strong>niko osim vas, niti bilo koji drugi korisnik sistema, ne može vidjeti, pretraživati ili mijenjati vaše klijente, sate i zaradu</strong>. Lozinke se enkriptuju naprednim kriptografskim algoritmima i ne čuvaju se u čitljivom formatu.
          </p>
        </div>

        {/* 3. Upotreba podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            Upotreba podataka
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Vaši podaci se koriste isključivo za pružanje usluga unutar WorkOra aplikacije (izračun sati, generisanje PDF izvještaja, prikaz u kalendaru). <strong>Nikada ne prodajemo, ne iznajmljujemo niti dijelimo vaše lične ili poslovne podatke sa trećim stranama, marketinškim agencijama ili oglašivačima.</strong>
          </p>
        </div>

        {/* 4. Kolačići i PWA Skladištenje */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
            Kolačići i PWA lokalno skladište
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Aplikacija ne koristi invazivne marketinške kolačiće trećih strana. Koristi se lokalno skladište vašeg preglednika (<code>localStorage</code> i <em>CacheStorage</em>) isključivo radi:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Pamćenja odabrane teme prikaza (Svijetla / Tamna tema).</li>
            <li>Očuvanja vaše sigurne autentifikacijske sesije.</li>
            <li>Omogućavanja rada aplikacije bez internet konekcije (Offline PWA način rada).</li>
          </ul>
        </div>

        {/* 5. Prava korisnika */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
            Prava korisnika (Pravo na brisanje i uvid)
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            U skladu sa modernim standardima o zaštiti privatnosti, imate pravo u svakom trenutku pregledati sve unose, preuzeti ih u PDF formatu, izmijeniti ili zatražiti trajno brisanje svog korisničkog profila i svih unesenih sati i klijenata.
          </p>
        </div>

        {/* 6. Kontakt */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-500" />
            Kontakt za pitanja o privatnosti
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            Za sva pitanja u vezi zaštite privatnosti ili zahtjeve za brisanje podataka možete nas kontaktirati putem zvanične platforme našeg razvojnog tima:
          </p>
          <a
            href="https://orizon-aix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5"
          >
            <span>Orizon-AIX Portal (orizon-aix.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Dugme za zatvaranje */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Prihvatam i zatvori</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
