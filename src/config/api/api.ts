const API = {
  // Authentication endpoints
  auth: {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    refreshToken: 'auth/refresh-token',
  },

  // Order endpoints
  order: {
    list: 'order/list',
    getById: (id: string) => `order/${id}`,
    create: 'order/create',
    update: (id: string) => `order/${id}`,
    delete: (id: string) => `order/${id}`,
  },

  // Demo endpoints (for educational purposes)
  demo: {
    users: 'https://jsonplaceholder.typicode.com/users',
    posts: 'https://jsonplaceholder.typicode.com/posts',
    postById: (id: number) => `https://jsonplaceholder.typicode.com/posts/${id}`,
  },
};

Object.freeze(API);
export default API;