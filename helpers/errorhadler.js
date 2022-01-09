function errorHandler (err, req, res, next){
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message: 'User is Unauthorized'});
    }
    if(err.name === 'ValidationError'){
        return res.status(401).json(err);
    }

    return res.status(500).json(err)
}
module.exports = errorHandler
