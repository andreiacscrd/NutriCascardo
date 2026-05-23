export interface Refeicoes {
  cafe_da_manha: string[];
  lanche_manha: string[];
  almoco: string[];
  lanche_tarde: string[];
  jantar: string[];
}

export interface DiaPlano {
  dia: string; // Ex: "Segunda-feira"
  refeicoes: Refeicoes;
}

export interface PlanoSemanalJSON {
  plano_semanal: DiaPlano[];
}

// Representação da tabela planos_alimentares no Supabase
export interface PlanoAlimentarDB {
  id: string; // uuid
  paciente_id: string; // uuid relacionando à tabela pacientes
  conteudo: PlanoSemanalJSON; // JSON contendo o plano semanal estruturado
  created_at: string; // data de criação (timestamp)
}
