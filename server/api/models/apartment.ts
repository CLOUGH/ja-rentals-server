import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IApartmentModel extends mongoose.Document {
    description: string;
    originalLink: string;
    listedAt?: Date;
    expiresAt?: Date;
    status?: string;
    key?: string;
}

const schema = new Schema({
    description : String,
    originalLink : String,
    listedAt: Date,
    expiresAt: Date,
    status: String,
    key: String,
});

export const Apartment = mongoose.model<IApartmentModel>("Apartment", schema);