import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: '913227271451-u1mkktijj3i8c4enj0hpldic64qrgsdd.apps.googleusercontent.com',
      clientSecret: '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',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
          const user = res.data;
          if (user.success) {
            return {
              id: user.userId,
              email: credentials.email,
              role: user.role,
              token: user.token
            };
          }
          return null;
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          const response = await axios.post('http://localhost:5000/api/auth/google', {
            email: user.email,
            name: user.name,
            image: user.image
          });
          
          if (response.data.success) {
            user.id = response.data.userId;
            user.role = response.data.role;
            user.token = response.data.token;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.token = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: 'your-secret-key-here', // Replace with a secure secret key
});