const API_BASE_URL = 'http://localhost:3000/api'; // Substitua pela URL da sua API

// Mock data dos restaurantes cadastrados (temporário até conectar com API)
const MOCK_RESTAURANTS = [
  {
    id: 1,
    nome: "Comida Paizão - Feito com amor",
    info: "Comida caseira",
    local: "PPGCC",
    email: "restaurante@email.com", // Email do usuário cadastrado
    horarioAbertura: "07:00",
    horarioFechamento: "18:00",
    numeroEstrelas: 5,
    isAberto: true,
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
    info: "Culinária contemporânea",
    local: "Centro Acadêmico",
    email: "sabor@email.com",
    horarioAbertura: "08:00",
    horarioFechamento: "20:00",
    numeroEstrelas: 4.5,
    isAberto: true,
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
      }
    ]
  },
  {
    id: 3,
    nome: "Verde & Natural",
    info: "Comida saudável",
    local: "Biblioteca",
    email: "verde@email.com",
    horarioAbertura: "06:00",
    horarioFechamento: "16:00",
    numeroEstrelas: 4.8,
    isAberto: false,
    produtos: [
      {
        id: 11,
        nome: "Bowl Verde",
        descricao: "Bowl com quinoa, abacate, brócolis e molho tahine",
        valor: 19.90,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
      },
      {
        id: 12,
        nome: "Smoothie Detox",
        descricao: "Smoothie de frutas vermelhas com spirulina",
        valor: 14.50,
        restricoes: ['vegan', 'glutenFree', 'lactoseFree']
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
  static async updateRestaurantStatus(id, isAberto) {
    try {
      // Quando conectar com API:
      // const response = await fetch(`${API_BASE_URL}/restaurants/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` // Se necessário
      //   },
      //   body: JSON.stringify({ isAberto })
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const restaurant = MOCK_RESTAURANTS.find(r => r.id === parseInt(id));
          if (restaurant) {
            restaurant.isAberto = isAberto;
            console.log(`RestaurantService: Status do restaurante ${id} atualizado para:`, isAberto);
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