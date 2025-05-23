
// Conectores PJ (Pessoa Jurídica) do Brasil disponíveis na Pluggy
export const PRODUCTION_PJ_PROVIDERS = [
  // Bancos principais
  { id: "1", name: "Itaú Unibanco", logo: "I", popular: true },
  { id: "2", name: "Banco do Brasil", logo: "BB", popular: true },
  { id: "3", name: "Bradesco", logo: "B", popular: true },
  { id: "4", name: "Santander", logo: "S", popular: true },
  { id: "5", name: "Caixa Econômica Federal", logo: "C", popular: true },
  
  // Bancos digitais
  { id: "201", name: "Nubank PJ", logo: "N", popular: true },
  { id: "280", name: "Inter Empresarial", logo: "IN", popular: false },
  { id: "290", name: "PagBank PJ", logo: "P", popular: false },
  { id: "300", name: "C6 Bank PJ", logo: "C6", popular: false },
  { id: "310", name: "Neon PJ", logo: "NE", popular: false },
  
  // Bancos regionais e cooperativas
  { id: "41", name: "Banrisul", logo: "BR", popular: false },
  { id: "104", name: "Caixa Econômica Federal", logo: "CEF", popular: false },
  { id: "237", name: "Bradesco PJ", logo: "BR", popular: false },
  { id: "341", name: "Itaú PJ", logo: "IT", popular: false },
  { id: "033", name: "Santander PJ", logo: "SA", popular: false },
  
  // Fintechs e bancos de investimento
  { id: "320", name: "BTG Pactual", logo: "BTG", popular: false },
  { id: "330", name: "Modal Mais", logo: "MM", popular: false },
  { id: "340", name: "Safra", logo: "SF", popular: false },
  { id: "350", name: "Banco Original", logo: "OR", popular: false },
  { id: "360", name: "Pine", logo: "PI", popular: false },
  
  // Bancos cooperativos
  { id: "756", name: "Sicoob", logo: "SC", popular: false },
  { id: "748", name: "Sicredi", logo: "SI", popular: false },
  { id: "085", name: "Cecred", logo: "CC", popular: false },
  
  // Outros bancos PJ
  { id: "370", name: "BV", logo: "BV", popular: false },
  { id: "380", name: "Banco Pan", logo: "PA", popular: false },
  { id: "390", name: "BMG", logo: "BM", popular: false },
  { id: "400", name: "Banco Votorantim", logo: "VO", popular: false },
  { id: "410", name: "Capital One", logo: "CO", popular: false },
  { id: "420", name: "Banco Daycoval", logo: "DA", popular: false },
  { id: "430", name: "Banco Fibra", logo: "FI", popular: false },
  { id: "440", name: "Banco Industrial", logo: "BI", popular: false },
  { id: "450", name: "Banco Pine", logo: "PN", popular: false },
  { id: "460", name: "Banco Rendimento", logo: "RE", popular: false },
  { id: "470", name: "Banco Triangulo", logo: "TR", popular: false },
  { id: "480", name: "Banco Topázio", logo: "TO", popular: false }
];

// Remove sandbox providers - só produção
export const SANDBOX_PROVIDERS: never[] = [];
export const REAL_PROVIDERS = PRODUCTION_PJ_PROVIDERS;
