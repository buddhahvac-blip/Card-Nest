// Migration compatibility: all identities now come from verified Neon Auth sessions.
export {currentUser as getChatGPTUser} from '@/lib/auth/server';
