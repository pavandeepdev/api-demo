/**
 * API Endpoints Configuration
 * 
 * Centralized place to manage all API endpoints.
 * Using JSONPlaceholder for demo purposes.
 */

const API = {
    AUTH: {
        LOGIN: '/auth/login',
    },

    // Demo endpoints using JSONPlaceholder
    DEMO: {
        USERS: '/users',
        USER_BY_ID: (id: number) => `/users/${id}`,
        POSTS: '/posts',
        POST_BY_ID: (id: number) => `/posts/${id}`,
        TODOS: '/todos',
        TODO_BY_ID: (id: number) => `/todos/${id}`,
        COMMENTS: '/comments',
    }
}

export default Object.freeze(API);