
export type Status = "Pejabat" | "MC" | "Cuti Rehat" | "Cuti Umum" | "Tugas Luar";

export interface Department {
  code: string;
  name: string;
}

export interface LecturerRecord {
  id: number;
  nama: string;
  jabatan: string;
  status: Status;
  tarikhMula: string;
  tarikhAkhir: string;
  tempat: string;
  program: string;
  catatan: string;
}

export type NewLecturerRecord = Omit<LecturerRecord, "id">;

export interface StatusCount {
    status: string;
    count: number;
}
