import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IApartmentModel extends mongoose.Document {
    description: string;
    originalLink: string;
    listedAt: Date;
    expiresAt: Date;
    status?: string;
    commentc?: string;
    key: string;
    source: string;
}

const schema = new Schema({
    description : String,
    originalLink : String,
    listedAt: Date,
    expiresAt: Date,
    status: String,
    comment: String,
    key: String,
    source: String
});

export const Apartment = mongoose.model<IApartmentModel>("Apartment", schema);