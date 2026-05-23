// asynchandler can be understood easily like a macro fn that returns the function wrapped in another
// like in another case I pass f(x) to hugher order fn g(x)
// const g(x) => {
//     h(x);
//     x = l(x);
//     return ((y)=> 2*x*y);
// }    
// returns a function that takes x, does some processing and then returns another function that takes y and does some processing with x and y 

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler };
