import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PassengerManifestEntry } from "@/actions/reports";

export function generatePassengerManifestPDF(
  entry: PassengerManifestEntry,
  operatorName: string = "",
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  const BLUE: [number, number, number] = [26, 35, 126];
  const LIGHT_BLUE: [number, number, number] = [197, 202, 233];
  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [20, 20, 20];

  // ─── HEADER: Logo box ────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(margin, 10, 48, 22, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Travel Agency", margin + 24, 17, { align: "center" });
  doc.setFontSize(15);
  doc.text(operatorName || "IDOTOURS", margin + 24, 25, { align: "center" });

  // company meta
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLUE);
  doc.text("Info & Rezervime: Tel./Fax.: +389 44 337 291", margin, 37);
  doc.text("E-mail: info@idotours.com.mk", margin, 41);
  doc.text("www.idotours.com.mk", margin, 45);

  // ─── HEADER: 5 info lines (right side) ───────────────────────────
  const rightX = margin + 55;
  const lineH = 7;

  const infoLines = [
    { label: "Data / Datum:", value: entry.departure_date ?? "" },
    { label: "Tipi i mjetit / Tip na vozilo:", value: "" },
    { label: "Targa / Registracija:", value: "" },
    {
      label: "Emri dhe mbiemri i shoferit 1 / Ime i prezime na shoferot 1:",
      value: "",
    },
    {
      label: "Emri dhe mbiemri i shoferit 2 / Ime i prezime na shoferot 2:",
      value: "",
    },
  ];

  doc.setFontSize(7);

  infoLines.forEach((line, i) => {
    const y = 14 + i * lineH;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLUE);
    doc.text(line.label, rightX, y);

    // underline
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.3);
    const labelEnd = rightX + doc.getTextWidth(line.label) + 2;
    doc.line(labelEnd, y + 0.5, pageW - margin, y + 0.5);

    if (line.value) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BLACK);
      doc.text(line.value, labelEnd + 1, y);
    }
  });

  // ─── TITLE BAND ──────────────────────────────────────────────────
  const bandY = 52;
  doc.setFillColor(...BLUE);
  doc.rect(margin, bandY, contentW, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("LISTA E PASAGJERREVE/LISTA NA PATNICI", pageW / 2, bandY + 5.5, {
    align: "center",
  });

  // ─── ROUTE SUBTITLE BAND ─────────────────────────────────────────
  // Sanitize route string: replace arrow characters with plain "->"
  const safeRoute = (entry.route ?? "")
    .replace(/\u2192/g, "->")
    .replace(/→/g, "->")
    .replace(/[^\x00-\x7F]/g, (c) => {
      // transliterate common special chars
      const map: Record<string, string> = {
        ë: "e",
        Ë: "E",
        ç: "c",
        Ç: "C",
        ä: "a",
        ö: "o",
        ü: "u",
      };
      return map[c] ?? "?";
    });

  const subtitleParts = [
    safeRoute,
    entry.route_code ?? "",
    entry.departure_time ?? "",
    entry.starting_station ?? "",
  ]
    .filter(Boolean)
    .join("   |   ");

  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, bandY + 8, contentW, 7, "F");
  doc.setTextColor(...BLUE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(subtitleParts, pageW / 2, bandY + 13, { align: "center" });

  // ─── PASSENGER TABLE ─────────────────────────────────────────────
  const tableStartY = bandY + 17;

  const rows = entry.passengers.map((p: any, idx: number) => [
    String(idx + 1),
    p.full_name ?? "",
    "", // Nr. i pasportes — not collected
    "", // Shtetesia — not collected
    p.birthdate ?? p.age ?? "",
    "", // Data e leshimit — not collected
  ]);

  // Pad to 25 rows minimum (like the physical form)
  while (rows.length < 25) {
    rows.push([String(rows.length + 1), "", "", "", "", ""]);
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [
      [
        "Nr./Br.",
        "Emri dhe mbiemri/Ime i prezime",
        "Nr. i pasportes/Br. na pasosh",
        "Shtetesia/Drzavjanstvo",
        "Datelindja/Den na raganje",
        "Data e leshimit/Den na izdavanje",
      ],
    ],
    body: rows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      lineColor: BLUE,
      lineWidth: 0.3,
      textColor: BLACK,
      font: "helvetica",
    },
    headStyles: {
      fillColor: BLUE,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 6.5,
      halign: "center",
      cellPadding: 2.5,
    },
    alternateRowStyles: { fillColor: [245, 246, 253] },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 52 },
      2: { halign: "center", cellWidth: 32 },
      3: { halign: "center", cellWidth: 28 },
      4: { halign: "center", cellWidth: 26 },
      5: { halign: "center" },
    },
  });

  // ─── FOOTER ──────────────────────────────────────────────────────
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? tableStartY + 10;
  doc.setFontSize(6.5);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Gjeneruar automatikisht - ${new Date().toLocaleString("en-GB")}`,
    pageW / 2,
    finalY + 7,
    { align: "center" },
  );

  const filename = `manifest-${entry.route_code}-${entry.departure_date}.pdf`;
  doc.save(filename);
}
