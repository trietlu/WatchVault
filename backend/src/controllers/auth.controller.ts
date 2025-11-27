import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.passwordHash) {
            return res.status(401).json({ error: 'Please login with Google or Facebook' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        // Verify Google token and get user info
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        const data = await response.json();
        const { sub: googleId, email } = data;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                }
            });
        } else if (!user.googleId) {
            // Link Google account to existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId }
            });
        }

        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token: jwtToken, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const facebookLogin = async (req: Request, res: Response) => {
    try {
        const { token, userID } = req.body;

        // Verify Facebook token
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);

        if (!response.ok) {
            return res.status(401).json({ error: 'Invalid Facebook token' });
        }

        const data = await response.json();
        const { id: facebookId, email } = data;

        if (!email) {
            return res.status(400).json({ error: 'Email permission required' });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    facebookId,
                }
            });
        } else if (!user.facebookId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { facebookId }
            });
        }

        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token: jwtToken, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Facebook login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
