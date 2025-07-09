const API_BASE_URL = 'http://localhost:3000/api'; // Substitua pela URL da sua API

// Mock data dos restaurantes cadastrados (temporário até conectar com API)
const MOCK_RESTAURANTS = [
  {
    id: 1,
    nome: "Comida Paixão - Feito com amor",
    telefone: "(85) 99999-1234",
    tipo_restaurante: "Comida Caseira",
    localizacao: "PPGCC",
    avaliacao: 5.0,
    info: "Restaurante especializado em comida caseira, feita com muito amor e carinho. Oferecemos pratos tradicionais com ingredientes frescos e selecionados.",
    email: "restaurante@email.com", // Email do usuário cadastrado
    horario_abertura: "07:00",
    horario_fechamento: "18:00",
    disponivel: true,
    saldo: 1250.75,
    produtos: [
      {
        id: 1,
        nome: "X-Burger Especial",
        descricao: "Hambúrguer artesanal com carne 180g, queijo cheddar, bacon, alface, tomate e molho especial da casa",
        valor: 28.90,
        restricoes: []
      },
      {
        id: 2,
        nome: "Pizza Margherita Vegana",
        descricao: "Pizza tradicional com molho de tomate, queijo vegano, manjericão fresco e azeite extravirgem",
        valor: 32.50,
        restricoes: ['vegan', 'lactoseFree']
      },
      {
        id: 3,
        nome: "Salada Caesar Sem Glúten",
        descricao: "Mix de folhas verdes, croutons sem glúten, parmesão, molho caesar e peito de frango grelhado",
        valor: 24.00,
        restricoes: ['glutenFree']
      },
      {
        id: 4,
        nome: "Açaí Bowl Completo",
        descricao: "Açaí puro batido com banana, granola caseira, frutas da estação, mel e castanhas",
        valor: 18.50,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
      },
      {
        id: 5,
        nome: "Wrap de Frango Grelhado",
        descricao: "Tortilha integral com frango desfiado, queijo, alface, tomate, cenoura e molho iogurte",
        valor: 22.90,
        restricoes: []
      },
      {
        id: 6,
        nome: "Brownie Vegano",
        descricao: "Brownie de chocolate amargo sem ingredientes de origem animal, servido com sorvete vegano",
        valor: 15.00,
        restricoes: ['vegan', 'lactoseFree']
      },
      {
        id: 7,
        nome: "Suco Natural Detox",
        descricao: "Blend de couve, maçã verde, limão, gengibre e água de coco natural",
        valor: 12.00,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree', 'peanutFree']
      },
      {
        id: 8,
        nome: "Lasanha Sem Lactose",
        descricao: "Lasanha de berinjela com molho bolonhesa, queijo sem lactose e manjericão",
        valor: 26.50,
        restricoes: ['lactoseFree']
      }
    ]
  },
  {
    id: 2,
    nome: "Sabor & Arte",
    telefone: "(85) 98888-5678",
    tipo_restaurante: "Culinária Contemporânea",
    localizacao: "Centro Acadêmico",
    avaliacao: 4.5,
    info: "Restaurante moderno com foco em culinária contemporânea. Combinamos técnicas tradicionais com toques inovadores para criar experiências gastronômicas únicas.",
    email: "sabor@email.com",
    horario_abertura: "08:00",
    horario_fechamento: "20:00",
    disponivel: true,
    saldo: 890.30,
    produtos: [
      {
        id: 9,
        nome: "Risoto de Camarão",
        descricao: "Risoto cremoso com camarões frescos e ervas finas",
        valor: 35.90,
        restricoes: ['glutenFree']
      },
      {
        id: 10,
        nome: "Salmão Grelhado",
        descricao: "Salmão grelhado com legumes e molho de mostarda",
        valor: 42.00,
        restricoes: ['glutenFree']
      },
      {
        id: 11,
        nome: "Pasta Carbonara Premium",
        descricao: "Massa fresca com molho carbonara artesanal, bacon defumado e parmesão",
        valor: 28.00,
        restricoes: []
      }
    ]
  },
  {
    id: 3,
    nome: "Verde & Natural",
    telefone: "(85) 97777-9012",
    tipo_restaurante: "Comida Saudável",
    localizacao: "Biblioteca Central",
    avaliacao: 4.8,
    info: "Especializado em alimentação saudável e sustentável. Oferecemos opções veganas, vegetarianas e funcionais para quem busca bem-estar e sabor.",
    email: "verde@email.com",
    horario_abertura: "06:00",
    horario_fechamento: "16:00",
    disponivel: false,
    saldo: 567.20,
    produtos: [
      {
        id: 12,
        nome: "Bowl Verde",
        descricao: "Bowl com quinoa, abacate, brócolis e molho tahine",
        valor: 19.90,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
      },
      {
        id: 13,
        nome: "Smoothie Detox",
        descricao: "Smoothie de frutas vermelhas com spirulina",
        valor: 14.50,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
      },
      {
        id: 14,
        nome: "Salada Buddha Bowl",
        descricao: "Mix de vegetais coloridos, grãos, sementes e molho de tahine",
        valor: 22.90,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
      }
    ]
  },
  {
    id: 4,
    nome: "Pizzaria Bella Napoli",
    telefone: "(85) 96666-3456",
    tipo_restaurante: "Pizzaria",
    localizacao: "Praça de Alimentação",
    avaliacao: 4.3,
    info: "Pizzaria tradicional italiana com receitas familiares passadas de geração em geração. Massa artesanal e ingredientes importados da Itália.",
    email: "bella@email.com",
    horario_abertura: "11:00",
    horario_fechamento: "23:00",
    disponivel: true,
    saldo: 2150.40,
    produtos: [
      {
        id: 15,
        nome: "Pizza Margherita",
        descricao: "Pizza clássica com molho de tomate, mozzarella e manjericão fresco",
        valor: 35.00,
        restricoes: []
      },
      {
        id: 16,
        nome: "Pizza Quattro Stagioni",
        descricao: "Pizza dividida em quatro sabores: cogumelos, presunto, alcachofra e azeitonas",
        valor: 42.00,
        restricoes: []
      },
      {
        id: 17,
        nome: "Calzone Tradicional",
        descricao: "Calzone recheado com ricota, mozzarella e molho de tomate",
        valor: 28.50,
        restricoes: []
      }
    ]
  },
  {
    id: 5,
    nome: "Burguer Station",
    telefone: "(85) 95555-7890",
    tipo_restaurante: "Hamburgueria",
    localizacao: "Cantina Universitária",
    avaliacao: 4.6,
    info: "Hamburgueria gourmet com carnes premium e pães artesanais. Oferecemos opções para todos os gostos, incluindo veganas e vegetarianas.",
    email: "burger@email.com",
    horario_abertura: "10:00",
    horario_fechamento: "22:00",
    disponivel: true,
    saldo: 1876.90,
    produtos: [
      {
        id: 18,
        nome: "Classic Burger",
        descricao: "Hambúrguer clássico com carne 150g, queijo, alface, tomate e molho especial",
        valor: 25.90,
        restricoes: []
      },
      {
        id: 19,
        nome: "Veggie Burger",
        descricao: "Hambúrguer vegano com proteína de soja, queijo vegano e vegetais frescos",
        valor: 23.90,
        restricoes: ['vegan', 'lactoseFree']
      },
      {
        id: 20,
        nome: "Double Bacon",
        descricao: "Dois hambúrgueres, bacon crocante, queijo cheddar e molho barbecue",
        valor: 32.90,
        restricoes: []
      }
    ]
  }
];

class RestaurantService {
  // Buscar todos os restaurantes
  static async getAllRestaurants() {
    try {
      // Quando conectar com API, substitua por:
      // const response = await fetch(`${API_BASE_URL}/restaurants`);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      // Por enquanto, retorna dados mock com delay simulado
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('RestaurantService: Carregando todos os restaurantes');
          resolve(MOCK_RESTAURANTS);
        }, 500);
      });
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      return [];
    }
  }

  // Buscar restaurante por ID
  static async getRestaurantById(id) {
    try {
      // Quando conectar com API:
      // const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(id));
          console.log(`RestaurantService: Buscando restaurante ID ${id}:`, restaurant);
          resolve(restaurant || null);
        }, 300);
      });
    } catch (error) {
      console.error('Erro ao buscar restaurante por ID:', error);
      return null;
    }
  }

  // Buscar restaurantes por usuário (para o painel do restaurante)
  static async getRestaurantsByUser(userEmail) {
    try {
      // Quando conectar com API:
      // const response = await fetch(`${API_BASE_URL}/restaurants/user/${encodeURIComponent(userEmail)}`);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const userRestaurants = MOCK_RESTAURANTS.filter(r => r.email === userEmail);
          console.log(`RestaurantService: Buscando restaurantes do usuário ${userEmail}:`, userRestaurants);
          resolve(userRestaurants);
        }, 300);
      });
    } catch (error) {
      console.error('Erro ao buscar restaurantes do usuário:', error);
      return [];
    }
  }

  // Atualizar status do restaurante (aberto/fechado)
  static async updateRestaurantStatus(id, disponivel) {
    try {
      // Quando conectar com API:
      // const response = await fetch(`${API_BASE_URL}/restaurants/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` // Se necessário
      //   },
      //   body: JSON.stringify({ disponivel })
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(id));
          if (restaurant) {
            restaurant.disponivel = disponivel;
            console.log(`RestaurantService: Status do restaurante ${id} atualizado para:`, disponivel);
          }
          resolve(restaurant);
        }, 300);
      });
    } catch (error) {
      console.error('Erro ao atualizar status do restaurante:', error);
      return null;
    }
  }

  // Atualizar informações do restaurante
  static async updateRestaurant(id, restaurantData) {
    try {
      // Quando conectar com API:
      // const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` // Se necessário
      //   },
      //   body: JSON.stringify(restaurantData)
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurantIndex = MOCK_RESTAURANTS.findIndex(r => r.id === parseInt(id));
          if (restaurantIndex !== -1) {
            MOCK_RESTAURANTS[restaurantIndex] = { ...MOCK_RESTAURANTS[restaurantIndex], ...restaurantData };
            console.log(`RestaurantService: Restaurante ${id} atualizado:`, MOCK_RESTAURANTS[restaurantIndex]);
            resolve(MOCK_RESTAURANTS[restaurantIndex]);
          } else {
            resolve(null);
          }
        }, 500);
      });
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      return null;
    }
  }

  // Adicionar produto ao restaurante
  static async addProduct(restaurantId, productData) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(restaurantId));
          if (restaurant) {
            const newProduct = {
              ...productData,
              id: Date.now() // ID temporário
            };
            restaurant.produtos.push(newProduct);
            console.log(`RestaurantService: Produto adicionado ao restaurante ${restaurantId}:`, newProduct);
            resolve(newProduct);
          } else {
            resolve(null);
          }
        }, 400);
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return null;
    }
  }

  // Atualizar produto
  static async updateProduct(restaurantId, productId, productData) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(restaurantId));
          if (restaurant) {
            const productIndex = restaurant.produtos.findIndex(p => p.id === parseInt(productId));
            if (productIndex !== -1) {
              restaurant.produtos[productIndex] = { ...restaurant.produtos[productIndex], ...productData };
              console.log(`RestaurantService: Produto ${productId} atualizado:`, restaurant.produtos[productIndex]);
              resolve(restaurant.produtos[productIndex]);
            }
          }
          resolve(null);
        }, 400);
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }
  }

  // Remover produto
  static async deleteProduct(restaurantId, productId) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(restaurantId));
          if (restaurant) {
            const productIndex = restaurant.produtos.findIndex(p => p.id === parseInt(productId));
            if (productIndex !== -1) {
              restaurant.produtos.splice(productIndex, 1);
              console.log(`RestaurantService: Produto ${productId} removido do restaurante ${restaurantId}`);
              resolve(true);
            }
          }
          resolve(false);
        }, 300);
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      return false;
    }
  }

  // Buscar produtos de um restaurante
  static async getProductsByRestaurant(restaurantId) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(restaurantId));
          const products = restaurant ? restaurant.produtos : [];
          console.log(`RestaurantService: Produtos do restaurante ${restaurantId}:`, products);
          resolve(products);
        }, 200);
      });
    } catch (error) {
      console.error('Erro ao buscar produtos do restaurante:', error);
      return [];
    }
  }
}

export default RestaurantService;