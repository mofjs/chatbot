type GetKBParams = {
    question?: string; 
  };
  
  const KB_API_URL = Deno.env.get("INTERNAL_KB_URL") + "/api/query_wa";
  
  export const GET_KB_DEF = {
    name: "get_knowledge",
    description:
      "Answer all user question.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "All string contained a topic asked by user",
        },
      },
    },
  };
  
  export async function getAnswer({ history, question }: any) {
    const payload = {
      history,
      question,
      namespace: 'expo',
    };
   
    const response = await fetch(KB_API_URL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    }); 
  
    if (response.ok) {
      return response.json();
    } else return { result: "Maaf, info yang anda inginkan tidak terdapat di database kami. Silahkan bicara dengan penjaga Booth." };
  }
  