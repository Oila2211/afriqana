import asyncHandler from "../middleware/asyncHandler.js";
import Product from '../models/productModel.js'

// @desc Fetch all products
// @route GET /api/products
// @access Public
// const getProducts = asyncHandler(async (req, res) => {
//     const pageSize = 2;
//     const page = Number(req.query.pageNumber) || 1;
//     const count = await Product.countDocuments();


//     const products = await Product.find({});
//       .limit
//       .skip(pageSize * (page - 1));
//     res.json({products, page, pages: Math.ceil( count/ pageSize)});
// });



// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});



// @desc Fetch a products
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if(product) {
        return res.json(product);
    } else {
        res.status(404);
        throw new Error('Resource not found')
    }
});

// @desc Create a product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
      name = 'Sample name',
      price = 0,
      image = '/images/puff-puff.jpg',
      category = 'Sample category',
      stock = false,
      description = 'Sample description'
  } = req.body;

  const product = new Product({
      name,
      price,
      user: req.user._id,
      image,
      category,
      stock,
      description
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});


// @desc Update a products
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, 
    stock } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.image = image;
      product.category = category;
      product.stock = stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error ('Resource not found')
    }
});

// @desc Delete a products
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({_id: product._id});
      res.status(200).json({ message: 'Product deleted'});
      res.json({ message: 'Product removed'})
    } else {
      res.status(404);
      throw new Error ('Resource not found');
    }
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct }
