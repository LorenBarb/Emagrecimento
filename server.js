// Importação dos módulos necessários
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Inicialização do aplicativo Express
const app = express();
app.use(cors()); // Habilita CORS para permitir comunicação entre frontend e backend
app.use(express.json()); // Permite que o servidor entenda JSON nas requisições

// --- Conexão com o MongoDB ---
// A chave de conexão é pega de uma variável de ambiente para segurança
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado com sucesso.'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Definição dos Modelos de Dados (Schemas) ---
// Schema para os registros diários
const logSchema = new mongoose.Schema({
  date: { type: String, unique: true, required: true },
  // Adicione todos os campos que você tem no formulário
  peso: Number,
  gordura_corporal: Number,
  taxa_muscular: Number,
  busto: Number,
  cintura: Number,
  abdomen: Number,
  quadril: Number,
  coxa_direita: Number,
  coxa_esquerda: Number,
  panturrilha_direita: Number,
  panturrilha_esquerda: Number,
  braco_direito: Number,
  braco_esquerdo: Number,
  gordura_subcutanea: Number,
  gordura_visceral: Number,
  massa_muscular: Number,
  massa_muscular_esqueletica: Number,
  agua_corporal: Number,
  massa_ossea: Number,
  proteina: Number,
  tmb: Number,
  idade_metabolica: Number,
  calorias: Number,
  exercicios: Number
});

const Log = mongoose.model('Log', logSchema);

// Schema para o perfil do usuário
const profileSchema = new mongoose.Schema({
  // Usaremos um ID fixo para garantir que haja apenas um perfil
  profileId: { type: String, default: 'main_profile', unique: true },
  name: String,
  age: Number,
  height: Number,
  gender: String
});

const Profile = mongoose.model('Profile', profileSchema);


// --- API Endpoints ---

// Endpoint para buscar TODOS os dados (logs e perfil)
app.get('/api/data', async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: 'asc' });
    let profile = await Profile.findOne({ profileId: 'main_profile' });

    // Se não existir perfil, cria um padrão
    if (!profile) {
      profile = new Profile({ name: 'Usuário', age: 30, height: 175, gender: 'male' });
      await profile.save();
    }
    
    res.json({ profile, logs });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados.', error });
  }
});

// Endpoint para adicionar/atualizar um registro (log)
app.post('/api/logs', async (req, res) => {
  try {
    const logData = req.body;
    // O 'upsert: true' cria um novo documento se não encontrar um com a mesma data.
    const updatedLog = await Log.findOneAndUpdate({ date: logData.date }, logData, { new: true, upsert: true });
    res.status(201).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar o registro.', error });
  }
});

// Endpoint para deletar um registro
app.delete('/api/logs/:id', async (req, res) => {
    try {
        const log = await Log.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: 'Registro não encontrado.' });
        res.json({ message: 'Registro deletado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar o registro.', error });
    }
});


// Endpoint para atualizar o perfil
app.post('/api/profile', async (req, res) => {
  try {
    const profileData = req.body;
    const updatedProfile = await Profile.findOneAndUpdate({ profileId: 'main_profile' }, profileData, { new: true, upsert: true });
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o perfil.', error });
  }
});


// --- Servir o Frontend ---
// Isso faz com que o backend também sirva o arquivo HTML estático
app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Iniciar o Servidor ---
// A porta é fornecida pela Render através das variáveis de ambiente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
