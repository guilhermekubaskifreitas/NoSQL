const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');

// 1. Configuração da conexão com o Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const alunosRef = db.collection('alunos');

// Configuração do leitor de terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const perguntar = (texto) => new Promise((resolve) => rl.question(texto, resolve));

// --- OPERAÇÕES CRUD E CONSULTAS ---

// CREATE: Cadastrar aluno
async function cadastrarAluno() {
  console.log('\n--- CADASTRAR ALUNO ---');
  const nome = await perguntar('Nome completo: ');
  const turma = await perguntar('Turma (ex: 3A): ');
  const dataNascimento = await perguntar('Data de nascimento (DD/MM/AAAA): ');

  const docRef = await alunosRef.add({
    nome,
    turma,
    dataNascimento
  });

  console.log(`Aluno cadastrado com sucesso! ID: ${docRef.id}`);
}

// READ: Listar todos os alunos
async function listarAlunos() {
  console.log('\n--- LISTA DE ALUNOS ---');
  const snapshot = await alunosRef.get();

  if (snapshot.empty) {
    console.log('Nenhum aluno encontrado.');
    return;
  }

  snapshot.forEach((doc) => {
    const dados = doc.data();
    console.log(`ID: ${doc.id} | Nome: ${dados.nome} | Turma: ${dados.turma} | Nascimento: ${dados.dataNascimento}`);
  });
}

// UPDATE: Atualizar aluno
async function atualizarAluno() {
  console.log('\n--- ATUALIZAR ALUNO ---');
  const id = await perguntar('Digite o ID do aluno que deseja atualizar: ');
  const doc = await alunosRef.doc(id).get();

  if (!doc.exists) {
    console.log('Aluno não encontrado com esse ID.');
    return;
  }

  const nome = await perguntar('Novo nome (deixe vazio para manter): ');
  const turma = await perguntar('Nova turma (deixe vazio para manter): ');
  const dataNascimento = await perguntar('Nova data de nascimento (deixe vazio para manter): ');

  const atualizacoes = {};
  if (nome) atualizacoes.nome = nome;
  if (turma) atualizacoes.turma = turma;
  if (dataNascimento) atualizacoes.dataNascimento = dataNascimento;

  await alunosRef.doc(id).update(atualizacoes);
  console.log('Aluno atualizado com sucesso!');
}

// DELETE: Excluir aluno
async function excluirAluno() {
  console.log('\n--- EXCLUIR ALUNO ---');
  const id = await perguntar('Digite o ID do aluno que deseja excluir: ');
  await alunosRef.doc(id).delete();
  console.log('Aluno excluído (se o ID existia).');
}

// CONSULTA 1: Buscar por Turma
async function buscarPorTurma() {
  console.log('\n--- BUSCAR POR TURMA ---');
  const turma = await perguntar('Digite a turma para busca (ex: 3A): ');
  const snapshot = await alunosRef.where('turma', '==', turma).get();

  if (snapshot.empty) {
    console.log(`Nenhum aluno encontrado na turma ${turma}.`);
    return;
  }

  snapshot.forEach((doc) => {
    const dados = doc.data();
    console.log(`ID: ${doc.id} | Nome: ${dados.nome} | Nascimento: ${dados.dataNascimento}`);
  });
}

// CONSULTA 2: Buscar por Data de Nascimento
async function buscarPorDataNascimento() {
  console.log('\n--- BUSCAR POR DATA DE NASCIMENTO ---');
  const data = await perguntar('Digite a data de nascimento (DD/MM/AAAA): ');
  const snapshot = await alunosRef.where('dataNascimento', '==', data).get();

  if (snapshot.empty) {
    console.log(`Nenhum aluno encontrado com nascimento em ${data}.`);
    return;
  }

  snapshot.forEach((doc) => {
    const dados = doc.data();
    console.log(`ID: ${doc.id} | Nome: ${dados.nome} | Turma: ${dados.turma}`);
  });
}

// --- MENU PRINCIPAL ---
async function menu() {
  let opcao = '';

  while (opcao !== '0') {
    console.log('\n==============================');
    console.log('   SISTEMA ESCOLAR FIREBASE   ');
    console.log('==============================');
    console.log('1 - Cadastrar aluno (CREATE)');
    console.log('2 - Listar alunos (READ)');
    console.log('3 - Atualizar aluno (UPDATE)');
    console.log('4 - Excluir aluno (DELETE)');
    console.log('5 - Consultar por turma');
    console.log('6 - Consultar por data de nascimento');
    console.log('0 - Sair');

    opcao = await perguntar('\nEscolha uma opção: ');

    try {
      switch (opcao) {
        case '1': await cadastrarAluno(); break;
        case '2': await listarAlunos(); break;
        case '3': await atualizarAluno(); break;
        case '4': await excluirAluno(); break;
        case '5': await buscarPorTurma(); break;
        case '6': await buscarPorDataNascimento(); break;
        case '0': console.log('Encerrando o sistema...'); break;
        default: console.log('Opção inválida!');
      }
    } catch (erro) {
      console.error('Erro na operação:', erro.message);
    }
  }

  rl.close();
  process.exit(0);
}

menu();
