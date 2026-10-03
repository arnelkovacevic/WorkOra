import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkLog, formatMinutesToHours, formatCurrency, formatWorkDate, BOSNIAN_MONTHS } from './supabaseService';

export interface ReportSummaryOptions {
  userDisplayName: string;
  userEmail: string;
  year: number;
  month: number;
  workLogs: WorkLog[];
}

export function generateMonthlyReportPDF({
  userDisplayName,
  userEmail,
  year,
  month,
  workLogs,
}: ReportSummaryOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = BOSNIAN_MONTHS.find((m) => m.value === month)?.name || `${month}.`;

  // Ukupne sume
  const totalMinutes = workLogs.reduce((acc, l) => acc + (Number(l.total_minutes) || 0), 0);
  const totalEarned = workLogs.reduce((acc, l) => acc + (Number(l.earned_amount) || 0), 0);

  // 1. ZAGLAVLJE DOKUMENTA (Header)
  // Pozadinska traka za brending
  doc.setFillColor(79, 70, 229); // Indigo #4F46E5
  doc.rect(0, 0, 210, 24, 'F');

  // Tekst u zaglavlju
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('WorkOra  |  Sistem za Pracenje Radnih Sati', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Zvanicni izvjestaj o radu', 196, 15, { align: 'right' });

  // 2. NASLOV IZVJEŠTAJA I PODACI O KORISNIKU
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('WorkOra — Mjesecni Izvještaj', 14, 38);

  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(`Period: ${monthName} ${year}. godine`, 14, 45);

  // Podaci o korisniku
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Korisnik: ${userDisplayName || 'Korisnik'} (${userEmail})`, 14, 52);

  // 3. SUMMARY BOX (Ukupna statistika u pravougaoniku)
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, 58, 182, 22, 3, 3, 'FD');

  // Kolona 1: Ukupno unosa
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Ukupno radnih unosa', 24, 65);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${workLogs.length}`, 24, 74);

  // Kolona 2: Ukupno sati
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Ukupno odradjeno sati', 85, 65);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(79, 70, 229);
  doc.text(formatMinutesToHours(totalMinutes), 85, 74);

  // Kolona 3: Ukupan iznos za isplatu
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Ukupan iznos za isplatu', 145, 65);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text(formatCurrency(totalEarned), 145, 74);

  // 4. TABELA STAVKI (autoTable)
  const tableRows = workLogs.map((log, index) => {
    const clientName = log.temp_client_name || log.clients?.name || 'Povremeni klijent';
    const rateText = log.type_works || (
      log.clients?.rate_type === 'hourly'
        ? `${formatCurrency(log.clients.rate_amount)} / h`
        : `${formatCurrency(log.clients?.rate_amount || 0)} / dan`
    );

    const noteText = log.note ? `\nOpis: ${log.note}` : '';

    return [
      String(index + 1),
      formatWorkDate(log.work_date),
      clientName + noteText,
      `${log.time_from} - ${log.time_to}`,
      formatMinutesToHours(log.total_minutes),
      rateText,
      formatCurrency(log.earned_amount),
    ];
  });

  // Dodavanje sumarnog reda na dnu tabele
  const tableFooter = [
    [
      '',
      'UKUPNO',
      `${workLogs.length} unosa posla`,
      '',
      formatMinutesToHours(totalMinutes),
      '',
      formatCurrency(totalEarned),
    ],
  ];

  autoTable(doc, {
    startY: 86,
    head: [['#', 'Datum', 'Klijent & Bilješka', 'Vrijeme', 'Trajanje', 'Tarifa', 'Zarada']],
    body: tableRows,
    foot: tableFooter,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 54 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Podnožje svake stranice
      const pageCount = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      const generatedText = `Dokument generisan: ${new Date().toLocaleDateString('bs-BA')} u ${new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}`;
      doc.text(generatedText, 14, 290);
      doc.text(`Stranica ${data.pageNumber} od ${pageCount}`, 196, 290, { align: 'right' });
    },
  });

  return doc;
}
