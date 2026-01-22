import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
dotenv.config();

const admins = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim());
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3001/auth/discord/callback';
console.log('DEBUG: Raw process.env.CALLBACK_URL:', process.env.CALLBACK_URL);
console.log('DEBUG: Final CALLBACK_URL used:', CALLBACK_URL);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify']
},
    (accessToken, refreshToken, profile, done) => {
        // Check if user is admin
        const isAdmin = admins.includes(profile.id);
        const user = {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            isAdmin: isAdmin
        };
        return done(null, user);
    }
));

export default passport;
