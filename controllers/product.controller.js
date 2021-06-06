const Products = require('../models/products.model')
const Checkout = require('../models/checkout.model')
const Discount = require('../models/discount.model')

module.exports.getProducts = async (req, res) => {
    try {
        const feature = new APIfeature(Products.find(), req.query).filtering().sorting();
        const products = await feature.query;
        // let checkout = await Checkout.find();
        // let x = checkout.filter((item) => {
        //     return item.status === false;
        // })
        // await console.log(x.length);
        return res.json({
            status: "success",
            result: products.length,
            products: products
        });
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}
module.exports.createProduct = async (req, res) => {
    try {
        // console.log(req.body);
        const { title, prices, description, content, images, category, quantity, warranty, brand } = req.body;
        let discount = 0;
        const takeDiscount = await Discount.findOne({ category: category });
        if (takeDiscount && (new Date(takeDiscount.to) - new Date()) > 0) {
            discount = takeDiscount.discount;
        }
        // allDiscounts.map((discount) => {
        //     if (discount.category === category) {
        //         prices = prices + (prices * discount) / 100
        //     }
        // })
        if (!images) return res.status(400).json({ msg: "no images upload" });
        const product = await Products.findOne({ title: title });
        if (prices < 0) return res.status(400).json({ msg: "Form is not format" });
        if (quantity < 0) return res.status(400).json({ msg: "Form is not format" });
        if (product) return res.status(400).json({ msg: "This product already exist" });
        const newProduct = new Products({
            title: title.toLowerCase(), prices, description, content, images, category, quantity, warranty, brand, discount
        })
        await newProduct.save();
        res.json({ newProduct });
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}
module.exports.updateProduct = async (req, res) => {
    try {
        const { title, prices, description, content, images, category, quantity, warranty, brand } = req.body;

        if (!images) return res.status(400).json({ msg: "no images upload" });
        if (prices < 0) return res.status(400).json({ msg: "Form is not format" });
        if (quantity < 0) return res.status(400).json({ msg: "Form is not format" });
        await Products.findOneAndUpdate({ _id: req.params.id }, {
            title: title.toLowerCase(), prices, description, content, images, category, quantity, warranty, brand
        })

        res.json({ msg: "updated a product" });
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}
module.exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let checkout = await Checkout.find();
        let x = checkout.filter(item => item.status === false);
        const checkItem = x.find(item => {
            if (item.cart.length > 0) {
                const x = checkProducts(item.cart, id);

                console.log(x);
                return x;
            }
        })
        // let checkProduct = x.find(item => {
        //     console.log(checkProducts(item.cart, id));
        //     return checkProducts(item.cart, id);
        // })
        // console.log(checkProduct);
        if (checkItem) {
            return res.json({ msg: "Can not delete. Goods are being shipped" });
        }
        else {
            await Products.findByIdAndUpdate({ _id: req.params.id }, { isDelete: true });
            return res.json({ msg: "deleted a product" });
        }
    } catch (error) {
        return res.status(500).json({ msg: error })
    }
}

function checkProducts(arrCart, idProduct) {
    const x = arrCart.find(item => {
        return item._id === idProduct
    })
    return x;
}

class APIfeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filtering() {
        const queryObj = { ...this.queryString } //queryString = req.query
        //console.log({ before: queryObj });//before delete page...use pagination
        const excludeFields = ['page', 'sort', 'limit'];
        excludeFields.forEach(el => delete (queryObj[el]));
        //console.log({ after: queryObj }) //after delete page...
        let queryStr = JSON.stringify(queryObj);
        //console.log({ queryObj, queryStr });
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match);
        //gte >=
        //gt >
        //lt < || 
        //lte <=
        //regex = tim kiem
        //console.log({ queryObj, queryStr });
        this.query.find(JSON.parse(queryStr));
        return this;
    }
    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query.sort('-createdAt');
        }
        return this;
    }
    paginating() {
        // const x = Products.find();
        // console.log(x.length, 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        // console.log(this.query, '------------');
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}