const {Category} = require('../model/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categories = await Category.find();

    if(!categories) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categories);
})

router.get(`/:id`, async(req, res) => {
    const categoryList = await Category.findById(req.params.id);

    if(!categoryList){
        res.status(500).json({success: false, message: "category could not found"});
    }
    res.status(200).send(categoryList);
})

router.put(`/:id`, async (req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color 
        },
        {new:true}
    )
    if(!category)
        return res.status(200).send("Thge Category canot e created");
    res.send(category);
})

router.post(`/`, async (req, res) =>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });
    category = await category.save();
    
    if(!category)
        return res.status(200).send("Thge Category canot e created");
    res.send(category);
})

router.delete('/:id', async(req,res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({success: true, message: 'Category Deleted'})
        }else{
            return res.status(404).json({success: false, message: 'Category not Found'})
        }
    }).catch(err=>{
        return res.status(404).json({success: false, error: err})
    })
})

module.exports = router;