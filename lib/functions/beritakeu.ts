  
  const KEMENKEU_URL = "https://media.kemenkeu.go.id/SinglePage/Pagination?p=/Pages/Informasi-Publik/Publikasi/Berita-Utama&page=1";
  const SETJEN_URL = "https://setjen.kemenkeu.go.id/api/Posts?";
  
  type GetBeritaSetjenParam = {
    limit?: number
  }

  type GetBeritaKemenkeuParam = {
    limit?: number
  }

  export const GET_BERITA_KEMENKEU_DEF = {
    name: "get_berita_kemenkeu",
    description:
      "Get the latest news from Kementerian Keuangan or Kemenkeu.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description:
              "The number of berita (news) requested by user with maximum 7",
          },
        },
      },
  };
  
  export async function getBeritaKemenkeu({limit}: GetBeritaKemenkeuParam) {
    const response = await fetch(KEMENKEU_URL);
    if (response.ok) {
      const response2 = await response.json();
      return response2["Data"]["Content"].map((item: any)=> {
        return {
          Title: item?.Title,
          PublishedDate: item?.DocumentPublishFrom,
          URL: "https://www.kemenkeu.go.id/informasi-publik/publikasi/berita-utama/" + item?.SlugUrl,
        }
      }).slice(0, limit)
    }
  }

  export const GET_BERITA_SETJEN_DEF = {
    name: "get_berita_setjen",
    description:
      "Get latest news from the website of Sekretariat Jenderal (Website) Kementerian Keuangan (Kemenkeu).",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "The number of berita (news) requested by user",
        },
      },
    },
  };
  
  
  export async function getBeritaSetjen({limit}: GetBeritaSetjenParam ) {
    const params = new URLSearchParams();
    params.append("PageId", "5");
    params.append("offset", "0");
    limit && params.append("limit", String(limit));
    const response = await fetch(SETJEN_URL + params);
    if (response.ok) {
      const response2 = await response.json();
      return response2["Data"].map((item: any)=> {
        return {
          Title: item?.Title,
          PublishedDate: item?.PublishedDate,
          URL: "https://setjen.kemenkeu.go.id/in/post/" + item?.UrlPath,
        }
      })
    }
  }