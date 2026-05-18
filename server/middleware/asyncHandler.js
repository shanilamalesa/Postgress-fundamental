// server/middleware/asyncHandler.js

//is the reson why controllers will ot have try and catch block

//used to catch async errors

//fn->
//(req, res, next)->
//fn->exacute the controller
module.exports = (fn) => (req, res, next) => {
    //wrap it in promise.resolve ->normal return values and ensures that both asyncworks
  Promise.resolve(fn(req, res, next)).catch(next);
};