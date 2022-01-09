const express = require('express');
const router = express.Router();
const { Product } = require('../model/product');
const { Category } = require('../model/category');
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const filename = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${filename}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

//All products
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const products = await Product.find({ filter }).populate('category');
    if (!products) {
        res.status(500).json({
            success: false
        })
    }
    res.send(products)
});

router.get(`/:id`, async (req, res) => {
    const singleProduct = await Product.findById(req.params.id).populate('category');
    if (!singleProduct) {
        return res.status(500).json({ success: false, message: "prodcut not found" });
    }
    res.send(singleProduct)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);
    if (!category) { return res.status(400).send("category invalid ") }

    const file = req.file;
    if (!file) { return res.status(400).send("No image found in the request") }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInSTock: req.body.countInSTock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isfeatured: req.body.isfeatured
    })
    product.save();
    if (!product) {
        return res.status(500).send("Product cannot be created")
    }
    res.send(product);
});

router.put(`/:id`, uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product ID")
    }
    const category = await Category.findById(req.body.category);
    if (!category) { return res.status(400).send("category invalid ") }

    const prodcut = await Product.findById(req.params.id);
    if (!prodcut) { return res.status(400).send("Invalid product id") }

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = prodcut.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInSTock: req.body.countInSTock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isfeatured: req.body.isfeatured
        },
        { new: true }
    )
    if (!updatedProduct)
        return res.status(200).send("Thge Product cannot be updated");
    res.send(updatedProduct);
})

router.delete('/:id', async (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'product Deleted' })
        } else {
            return res.status(404).json({ success: false, message: 'product not Found' })
        }
    }).catch(err => {
        return res.status(404).json({ success: false, error: err })
    })
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        return res.status(404).json({ success: false })
    }
    res.send({
        productCount: productCount
    })

})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isfeatured: true }).limit(+count);
    if (!products) {
        return res.status(404).json({ success: false })
    }
    res.send(products);
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;