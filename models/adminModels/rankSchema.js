import mongoose from 'mongoose';

const RankSchema = new mongoose.Schema({
    rank: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum', 'None'],
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' }
});

const Rank = mongoose.model('Rank', RankSchema);

export default Rank;
