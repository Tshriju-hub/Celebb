import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios'; // Import axios

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
        password: { label: 'Password', type: 'password', placeholder: 'Enter your password' },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          console.error('Missing email or password'); // Log missing fields
          throw new Error('Both email and password are required');
        }

        try {
          console.log('Credentials received:', credentials); // Log the credentials received  
        const res = await axios.post(`http://localhost:5000/api/auth/login`, credentials, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const user = res.data; // The response data

          if (res.status === 200 && user) {
            return user; // Successfully authenticated
          } else {
            console.error('Login failed: Invalid email or password'); // Log failed login
            throw new Error('Invalid email or password');
          }
        } catch (error) {
          console.error('Login error:', error);

        // Optional: surface custom error message to frontend
        throw new Error(
          error.response?.data?.message || 'Login failed. Please try again.'
        );
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        return true;
      }
      return !!user;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          username: token.username,
          role: token.role,
          image: token.image,
          provider: token.provider,
          token: token.accessToken,
          idToken: token.idToken
        };
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === 'credentials') {
          return {
            ...token,
            id: user.userId,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            username: user.username,
            role: user.role,
            accessToken: user.token,
            provider: 'credentials',
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
          };
        }

        if (account.provider === 'google') {
          try {
            const res = await axios.post('http://localhost:5000/api/auth/google', {
              idToken: account.id_token
            });
            return {
              ...token,
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              accessToken: res.data.token,
              provider: 'google',
              idToken: account.id_token,
              expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
            };
          } catch (error) {
            console.error('Google token exchange failed:', error);
            return {
              ...token,
              error: 'Google authentication failed'
            };
          }
        }
      }

      // Return previous token if not expired
      if (Date.now() < token.expiresAt) {
        return token;
      }

      // Token expired - attempt refresh
      try {
        const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`
          }
        });
        return {
          ...token,
          accessToken: res.data.token,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        };
      } catch (error) {
        console.error('Token refresh failed:', error);
        return {
          ...token,
          error: 'Refresh token failed'
        };
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
});
