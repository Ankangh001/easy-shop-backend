const {User} = require('../model/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.post(`/`, async (req,res) => {
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        passwordHash : bcrypt.hashSync(req.body.password, 10),
        phone : req.body.phone,
        street : req.body.street,
        apartment : req.body.apartment,
        city : req.body.city,
        zip : req.body.zip,
        country : req.body.country,
        isAdmin : req.body.isAdmin
    })
    user = await user.save();
    if(!user){
        return res.status(500).json({ success: false, message: 'user cannot be created'})
    }
    res.send(user)
})

router.post(`/register`, async (req,res) => {
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        passwordHash : bcrypt.hashSync(req.body.password, 10),
        phone : req.body.phone,
        street : req.body.street,
        apartment : req.body.apartment,
        city : req.body.city,
        zip : req.body.zip,
        country : req.body.country,
        isAdmin : req.body.isAdmin
    })
    user = await user.save();
    if(!user){
        return res.status(500).json({ success: false, message: 'user cannot be created'})
    }
    res.send(user)
})


router.get(`/:id`, async(req, res) => {
    const singleUser = await User.findById(req.params.id).select('-passwordHash');

    if(!singleUser){
        res.status(500).json({success: false, message: "user could not be found"});
    }
    res.status(200).send(singleUser);
})

router.post(`/login`, async (req,res) => {
    const user = await User.findOne({email : req.body.email});
    const secret = process.env.secret;
    if(!user){
        return res.status(400).send("User not found");
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId : user.id,
                isAdmin : user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({email : user.email, token: token})
    }
    res.status(400).send('User Authetication failed')
})

router.get(`/get/count`, async (req,res)=>{
    const userCount = await User.countDocuments();
    if(!userCount){
        return res.status(404).json({success: false})
    }
        res.send({
            userCount: userCount
        })   
})

router.delete('/:id', async(req,res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user){
            return res.status(200).json({success: true, message: 'user Deleted'})
        }else{
            return res.status(404).json({success: false, message: 'user not Found'})
        }
    }).catch(err=>{
        return res.status(404).json({success: false, error: err})
    })
})

module.exports =router;