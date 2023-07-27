export type GetDaftarPeraturanParams = {
  judul?: string;
  bentuk?: "uu" | "perppu" | "pp" | "perpres" | "pmk";
  nomor?: number;
  tahun?: number;
};

const JDIH_API_URL = "https://jdih.kemenkeu.go.id/api/AppPeraturans";

const MAP_BENTUK: Record<string, number> = {
  uu: 45,
  pp: 44,
  perppu: 32,
  perpres: 31,
  pmk: 20,
};

export async function getDaftarPeraturan({
  judul,
  bentuk,
  nomor,
  tahun,
}: GetDaftarPeraturanParams) {
  const params = new URLSearchParams();
  judul && params.append("search", judul);
  bentuk && params.append("bentuk", MAP_BENTUK[bentuk].toString());
  nomor && params.append("nomor", nomor.toString());
  tahun && params.append("tahun", tahun.toString());
  const response = await fetch(JDIH_API_URL + "?" + params);
  if (response.ok) return response.json();
}
