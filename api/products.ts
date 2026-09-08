import { products } from '../data/products';

// Esta função é o handler da nossa API. No ambiente Node.js da Vercel,
// ela recebe a requisição (req) e um objeto de resposta (res).
export default async (req: any, res: any) => {
  try {
    // Simulando um pequeno atraso de rede para vermos o estado de carregamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Define o cabeçalho para permitir requisições de qualquer origem (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Retorna a lista de produtos como JSON com status 200 (OK)
    res.status(200).json(products);
  } catch (error) {
    // Em caso de erro, retorna um status 500 (Internal Server Error)
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};