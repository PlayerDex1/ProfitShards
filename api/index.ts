import { createServer } from 'http';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { randomUUID } from "crypto";
import { storage } from "../server/storage.js";

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS para Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (!user && profile.emails?.[0]?.value) {
        // Check if user exists by email
        user = await storage.getUserByEmail(profile.emails[0].value);
        if (user) {
          // Link Google account to existing user
          await storage.linkGoogleAccount(user.id, profile.id);
        }
      }
      
      if (!user) {
        // Create new user
        const userData = {
          id: randomUUID(),
          email: profile.emails?.[0]?.value || '',
          username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
          googleId: profile.id,
          emailVerified: true,
          createdAt: Date.now()
        };
        user = await storage.createUser(userData);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Auth routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to home
    res.redirect('/');
  }
);

app.get('/auth/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'logout_failed' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ message: 'authentication_required' });
  }
  next();
}

// API routes
app.post('/runs', requireAuth, async (req, res) => {
  try {
    const { dungeonId, tokensFarmed, tokensAccelerated, timestamp } = req.body || {};
    const userId = (req.user as any).id;
    
    if (!dungeonId || typeof tokensFarmed !== 'number' || typeof tokensAccelerated !== 'number') {
      return res.status(400).json({ message: 'invalid_payload' });
    }
    
    const netTokens = Math.max(0, tokensFarmed - tokensAccelerated);
    const run = {
      id: randomUUID(),
      userId,
      dungeonId,
      tokensFarmed,
      tokensAccelerated,
      netTokens,
      timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
    };
    
    await storage.addRun(run);
    return res.json({ ok: true, run });
  } catch (e: any) {
    return res.status(500).json({ message: 'error', detail: e?.message });
  }
});

app.get('/runs', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const items = await storage.listRunsByUser(userId, 50);
  res.json({ items });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Export for Vercel
export default app;