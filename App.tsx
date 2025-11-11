
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { Dashboard } from './components/Dashboard';
import type { LecturerRecord, NewLecturerRecord, Status } from './types';
import { DEPARTMENTS, STATUS_OPTIONS } from './constants';

// Initial sample data
const initialRecords: LecturerRecord[] = [
    {
      id: 1,
      nama: "Dr. Muslimin Bin Parman",
      jabatan: "JLKTD",
      status: "Tugas Luar",
      tarikhMula: "2025-11-11",
      tarikhAkhir: "2025-11-13",
      tempat: "IAB Cawangan Utara",
      program: "Bengkel Kepimpinan Digital",
      catatan: "Bersama JPN Kedah",
    },
    {
      id: 2,
      nama: "Puan Noraini Bt Ismail",
      jabatan: "JMIP",
      status: "Cuti Rehat",
      tarikhMula: "2025-11-11",
      tarikhAkhir: "2025-11-12",
      tempat: "",
      program: "",
      catatan: "",
    },
    {
      id: 3,
      nama: "Encik Hafiz Bin Rahman",
      jabatan: "JKRC",
      status: "MC",
      tarikhMula: "2025-11-10",
      tarikhAkhir: "2025-11-12",
      tempat: "",
      program: "",
      catatan: "Demam",
    },
];

const getISODate = (d: Date): string => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const initialFormState: NewLecturerRecord = {
    nama: "",
    jabatan: DEPARTMENTS[3]?.code || "",
    status: "Pejabat",
    tarikhMula: "",
    tarikhAkhir: "",
    tempat: "",
    program: "",
    catatan: "",
};


function App() {
  const [records, setRecords] = useState<LecturerRecord[]>(initialRecords);
  const [form, setForm] = useState<NewLecturerRecord>(initialFormState);

  // Filters state
  const [filterStart, setFilterStart] = useState<string>(getISODate(new Date()));
  const [filterEnd, setFilterEnd] = useState<string>(getISODate(new Date()));
  const [filterDept, setFilterDept] = useState<string>("");
  
  const overlaps = (recordStart: string, recordEnd: string, filterStart: string, filterEnd: string): boolean => {
    const rs = new Date(recordStart).getTime();
    const re = new Date(recordEnd).getTime();
    const fs = new Date(filterStart).getTime();
    const fe = new Date(filterEnd).getTime();
    return rs <= fe && re >= fs;
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (!r.tarikhMula || !r.tarikhAkhir) return false;
      const inDateRange = overlaps(r.tarikhMula, r.tarikhAkhir, filterStart, filterEnd);
      const inDepartment = filterDept ? r.jabatan === filterDept : true;
      return inDateRange && inDepartment;
    });
  }, [records, filterStart, filterEnd, filterDept]);

  const statusCounts = useMemo(() => {
    const map: { [key in Status]: number } = {
      "Pejabat": 0, "MC": 0, "Cuti Rehat": 0, "Cuti Umum": 0, "Tugas Luar": 0
    };
    
    filteredRecords.forEach((r) => {
      if (r.status in map) {
        map[r.status] += 1;
      }
    });

    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [filteredRecords]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nama || !form.tarikhMula || !form.tarikhAkhir) {
      alert("Sila isi Nama, Tarikh Mula dan Tarikh Akhir.");
      return;
    }
    const newId = records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1;
    setRecords((prev) => [...prev, { id: newId, ...form }]);
    setForm(initialFormState);
  };

  const handleResetForm = () => {
    setForm(initialFormState);
  };

  const exportCSV = () => {
    const header = ["Nama", "Jabatan", "Status", "Tarikh Mula", "Tarikh Akhir", "Tempat", "Program", "Catatan"];
    const rows = filteredRecords.map((r) => 
      [r.nama, r.jabatan, r.status, r.tarikhMula, r.tarikhAkhir, r.tempat || "", r.program || "", r.catatan || ""].map(
        (cell) => `"${String(cell).replace(/"/g, '""')}"`
      ).join(",")
    );
    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_keberadaan_${filterStart}_to_${filterEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 print:hidden">
            <ControlPanel
              form={form}
              onFormChange={handleFormChange}
              onAddRecord={handleAddRecord}
              onResetForm={handleResetForm}
              filterStart={filterStart}
              setFilterStart={setFilterStart}
              filterEnd={filterEnd}
              setFilterEnd={setFilterEnd}
              filterDept={filterDept}
              setFilterDept={setFilterDept}
              onExport={exportCSV}
              onPrint={handlePrint}
            />
          </div>
          <div className="lg:col-span-8">
            <Dashboard
              records={filteredRecords}
              counts={statusCounts}
              filterStart={filterStart}
              filterEnd={filterEnd}
            />
          </div>
        </main>
        <footer className="max-w-7xl mx-auto mt-8 text-center text-xs text-slate-500 print:hidden">
          Sistem Keberadaan Pensyarah PKPOP &copy; {new Date().getFullYear()} &mdash; Institut Aminuddin Baki
        </footer>
      </div>
    </div>
  );
}

export default App;
