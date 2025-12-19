import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';
import useFetchData from '@/hooks/use-fetch-data';
import usePostData from '@/hooks/use-post-data';
import usePutData from '@/hooks/use-put-data';
import useDeleteData from '@/hooks/use-delete-data';
import API from '@/config/api/api';

/**
 * CustomHooksDemo Page
 * 
 * Interactive demonstration of all custom hooks:
 * useFetchData, usePostData, usePutData, usePatchData, useDeleteData
 */

interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

export function CustomHooksDemo() {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [editMode, setEditMode] = useState(false);

    // ============================================
    // useFetchData - Fetch posts
    // ============================================
    const { data: posts, isLoading, error, refetch } = useFetchData<Post[]>({
        url: API.demo.posts,
        params: { _limit: 5 }, // Get only 5 posts for demo
    });

    // ============================================
    // usePostData - Create new post
    // ============================================
    const createPost = usePostData<Post, Partial<Post>>({
        url: API.demo.posts,
        refetchQueries: [API.demo.posts],
        isShowSuccessMessage: true,
        onSuccess: (data) => {
            console.log('✅ Post created:', data);
            refetch();
        },
    });

    // ============================================
    // usePutData - Update post
    // ============================================
    const updatePost = usePutData<Post, { id: string; payload: Partial<Post> }>({
        url: API.demo.posts,
        refetchQueries: [API.demo.posts],
        isSuccessShowMessage: true,
        onSuccess: () => {
            setEditMode(false);
            setSelectedPost(null);
            refetch();
        },
    });

    // ============================================
    // useDeleteData - Delete post
    // ============================================
    const deletePost = useDeleteData<void>({
        url: API.demo.posts,
        refetchQueries: [API.demo.posts],
        onSuccess: () => {
            console.log('✅ Post deleted');
            refetch();
        },
    });

    // ============================================
    // Event Handlers
    // ============================================
    const handleCreate = () => {
        const title = prompt('Enter post title:');
        const body = prompt('Enter post body:');

        if (title && body) {
            createPost.mutate({
                title,
                body,
                userId: 1,
            });
        }
    };

    const handleEdit = (post: Post) => {
        setSelectedPost(post);
        setEditMode(true);
    };

    const handleUpdate = () => {
        if (!selectedPost) return;

        const title = prompt('Enter new title:', selectedPost.title);
        const body = prompt('Enter new body:', selectedPost.body);

        if (title && body) {
            updatePost.mutate({
                id: selectedPost.id.toString(),
                payload: {
                    title,
                    body,
                },
            });
        }
    };

    // @ts-ignore
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost.mutate();
        }
    };

    // ============================================
    // Code Examples
    // ============================================
    const useFetchCode = `// 🎣 useFetchData Hook - Fetch data with caching
const { data: posts, isLoading, error } = useFetchData<Post[]>({
  url: '/api/posts',
  params: { _limit: 5 }
});

// Automatic caching, refetching, error handling!`;

    const usePostCode = `// 🎣 usePostData Hook - Create data
const createPost = usePostData<Post, CreatePostDto>({
  url: '/api/posts',
  refetchQueries: ['/api/posts'], // Refetch posts after creation
  isShowSuccessMessage: true,
  onSuccess: (data) => {
    console.log('Created:', data);
  },
});

// Usage
createPost.mutate({ title: 'New Post', body: 'Content' });`;

    const usePutCode = `// 🎣 usePutData Hook - Update data
const updatePost = usePutData<Post, { id: string; payload: UpdatePostDto }>({
  url: '/api/posts',
  refetchQueries: ['/api/posts'],
  isSuccessShowMessage: true,
  onSuccess: (data) => {
    console.log('Updated:', data);
  },
});

// Usage
updatePost.mutate({ 
  id: '123', 
  payload: { title: 'Updated Title' } 
});`;

    const useDeleteCode = `// 🎣 useDeleteData Hook - Delete data
const deletePost = useDeleteData({
  url: '/api/posts/123',
  refetchQueries: ['/api/posts'],
  onSuccess: () => {
    console.log('Deleted successfully');
  },
});

// Usage
deletePost.mutate(); // Delete post`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>🎣 Custom Hooks Demo</h1>
                <p>Interactive CRUD operations with custom hooks</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>Why Custom Hooks?</h2>
                    <p>
                        Custom hooks encapsulate common API patterns, making your code:
                    </p>
                    <div className="benefits-grid">
                        <div className="benefit-item">✅ <strong>DRY</strong> - Don't Repeat Yourself</div>
                        <div className="benefit-item">✅ <strong>Type-Safe</strong> - Full TypeScript support</div>
                        <div className="benefit-item">✅ <strong>Consistent</strong> - Same behavior everywhere</div>
                        <div className="benefit-item">✅ <strong>Testable</strong> - Easy to mock and test</div>
                    </div>
                </section>

                <section className="hooks-overview">
                    <h2>📚 The Custom Hooks</h2>

                    <div className="hook-card">
                        <h3>1️⃣ useFetchData - Fetch Data</h3>
                        <CodeBlock code={useFetchCode} language="typescript" />
                        <p className="hook-description">
                            Fetches data with automatic caching, loading states, and error handling.
                            Perfect for GET requests.
                        </p>
                    </div>

                    <div className="hook-card">
                        <h3>2️⃣ usePostData - Create Data</h3>
                        <CodeBlock code={usePostCode} language="typescript" />
                        <p className="hook-description">
                            Creates new resources with automatic cache invalidation.
                            Perfect for POST requests.
                        </p>
                    </div>

                    <div className="hook-card">
                        <h3>3️⃣ usePutData - Update Data</h3>
                        <CodeBlock code={usePutCode} language="typescript" />
                        <p className="hook-description">
                            Updates resources with optimistic updates and automatic rollback on error.
                            Perfect for PUT/PATCH requests.
                        </p>
                    </div>

                    <div className="hook-card">
                        <h3>4️⃣ useDeleteData - Delete Data</h3>
                        <CodeBlock code={useDeleteCode} language="typescript" />
                        <p className="hook-description">
                            Deletes resources with confirmation dialogs and optimistic removal.
                            Perfect for DELETE requests.
                        </p>
                    </div>
                </section>

                <section className="interactive-demo">
                    <h2>🎮 Try It Out - CRUD Operations</h2>

                    <div className="crud-controls">
                        <button
                            onClick={handleCreate}
                            disabled={createPost.isPending}
                            className="crud-button create"
                        >
                            {createPost.isPending ? '⏳ Creating...' : '➕ Create New Post'}
                        </button>

                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="crud-button refresh"
                        >
                            {isLoading ? '⏳ Refreshing...' : '🔄 Refresh Posts'}
                        </button>
                    </div>

                    {isLoading && <div className="loading">⏳ Loading posts...</div>}
                    {error && <div className="error">❌ Error: {error.message}</div>}

                    {!isLoading && !error && posts && (
                        <div className="posts-grid">
                            {posts.map((post) => (
                                <div key={post.id} className="post-card">
                                    <div className="post-header">
                                        <h4>{post.title}</h4>
                                        <span className="post-id">ID: {post.id}</span>
                                    </div>
                                    <p className="post-body">{post.body}</p>
                                    <div className="post-actions">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            disabled={updatePost.isPending}
                                            className="action-button edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id.toString())}
                                            disabled={deletePost.isPending}
                                            className="action-button delete"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {editMode && selectedPost && (
                        <div className="edit-modal">
                            <div className="modal-content">
                                <h3>✏️ Edit Post</h3>
                                <p>Post ID: {selectedPost.id}</p>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updatePost.isPending}
                                    className="modal-button save"
                                >
                                    {updatePost.isPending ? '⏳ Saving...' : '💾 Save Changes'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setSelectedPost(null);
                                    }}
                                    className="modal-button cancel"
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="flow-diagram">
                    <h2>🔄 How Hooks Connect with Interceptors</h2>
                    <div className="flow-visualization">
                        <div className="flow-layer">
                            <div className="flow-box component">
                                <strong>Component</strong>
                                <p>Calls custom hook</p>
                            </div>
                        </div>
                        <div className="flow-arrow-down">↓</div>
                        <div className="flow-layer">
                            <div className="flow-box hook">
                                <strong>Custom Hook</strong>
                                <p>useFetchData / usePostData / usePutData / useDeleteData</p>
                            </div>
                        </div>
                        <div className="flow-arrow-down">↓</div>
                        <div className="flow-layer">
                            <div className="flow-box query">
                                <strong>TanStack Query</strong>
                                <p>Manages caching & state</p>
                            </div>
                        </div>
                        <div className="flow-arrow-down">↓</div>
                        <div className="flow-layer">
                            <div className="flow-box axios">
                                <strong>Axios Instance</strong>
                                <p>Makes HTTP request</p>
                            </div>
                        </div>
                        <div className="flow-arrow-down">↓</div>
                        <div className="flow-layer">
                            <div className="flow-box interceptor">
                                <strong>Interceptors</strong>
                                <p>Add auth, logging, error handling</p>
                            </div>
                        </div>
                        <div className="flow-arrow-down">↓</div>
                        <div className="flow-layer">
                            <div className="flow-box server">
                                <strong>API Server</strong>
                                <p>Processes request</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="tips">
                    <h2>💡 Best Practices</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <h4>🔑 Query Keys</h4>
                            <p>Use consistent query keys for proper caching</p>
                            <code>queryKey: ['posts', {'{ id }'}]</code>
                        </div>
                        <div className="tip-card">
                            <h4>🔄 Invalidation</h4>
                            <p>Invalidate queries after mutations to refetch fresh data</p>
                            <code>refetchQueries: ['posts']</code>
                        </div>
                        <div className="tip-card">
                            <h4>⚡ Optimistic Updates</h4>
                            <p>Update UI immediately for better UX</p>
                            <code>onMutate: async (newData) {'=>'} {'{...}'}</code>
                        </div>
                        <div className="tip-card">
                            <h4>🎯 Type Safety</h4>
                            <p>Use TypeScript generics for type inference</p>
                            <code>useFetchData{'<User[]>'}({'{ url: "/users" }'})</code>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
