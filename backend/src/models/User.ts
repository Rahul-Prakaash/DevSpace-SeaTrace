import { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { authConnection } from '../config/authDatabase.js';

export interface IUserRegion {
    name: string;
    state: string;
    bbox: [number, number, number, number]; // [south, west, north, east]
}

export interface IUser {
    username: string;
    email: string;
    password: string;
    authProvider: 'local' | 'google';
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    region?: IUserRegion;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function (this: IUser) {
            return this.authProvider === 'local';
        },
        minlength: 6,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
        sparse: true,
    },
    displayName: String,
    avatarUrl: String,
    region: {
        type: {
            name: { type: String, required: true },
            state: { type: String, required: true },
            bbox: {
                type: [Number],
                validate: {
                    validator: (v: number[]) => v.length === 4,
                    message: 'bbox must have exactly 4 values [south, west, north, east]',
                },
            },
        },
        required: false,
        default: undefined,
    },
}, {
    timestamps: true,
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.authProvider !== 'local') {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

// Use the auth database connection, not the default
export const User = authConnection.model<IUser>('User', userSchema);
