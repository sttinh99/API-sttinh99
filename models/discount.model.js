const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema({
    category: {
        type: String,
    },
    discount: {
        type: Number,
        default: 0
    },
    from: {
        type: Date,
        default: Date.now()
    },
    to: {
        type: Date
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Discount", discountSchema);
