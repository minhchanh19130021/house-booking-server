import Home from "../models/Home";


export const getHome = async (req,res,next)=>{
  try {
    const user = await Home.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export const getHomes = async (req,res,next)=>{
  try {
    const users = await Home.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}



